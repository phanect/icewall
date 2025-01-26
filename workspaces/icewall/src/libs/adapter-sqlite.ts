import { eq, getTableColumns, lte } from "drizzle-orm";
import { IcewallUsersTable, type IcewallUser } from "../db/schema/user.ts";
import { IcewallSessionsTable, type IcewallSession } from "../db/schema/session.ts";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type { Adapter } from "./database.ts";

export class DrizzleSQLiteAdapter implements Adapter {
  private db: BaseSQLiteDatabase<"async" | "sync", object>;

  constructor(
    db: BaseSQLiteDatabase<"async" | "sync", object>,
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
      }).from(IcewallSessionsTable)
      .where(eq(IcewallSessionsTable.id, sessionId))
      .innerJoin(IcewallUsersTable, eq(IcewallSessionsTable.userId, IcewallUsersTable.id));
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

  public async setSession(
    session: Omit<IcewallSession, "fresh"> & { fresh?: boolean | null; },
  ): Promise<void> {
    await this.db
      .insert(IcewallSessionsTable)
      .values(session);
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
