import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { users } from "@sandworm/database";

import type { SandwormDatabase } from "@sandworm/database/types";

import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { DB_CONNECTION } from "../../constants";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION) private conn: SandwormDatabase,
  ) { }

  async create(createUserInput: CreateUserInput) {
    return await this.conn.insert(users)
      .values(createUserInput)
      .returning();
  }

  async findAll() {
    return await this.conn.select().from(users);
  }

  async findOne(id: string) {
    return await this.conn.select().from(users).where(eq(users.id, id));
  }


  async update(id: string, updateUserInput: UpdateUserInput) {
    return await this.conn.update(users)
      .set(updateUserInput)
      .where(eq(users.id, id))
      .returning();
  }

  async remove(id: string) {
    return await this.conn.delete(users)
      .where(eq(users.id, id))
      .returning();
  }
}

