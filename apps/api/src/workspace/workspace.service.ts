import { Injectable } from "@nestjs/common";
import { CreateWorkspaceInput } from "./dto/create-workspace.input";
import { UpdateWorkspaceInput } from "./dto/update-workspace.input";

@Injectable()
export class WorkspaceService {
  create(createWorkspaceInput: CreateWorkspaceInput) {
    return "This action adds a new workspace";
  }

  findAll() {
    return `This action returns all workspace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  update(id: number, updateWorkspaceInput: UpdateWorkspaceInput) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
