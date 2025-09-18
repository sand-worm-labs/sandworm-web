import type { AdapterSession, AdapterUser } from "next-auth/adapters";

import {
  type ServiceResult,
  DataResult,
  db,
  toResult,
} from "@/services/postgress/db";

import { UserService } from "./UserService";

export class SessionService {
  static async createSession(
    userId: string,
    sessionToken: string,
    expires: Date
  ): Promise<ServiceResult<AdapterSession>> {
    try {
      const sessionRef = await db.sessions.add(() => ({
        userId,
        sessionToken,
        expires,
      }));

      const sessionSnapshot = await db.sessions.get(sessionRef.id);
      if (!sessionSnapshot) {
        return DataResult.failure(
          "Failed to retrieve created session.",
          "DB_RETRIEVAL_ERROR"
        );
      }

      return DataResult.success(toResult<AdapterSession>(sessionSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Failed to create session.",
        "DB_INSERT_ERROR",
        error
      );
    }
  }

  static async getSessionAndUser(
    sessionToken: string
  ): Promise<ServiceResult<{ session: AdapterSession; user: AdapterUser }>> {
    try {
      const sessionsSnap = await db.sessions.query($ =>
        $.field("sessionToken").eq(sessionToken)
      );

      if (sessionsSnap.length === 0)
        return DataResult.failure("Session not found.", "NOT_FOUND");

      const sessionDoc = sessionsSnap[0];
      const session = sessionDoc.data;

      if (new Date(session.expires) < new Date()) {
        await db.sessions.remove(sessionDoc.ref.id);
        return DataResult.failure("Session expired.", "SESSION_EXPIRED");
      }

      const userResult = await UserService.findUserById(session.userId);

      if (!userResult.success)
        return DataResult.failure("User not found.", "NOT_FOUND");

      const userData = userResult.data;

      return DataResult.success({
        session: {
          userId: session.userId,
          sessionToken: session.sessionToken,
          expires: session.expires,
        },
        user: {
          id: userData.id || "",
          email: userData.email,
          emailVerified: userData.emailVerified || null,
          name: userData.name || userData.username,
          image: userData.image,
        },
      });
    } catch (error) {
      return DataResult.failure(
        "Failed to get session and user.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async updateSession(
    sessionToken: string,
    data: Partial<AdapterSession>
  ): Promise<ServiceResult<AdapterSession>> {
    try {
      const sessionsSnap = await db.sessions.query($ =>
        $.field("sessionToken").eq(sessionToken)
      );

      if (sessionsSnap.length === 0)
        return DataResult.failure("Session not found.", "NOT_FOUND");

      const sessionDoc = sessionsSnap[0];
      await db.sessions.update(sessionDoc.ref.id, data);

      const updatedSession = {
        ...sessionDoc.data,
        ...data,
      };

      return DataResult.success({
        userId: updatedSession.userId,
        sessionToken: updatedSession.sessionToken,
        expires: updatedSession.expires,
      });
    } catch (error) {
      return DataResult.failure(
        "Failed to update session.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async deleteSession(
    sessionToken: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const sessionsSnap = await db.sessions.query($ =>
        $.field("sessionToken").eq(sessionToken)
      );

      if (sessionsSnap.length === 0) return DataResult.success(true);

      await db.sessions.remove(sessionsSnap[0].ref.id);
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete session.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      const expiredSessions = await db.sessions.query($ =>
        $.field("expires").lt(now)
      );

      const deletePromises = expiredSessions.map(session =>
        db.sessions.remove(session.ref.id)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clean expired sessions:", error);
    }
  }
}
