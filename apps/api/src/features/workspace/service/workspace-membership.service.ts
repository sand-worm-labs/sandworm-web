import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Equal, Or, Repository } from 'typeorm';
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
import { WorkspaceMember } from '../model/workspace-info.model';

interface InvitationPayload {
    workspaceId: string;
    userId: string;
    inviterId: string;
    role: UserWorkspaceRole;
}

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



    private async getWorkspaceOrThrow(
        workspaceId: string,
        relations?: string[],
    ): Promise<WorkspaceEntity> {
        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
            relations,
        });
        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }
        return workspace;
    }

    private async getUserByEmailOrThrow(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new NotFoundException('User with this email does not exist');
        }
        return user;
    }

    private async getUserOrThrow(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    private async validateAdminAccess(workspaceId: string, adminId: string): Promise<void> {
        const membership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId: adminId, status: UserWorkspaceStatus.ACTIVE },
        });

        if (!membership || membership.role !== UserWorkspaceRole.ADMIN) {
            throw new BadRequestException('Only workspace admins can perform this action');
        }
    }

    private async validateNotOwner(workspaceId: string, userId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
        });
        if (workspace?.ownerId === userId) {
            throw new BadRequestException('Cannot perform this action on workspace owner');
        }
    }

    private async getMembershipOrThrow(
        workspaceId: string,
        userId: string,
        status: UserWorkspaceStatus,
        errorMessage: string,
    ): Promise<UserWorkspaceEntity> {
        const membership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId, status },
        });
        if (!membership) {
            throw new NotFoundException(errorMessage);
        }
        return membership;
    }

    private async getExistingMembership(
        workspaceId: string,
        userId: string,
    ): Promise<UserWorkspaceEntity | null> {
        return this.workspaceMembersRepository.findOne({
            where: {
                workspaceId,
                userId,
                status: Or(Equal(UserWorkspaceStatus.ACTIVE), Equal(UserWorkspaceStatus.PENDING)),
            },
        });
    }

    private async verifyInvitationHash(hash: string): Promise<InvitationPayload> {
        const authConfig = this.configService.getOrThrow('auth', { infer: true });
        try {
            return await this.jwtService.verifyAsync<InvitationPayload>(hash, {
                secret: authConfig.confirmEmailSecret,
            });
        } catch {
            throw new UnprocessableEntityException('Invalid or expired invitation');
        }
    }

    private async createInvitationHash(payload: InvitationPayload): Promise<string> {
        const authConfig = this.configService.getOrThrow('auth', { infer: true });
        return this.jwtService.signAsync(payload, {
            secret: authConfig.confirmEmailSecret,
            expiresIn: '7d',
        });
    }

    private mapToWorkspaceMembers(memberships: UserWorkspaceEntity[]): WorkspaceMember[] {
        return memberships.map((membership) => {
            const workspaceMember = new WorkspaceMember();
            workspaceMember.userId = membership.userId;
            workspaceMember.role = membership.role;
            workspaceMember.user = membership.user ? User.fromEntity(membership.user) : undefined;
            return workspaceMember;
        });
    }

    private createMembership(
        userId: string,
        workspaceId: string,
        role: UserWorkspaceRole,
        status: UserWorkspaceStatus,
        inviterId: string | null = null,
    ): UserWorkspaceEntity {
        return this.workspaceMembersRepository.create({
            userId,
            workspaceId,
            role,
            inviterId,
            status,
        });
    }

    async inviteUserToWorkspace(
        workspaceId: string,
        email: string,
        inviterId: string,
        role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(inviterId, 'Inviter ID');
        validateNonEmptyString(email, 'Email');

        const workspace = await this.getWorkspaceOrThrow(workspaceId);
        await this.validateAdminAccess(workspaceId, inviterId);

        const invitedUser = await this.getUserByEmailOrThrow(email);

        if (invitedUser.id === inviterId) {
            throw new BadRequestException('You cannot invite yourself');
        }

        const existingMembership = await this.getExistingMembership(workspaceId, invitedUser.id);
        if (existingMembership) {
            throw new BadRequestException('User is already a member of this workspace');
        }
        const hash = await this.createInvitationHash({
            workspaceId,
            userId: invitedUser.id,
            inviterId,
            role,
        });
        const inviter = await this.getUserOrThrow(inviterId);
        await this.mailService.workspaceInvitation({
            to: email,
            data: {
                hash,
                workspaceName: workspace.name,
                inviterName: inviter.firstName || 'Someone',
            },
        });
    }

    async acceptWorkspaceInvitation(hash: string): Promise<void> {
        const { workspaceId, userId, inviterId, role } = await this.verifyInvitationHash(hash);

        await this.getWorkspaceOrThrow(workspaceId);

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

        const membership = this.createMembership(userId, workspaceId, role, UserWorkspaceStatus.ACTIVE, inviterId);
        await this.workspaceMembersRepository.save(membership);
    }

    async getInvitationInfo(hash: string): Promise<{
        workspace: Workspace;
        inviter: User;
        invitedUser: User;
        role: UserWorkspaceRole;
    }> {
        const { workspaceId, userId, inviterId, role } = await this.verifyInvitationHash(hash);
        const [workspace, inviter, invitedUser] = await Promise.all([
            this.getWorkspaceOrThrow(workspaceId),
            this.getUserOrThrow(inviterId),
            this.getUserOrThrow(userId),
        ]);
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

    async joinWorkspace(
        workspaceId: string,
        email: string,
        role: UserWorkspaceRole = UserWorkspaceRole.VIEWER,
    ): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateNonEmptyString(email, 'Email');
        const workspace = await this.getWorkspaceOrThrow(workspaceId, ['owner']);
        const user = await this.getUserByEmailOrThrow(email);
        const existingMembership = await this.getExistingMembership(workspaceId, user.id);
        if (existingMembership) {
            throw new BadRequestException('User is already a member of this workspace');
        }
        const membership = this.createMembership(user.id, workspaceId, role, UserWorkspaceStatus.PENDING);
        await this.workspaceMembersRepository.save(membership);
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

    async getWorkspaceMembers(workspaceId: string, userId: string): Promise<WorkspaceMember[]> {
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

        return this.mapToWorkspaceMembers(memberships);
    }

    async getPendingInvites(workspaceId: string, adminId: string): Promise<WorkspaceMember[]> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(adminId, 'Admin ID');

        await this.validateAdminAccess(workspaceId, adminId);

        const memberships = await this.workspaceMembersRepository.find({
            where: { workspaceId, status: UserWorkspaceStatus.PENDING },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        return this.mapToWorkspaceMembers(memberships);
    }

    async acceptPendingInvite(workspaceId: string, userId: string, adminId: string): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        await this.validateAdminAccess(workspaceId, adminId);

        const membership = await this.getMembershipOrThrow(
            workspaceId,
            userId,
            UserWorkspaceStatus.PENDING,
            'No pending invite found for this user',
        );

        membership.status = UserWorkspaceStatus.ACTIVE;
        membership.inviterId = adminId;
        await this.workspaceMembersRepository.save(membership);
    }

    async rejectPendingInvite(workspaceId: string, userId: string, adminId: string): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        await this.validateAdminAccess(workspaceId, adminId);

        const membership = await this.getMembershipOrThrow(
            workspaceId,
            userId,
            UserWorkspaceStatus.PENDING,
            'No pending invite found for this user',
        );

        await this.workspaceMembersRepository.remove(membership);
    }

    async removeUserFromWorkspace(workspaceId: string, userId: string, adminId: string): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        await this.validateAdminAccess(workspaceId, adminId);
        await this.validateNotOwner(workspaceId, userId);

        const membership = await this.getMembershipOrThrow(
            workspaceId,
            userId,
            UserWorkspaceStatus.ACTIVE,
            'User is not a member of this workspace',
        );

        await this.workspaceMembersRepository.remove(membership);
    }

    async softRemoveUserFromWorkspace(workspaceId: string, userId: string, adminId: string): Promise<void> {
        validateUUID(workspaceId, 'Workspace ID');
        validateUUID(userId, 'User ID');
        validateUUID(adminId, 'Admin ID');

        await this.validateAdminAccess(workspaceId, adminId);
        await this.validateNotOwner(workspaceId, userId);

        const membership = await this.workspaceMembersRepository.findOne({
            where: { workspaceId, userId },
        });

        if (!membership) {
            throw new NotFoundException('User is not a member of this workspace');
        }

        membership.status = UserWorkspaceStatus.REMOVED;
        await this.workspaceMembersRepository.save(membership);
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

        await this.validateAdminAccess(workspaceId, adminId);
        await this.validateNotOwner(workspaceId, targetUserId);

        const membership = await this.getMembershipOrThrow(
            workspaceId,
            targetUserId,
            UserWorkspaceStatus.ACTIVE,
            'User is not an active member of this workspace',
        );

        membership.role = newRole;
        await this.workspaceMembersRepository.save(membership);
    }
}