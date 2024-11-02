import { eq, lte } from "drizzle-orm";
import { IcedGateUsersTable, type IcedGateUser } from "../db/schema/user.ts";
import { IcedGateSessionsTable, type IcedGateSession } from "../db/schema/session.ts";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { Adapter } from "./database.ts";

export class DrizzlePostgreSQLAdapter implements Adapter {
  private db: PgDatabase<any, any, any>;

  constructor(
    db: PgDatabase<any, any, any>,
  ) {
    this.db = db;
  }

  public async deleteSession(sessionId: IcedGateSession["id"]): Promise<void> {
    await this.db.delete(IcedGateSessionsTable).where(eq(IcedGateSessionsTable.id, sessionId));
  }

  public async deleteUserSessions(userId: IcedGateUser["id"]): Promise<void> {
    await this.db.delete(IcedGateSessionsTable).where(eq(IcedGateSessionsTable.userId, userId));
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: IcedGateSession | undefined, user: IcedGateUser | undefined]> {
    const result = await this.db
      .select({
        user: IcedGateUsersTable,
        session: IcedGateSessionsTable,
      })
      .from(IcedGateSessionsTable)
      .innerJoin(IcedGateUsersTable, eq(IcedGateSessionsTable.userId, IcedGateUsersTable.id))
      .where(eq(IcedGateSessionsTable.id, sessionId));
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
      .from(IcedGateSessionsTable)
      .where(eq(IcedGateSessionsTable.userId, userId));
  }

  public async setSession(session: IcedGateSession): Promise<void> {
    await this.db.insert(IcedGateSessionsTable).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    });
  }

  public async updateSessionExpiration(sessionId: IcedGateSession["id"], expiresAt: IcedGateSession["expiresAt"]): Promise<void> {
    await this.db
      .update(IcedGateSessionsTable)
      .set({
        expiresAt,
      })
      .where(eq(IcedGateSessionsTable.id, sessionId));
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(IcedGateSessionsTable).where(lte(IcedGateSessionsTable.expiresAt, new Date()));
  }
}
