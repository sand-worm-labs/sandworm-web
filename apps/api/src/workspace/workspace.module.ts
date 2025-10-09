import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceResolver } from "./workspace.resolver";

@Module({
  providers: [WorkspaceResolver, WorkspaceService],
})
export class WorkspaceModule {}
