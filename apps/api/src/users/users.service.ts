import { Injectable } from "@nestjs/common";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { DatabaseService } from "../database/database.service";
@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) { }

  create(createUserInput: CreateUserInput) {
    this.drizzle
    return "This action adds a new user";
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
