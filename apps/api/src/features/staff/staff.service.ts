import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';

// The Sandworm team: people who can edit an official workspace, the same people whose
// notebooks may appear on the Showcase at all. Shared by the internal tools (the Showcase
// studio, the terminal's team side) so there is one answer to "is this staff?".
@Injectable()
export class StaffService {
  private readonly officialWorkspaceIds: string[];

  constructor(
    config: ConfigService,
    private readonly workspaceMembershipService: WorkspaceMembershipService,
  ) {
    this.officialWorkspaceIds = (
      config.get<string>('SHOWCASE_OFFICIAL_WORKSPACE_IDS') ?? ''
    )
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  async isStaff(userId?: string): Promise<boolean> {
    if (!userId) return false;

    for (const workspaceId of this.officialWorkspaceIds) {
      try {
        await this.workspaceMembershipService.assertCanEdit(
          workspaceId,
          userId,
        );
        return true;
      } catch {
        // Not in this one: try the next.
      }
    }
    return false;
  }

  async assertStaff(userId: string | undefined, message: string): Promise<void> {
    if (!(await this.isStaff(userId))) throw new ForbiddenException(message);
  }
}
