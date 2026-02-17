import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Equal,  Or, Repository } from 'typeorm';
import {
    WorkspaceEntity,
    UserWorkspaceEntity,
    UserEntity,
    UserWorkspaceRole,
    UserWorkspaceStatus,
} from '@sandworm/postgresql-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { MailService } from '@/infrastructure/mail/mail.service';
import { Workspace } from '../model/workspace.model';
import { User } from '../../user/model/graphql/user.model';
import {
    validateUUID,
    validateNonEmptyString,    
} from '@/common/utils/uuid';
import {  WorkspaceMember } from '../model/workspace-info.model';

@Injectable()
export class WorkspaceMembershipService {
    private readonly logger = new Logger(WorkspaceMembershipService.name);

    constructor(
        @InjectRepository(WorkspaceEntity)
        private readonly workspaceRepository: Repository<WorkspaceEntity>,
        @InjectRepository(UserWorkspaceEntity)
        private readonly workspaceMembersRepository: Repository<UserWorkspaceEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService<AllConfigType>,
    ) { }

     async inviteUserToWorkspace(
        workspaceId: string,
        email: string,
        inviterId: string,
        role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(inviterId, 'Inviter ID');
        validateNonEmptyString(email, 'Email');

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        const inviterMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: inviterId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!inviterMembership || inviterMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can invite users');
        }

        const invitedUser = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!invitedUser) {
            throw new NotFoundException('User with this email does not exist');
        }

        if (invitedUser.id === inviterId) {
            throw new BadRequestException('You cannot invite yourself');
        }

        const existingMembership = await this.workspaceMembersRepository.findOne({
            where: {
                workspaceId,
                userId: invitedUser.id,
                status: Or(Equal(UserWorkspaceStatus.ACTIVE), Equal(UserWorkspaceStatus.PENDING)),
            },
        });

        if (existingMembership) {
            throw new BadRequestException('User is already a member of this workspace');
        }

        const authConfig = this.configService.getOrThrow('auth', { infer: true });
        const hash = await this.jwtService.signAsync(
            {
                workspaceId,
                userId: invitedUser.id,
                inviterId,
                role,
            },
            {
                secret: authConfig.confirmEmailSecret,
                expiresIn: '7d',
            },
        );

        const inviter = await this.userRepository.findOne({ where: { id: inviterId } });

        await this.mailService.workspaceInvitation({
            to: email,
            data: {
                hash,
                workspaceName: workspace.name,
                inviterName: inviter?.firstName || 'Someone',
            },
        });
    }

    async acceptWorkspaceInvitation(hash: string): Promise<void> {
        const authConfig = this.configService.getOrThrow('auth', { infer: true });

        let workspaceId: string;
        let userId: string;
        let inviterId: string;
        let role: UserWorkspaceRole;

        try {
            const jwtData = await this.jwtService.verifyAsync<{
                workspaceId: string;
                userId: string;
                inviterId: string;
                role: UserWorkspaceRole;
            }>(hash, {
                secret: authConfig.confirmEmailSecret,
            });

            workspaceId = jwtData.workspaceId;
            userId = jwtData.userId;
            inviterId = jwtData.inviterId;
            role = jwtData.role;
        } catch {
            throw new UnprocessableEntityException('Invalid or expired invitation');
        }

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        const existingMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId },
        });

        if (existingMembership) {
            if (existingMembership.status === UserWorkspaceStatus.ACTIVE) {
                throw new BadRequestException('User is already a member of this workspace');
            }

            existingMembership.status = UserWorkspaceStatus.ACTIVE;
            existingMembership.role = role;
            existingMembership.inviterId = inviterId;
            await this.workspaceMembersRepository.save(existingMembership);
            return;
        }

        const userWorkspace = this.workspaceMembersRepository.create({
            userId,
            workspaceId,
            role,
            inviterId,
            status: UserWorkspaceStatus.ACTIVE,
        });

        await this.workspaceMembersRepository.save(userWorkspace);
    }

    async getInvitationInfo(hash: string): Promise<{
        workspace: Workspace;
        inviter: User;
        invitedUser: User;
        role: UserWorkspaceRole;
    }> {
        const authConfig = this.configService.getOrThrow('auth', { infer: true });

        let workspaceId: string;
        let userId: string;
        let inviterId: string;
        let role: UserWorkspaceRole;

        try {
            const jwtData = await this.jwtService.verifyAsync<{
                workspaceId: string;
                userId: string;
                inviterId: string;
                role: UserWorkspaceRole;
            }>(hash, {
                secret: authConfig.confirmEmailSecret,
            });

            workspaceId = jwtData.workspaceId;
            userId = jwtData.userId;
            inviterId = jwtData.inviterId;
            role = jwtData.role;
        } catch {
            throw new UnprocessableEntityException('Invalid or expired invitation');
        }

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        const inviter = await this.userRepository.findOne({
            where: { id: inviterId },
        });

        if (!inviter) {
            throw new NotFoundException('Inviter not found');
        }

        const invitedUser = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!invitedUser) {
            throw new NotFoundException('Invited user not found');
        }

        const existingMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (existingMembership) {
            throw new BadRequestException('User is already a member of this workspace');
        }

        return {
            workspace: Workspace.fromEntity(workspace),
            inviter: User.fromEntity(inviter),
            invitedUser: User.fromEntity(invitedUser),
            role,
        };
    }

    async removeUserFromWorkspace(
        workspaceId: string,
        userIdToRemove: string,
        adminId: string,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userIdToRemove, 'User ID to remove');
        validateUUID(adminId, 'Admin ID');

        const adminMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can remove users');
        }

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });

        if (workspace?.ownerId === userIdToRemove) {
            throw new BadRequestException('Cannot remove workspace owner');
        }

        const membership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: userIdToRemove, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!membership) {
            throw new NotFoundException('User is not a member of this workspace');
        }

        await this.workspaceMembersRepository.remove(membership);
    }

    async updateMemberRole(
        workspaceId: string,
        targetUserId: string,
        adminId: string,
        newRole: UserWorkspaceRole,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(targetUserId, 'Target User ID');
        validateUUID(adminId, 'Admin ID');

        if (targetUserId === adminId) {
            throw new BadRequestException('You cannot change your own role');
        }

        const adminMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can change roles');
        }

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });

        if (workspace?.ownerId === targetUserId) {
            throw new BadRequestException('Cannot change workspace owner role');
        }

        const targetMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: targetUserId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!targetMembership) {
            throw new NotFoundException('User is not an active member of this workspace');
        }

        targetMembership.role = newRole;
        await this.workspaceMembersRepository.save(targetMembership);
    }

    async getWorkspaceMembers(
        workspaceId: string,
        userId: string,
    ): Promise<WorkspaceMember[]> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');

        const membership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!membership) {
            return [];
        }

        const memberships = await this.workspaceMembersRepository.find({
            where: { workspaceId, status: UserWorkspaceStatus.ACTIVE },
            relations: ['user'],
        });

        return memberships.map((membership) => {
            const workspaceMember = new WorkspaceMember();
            workspaceMember.userId = membership.userId;
            workspaceMember.role = membership.role;
            workspaceMember.user = membership.user ? User.fromEntity(membership.user) : undefined;
            return workspaceMember;
        });
    }

    async joinWorkspace(
        workspaceId: string,
        email: string,
        role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateNonEmptyString(email, 'Email');

        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
            relations: ['owner'],
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new NotFoundException('User with this email does not exist');
        }

        const existingMembership = await this.workspaceMembersRepository.findOne({
            where: {
                workspaceId,
                userId: user.id,
                status: Or(Equal(UserWorkspaceStatus.ACTIVE), Equal(UserWorkspaceStatus.PENDING)),
            },
        });

        if (existingMembership) {
            throw new BadRequestException('User is already a member of this workspace');
        }

        const userWorkspace = this.workspaceMembersRepository.create({
            userId: user.id,
            workspaceId,
            role,
            inviterId: null,
            status: UserWorkspaceStatus.PENDING,
        });

        await this.workspaceMembersRepository.save(userWorkspace);

        await this.mailService.workspaceJoinRequest({
            to: workspace.owner.email,
            data: {
                userName: user.firstName || user.email,
                userEmail: user.email,
                workspaceName: workspace.name,
                workspaceId: workspace.id,
                role,
            },
        });
    }

    async getPendingInvites(
        workspaceId: string,
        adminId: string,
    ): Promise<WorkspaceMember[]> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(adminId, 'Admin ID');

        const adminMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can view pending invites');
        }

        const pendingMemberships = await this.workspaceMembersRepository.find({
            where: { workspaceId, status: UserWorkspaceStatus.PENDING },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        return pendingMemberships.map((membership) => {
            const workspaceMember = new WorkspaceMember();
            workspaceMember.userId = membership.userId;
            workspaceMember.role = membership.role;
            workspaceMember.user = membership.user ? User.fromEntity(membership.user) : undefined;
            return workspaceMember;
        });
    }

    async acceptPendingInvite(
        workspaceId: string,
        userId: string,
        adminId: string,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        const adminMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can accept invites');
        }

        const pendingMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId, status: UserWorkspaceStatus.PENDING },
        });

        if (!pendingMembership) {
            throw new NotFoundException('No pending invite found for this user');
        }

        pendingMembership.status = UserWorkspaceStatus.ACTIVE;
        pendingMembership.inviterId = adminId;
        await this.workspaceMembersRepository.save(pendingMembership);
    }

    async rejectPendingInvite(
        workspaceId: string,
        userId: string,
        adminId: string,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        const adminMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!adminMembership || adminMembership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can reject invites');
        }

        const pendingMembership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId, status: UserWorkspaceStatus.PENDING },
        });

        if (!pendingMembership) {
            throw new NotFoundException('No pending invite found for this user');
        }

        await this.workspaceMembersRepository.remove(pendingMembership);
    }
}