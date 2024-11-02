import { eq, lte } from "drizzle-orm";
import { IcedGateUsers, type IcedGateUser } from "../db/schema/user.ts";
import { IcedGateSessions, type IcedGateSession } from "../db/schema/session.ts";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type { Adapter } from "./database.ts";

export class DrizzleSQLiteAdapter implements Adapter {
  private db: BaseSQLiteDatabase<"async" | "sync", object>;

  constructor(
    db: BaseSQLiteDatabase<"async" | "sync", object>,
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
    // https://github.com/drizzle-team/drizzle-orm/issues/555
    const [ databaseSession, databaseUser ] = await Promise.all([
      this.getSession(sessionId),
      this.getUserFromSessionId(sessionId),
    ]);
    return [ databaseSession, databaseUser ];
  }

  private async getSession(sessionId: string): Promise<IcedGateSession | undefined> {
    const result = await this.db
      .select()
      .from(IcedGateSessions)
      .where(eq(IcedGateSessions.id, sessionId));
    if (result.length !== 1) {
      return undefined;
    }
    return result[0];
  }

  private async getUserFromSessionId(sessionId: string): Promise<IcedGateUser | undefined> {
    const {
      _,
      $inferInsert,
      $inferSelect,
      getSQL,
      shouldOmitSQLParens,
      ...userColumns
    } = IcedGateUsers;
    const result = await this.db
      .select(userColumns)
      .from(IcedGateSessions)
      .innerJoin(IcedGateUsers, eq(IcedGateSessions.userId, IcedGateUsers.id))
      .where(eq(IcedGateSessions.id, sessionId));
    if (result.length !== 1) {
      return undefined;
    }
    return result[0];
  }

  public async getUserSessions(userId: IcedGateUser["id"]): Promise<IcedGateSession[]> {
    return this.db
      .select()
      .from(IcedGateSessions)
      .where(eq(IcedGateSessions.userId, userId))
      .all();
  }

  public async setSession(session: IcedGateSession): Promise<void> {
    await this.db
      .insert(IcedGateSessions)
      .values({
        id: session.id,
        userId: session.userId,
        expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
      })
      .run();
  }

  public async updateSessionExpiration(sessionId: IcedGateSession["id"], expiresAt: IcedGateSession["expiresAt"]): Promise<void> {
    await this.db
      .update(IcedGateSessions)
      .set({
        expiresAt: Math.floor(expiresAt.getTime() / 1000),
      })
      .where(eq(IcedGateSessions.id, sessionId))
      .run();
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db
      .delete(IcedGateSessions)
      .where(lte(IcedGateSessions.expiresAt, Math.floor(Date.now() / 1000)));
  }
}
