import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";
import type { PartialDeep } from "type-fest";

import { SandwormDatabase } from "../type";

export class UserModel {
  static createUser = async (db: SandwormDatabase, params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, params.id),
      });
      if (!!user) return { duplicate: true };
    }

    const [user] = await db
      .insert(users)
      .values({ ...params })
      .returning();

    return { duplicate: false, user };
  };

  static deleteUser = async (db: LobeChatDatabase, id: string) => {
    return db.delete(users).where(eq(users.id, id));
  };

  static findById = async (db: LobeChatDatabase, id: string) => {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByEmail = async (db: LobeChatDatabase, email: string) => {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  };
}
