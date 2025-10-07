import { eq } from "drizzle-orm";

import { users, userSettings } from "../schemas";
import type { NewUser, UserItem, UserSettingsItem } from "../schemas";
import type { SandwormDatabase } from "../types/db";

export class UserModel {
  private userId: string;

  private db: SandwormDatabase;

  constructor(db: SandwormDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  updateUser = async (value: Partial<UserItem>) => {
    return this.db
      .update(users)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(users.id, this.userId));
  };

  getUserSettings = async () => {
    return this.db.query.userSettings.findFirst({
      where: eq(userSettings.id, this.userId),
    });
  };

  deleteSetting = async () => {
    return this.db.delete(userSettings).where(eq(userSettings.id, this.userId));
  };

  updateSetting = async (value: Partial<UserSettingsItem>) => {
    return this.db
      .insert(userSettings)
      .values({
        id: this.userId,
        ...value,
      })
      .onConflictDoUpdate({
        set: value,
        target: userSettings.id,
      });
  };

  // Static method
  static makeSureUserExist = async (db: SandwormDatabase, userId: string) => {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  };

  static createUser = async (db: SandwormDatabase, params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, params.id),
      });
      if (user) return { duplicate: true };
    }

    const [user] = await db
      .insert(users)
      .values({ ...params })
      .returning();

    return { duplicate: false, user };
  };

  static deleteUser = async (db: SandwormDatabase, id: string) => {
    return db.delete(users).where(eq(users.id, id));
  };

  static findById = async (db: SandwormDatabase, id: string) => {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByEmail = async (db: SandwormDatabase, email: string) => {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  };
}
