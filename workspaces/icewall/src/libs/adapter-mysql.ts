// @ts-nocheck TODO
/* eslint-disable */
import { eq, lte } from "drizzle-orm";
import { IcewallUsersTable, type IcewallUser } from "../db/schema/user.ts";
import { IcewallSessionsTable, type IcewallSession } from "../db/schema/session.ts";
import type { MySqlDatabase } from "drizzle-orm/mysql-core";
import type { Adapter } from "./database.ts";

export class DrizzleMySQLAdapter implements Adapter {
  private db: MySqlDatabase<any, any, any>;

  constructor(
    db: MySqlDatabase<any, any, any>,
  ) {
    this.db = db;
  }

  public async deleteSession(sessionId: IcewallSession["id"]): Promise<void> {
    await this.db
      .delete(IcewallSessionsTable)
      .where(eq(IcewallSessionsTable.id, sessionId));
  }

  public async deleteUserSessions(userId: IcewallUser["id"]): Promise<void> {
    await this.db
      .delete(IcewallSessionsTable)
      .where(eq(IcewallSessionsTable.userId, userId));
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: IcewallSession | undefined, user: IcewallUser | undefined]> {
    const result = await this.db
      .select({
        user: IcewallUsersTable,
        session: IcewallSessionsTable,
      })
      .from(IcewallSessionsTable)
      .innerJoin(IcewallUsersTable, eq(IcewallSessionsTable.userId, IcewallUsersTable.id))
      .where(eq(IcewallSessionsTable.id, sessionId));
    if (result.length !== 1) {
      return [ undefined, undefined ];
    }
    return [
      result[0].session,
      result[0].user,
    ];
  }

  public async getUserSessions(userId: IcewallUser["id"]): Promise<IcewallSession[]> {
    return this.db
      .select()
      .from(IcewallSessionsTable)
      .where(eq(IcewallSessionsTable.userId, userId));
  }

  public async setSession(session: IcewallSession): Promise<void> {
    await this.db
      .insert(IcewallSessionsTable)
      .values({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      });
  }

  public async updateSessionExpiration(sessionId: IcewallSession["id"], expiresAt: IcewallSession["expiresAt"]): Promise<void> {
    await this.db
      .update(IcewallSessionsTable)
      .set({
        expiresAt,
      })
      .where(eq(IcewallSessionsTable.id, sessionId));
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db
      .delete(IcewallSessionsTable)
      .where(lte(IcewallSessionsTable.expiresAt, new Date()));
  }
}
