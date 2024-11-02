import { eq, lte } from "drizzle-orm";
import { IcedGateUsers, type IcedGateUser } from "../db/schema/user.ts";
import { IcedGateSessions, type IcedGateSession } from "../db/schema/session.ts";
import type { MySqlDatabase } from "drizzle-orm/mysql-core";
import type { Adapter } from "./database.ts";

export class DrizzleMySQLAdapter implements Adapter {
  private db: MySqlDatabase<any, any, any>;

  constructor(
    db: MySqlDatabase<any, any, any>,
  ) {
    this.db = db;
  }

  public async deleteSession(sessionId: IcedGateSession["id"]): Promise<void> {
    await this.db.delete(IcedGateSessions).where(eq(IcedGateSessions.id, sessionId));
  }

  public async deleteUserSessions(userId: IcedGateUser["id"]): Promise<void> {
    await this.db.delete(IcedGateSessions).where(eq(IcedGateSessions.userId, userId));
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: IcedGateSession | undefined, user: IcedGateUser | undefined]> {
    const result = await this.db
      .select({
        user: IcedGateUsers,
        session: IcedGateSessions,
      })
      .from(IcedGateSessions)
      .innerJoin(IcedGateUsers, eq(IcedGateSessions.userId, IcedGateUsers.id))
      .where(eq(IcedGateSessions.id, sessionId));
    if (result.length !== 1) {
      return [ undefined, undefined ];
    }
    return [
      result[0].session,
      result[0].user,
    ];
  }

  public async getUserSessions(userId: IcedGateUser["id"]): Promise<IcedGateSession[]> {
    return this.db
      .select()
      .from(IcedGateSessions)
      .where(eq(IcedGateSessions.userId, userId));
  }

  public async setSession(session: IcedGateSession): Promise<void> {
    await this.db.insert(IcedGateSessions).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    });
  }

  public async updateSessionExpiration(sessionId: IcedGateSession["id"], expiresAt: IcedGateSession["expiresAt"]): Promise<void> {
    await this.db
      .update(IcedGateSessions)
      .set({
        expiresAt,
      })
      .where(eq(IcedGateSessions.id, sessionId));
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(IcedGateSessions).where(lte(IcedGateSessions.expiresAt, new Date()));
  }
}
