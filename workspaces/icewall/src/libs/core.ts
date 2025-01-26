import { DrizzleAdapter } from "./adapter.ts";
import { TimeSpan, createDate, isWithinExpirationDate } from "./date.ts";
import { CookieController } from "./cookie.ts";
import { generateIdFromEntropySize } from "./crypto.ts";
import type { IcewallUser } from "../db/schema/user.ts";
import type { IcewallSession } from "../db/schema/session.ts";
import type { Cookie, CookieAttributes } from "./cookie.ts";
import type { Database } from "../db/dbms.ts";
import type { UserPropsTable } from "../db/user-props.ts";

export class Lucia {
  private adapter: DrizzleAdapter;
  private sessionExpiresIn: TimeSpan;
  private sessionCookieController: CookieController;

  public readonly sessionCookieName: string;

  constructor(
    db: Database,
    options?: {
      sessionExpiresIn?: TimeSpan;
      sessionCookie?: SessionCookieOptions;
      userPropsTable?: UserPropsTable;
    }
  ) {
    this.adapter = new DrizzleAdapter(db, {
      userPropsTable: options?.userPropsTable,
    });
    this.sessionExpiresIn = options?.sessionExpiresIn ?? new TimeSpan(30, "d");
    this.sessionCookieName = options?.sessionCookie?.name ?? "auth_session";
    let sessionCookieExpiresIn = this.sessionExpiresIn;
    if (options?.sessionCookie?.expires === false) {
      sessionCookieExpiresIn = new TimeSpan(400, "d");
    }
    const baseSessionCookieAttributes: CookieAttributes = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      ...options?.sessionCookie?.attributes,
    };
    this.sessionCookieController = new CookieController(
      this.sessionCookieName,
      baseSessionCookieAttributes,
      {
        expiresIn: sessionCookieExpiresIn,
      }
    );
  }

  public async getUserSessions(userId: IcewallUser["id"]): Promise<IcewallSession[]> {
    const databaseSessions = await this.adapter.getUserSessions(userId);
    const sessions: IcewallSession[] = [];
    for (const databaseSession of databaseSessions) {
      if (!isWithinExpirationDate(databaseSession.expiresAt)) {
        continue;
      }
      sessions.push({
        id: databaseSession.id,
        expiresAt: databaseSession.expiresAt,
        userId: databaseSession.userId,
        fresh: false,
      });
    }
    return sessions;
  }

  public async validateSession(
    sessionId: string
  ): Promise<{ user: IcewallUser; session: IcewallSession; } | { user: undefined; session: undefined; }> {
    const [ databaseSession, databaseUser ] = await this.adapter.getSessionAndUser(sessionId);
    if (!databaseSession) {
      return { session: undefined, user: undefined };
    }
    if (!databaseUser) {
      await this.adapter.deleteSession(databaseSession.id);
      return { session: undefined, user: undefined };
    }
    if (!isWithinExpirationDate(databaseSession.expiresAt)) {
      await this.adapter.deleteSession(databaseSession.id);
      return { session: undefined, user: undefined };
    }
    const activePeriodExpirationDate = new Date(
      databaseSession.expiresAt.getTime() - this.sessionExpiresIn.milliseconds() / 2
    );
    const session = databaseSession;

    if (isWithinExpirationDate(activePeriodExpirationDate)) {
      session.fresh = false;
    } else {
      session.fresh = true;
      session.expiresAt = createDate(this.sessionExpiresIn);
      await this.adapter.updateSessionExpiration(databaseSession.id, session.expiresAt);
    }

    return { user: databaseUser, session };
  }

  public async createSession(
    userId: IcewallUser["id"],
    options?: {
      sessionId?: string;
    }
  ): Promise<IcewallSession> {
    const sessionId = options?.sessionId ?? generateIdFromEntropySize(25);
    const sessionExpiresAt = createDate(this.sessionExpiresIn);
    await this.adapter.setSession({
      id: sessionId,
      userId,
      expiresAt: sessionExpiresAt,
    });
    const session: IcewallSession = {
      id: sessionId,
      userId,
      fresh: true,
      expiresAt: sessionExpiresAt,
    };
    return session;
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    await this.adapter.deleteSession(sessionId);
  }

  public async invalidateUserSessions(userId: IcewallUser["id"]): Promise<void> {
    await this.adapter.deleteUserSessions(userId);
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.adapter.deleteExpiredSessions();
  }

  public readSessionCookie(cookieHeader: string): string | undefined {
    const sessionId = this.sessionCookieController.parse(cookieHeader);
    return sessionId;
  }

  public readBearerToken(authorizationHeader: string): string | undefined {
    const [ authScheme, token ] = authorizationHeader.split(" ");
    if (authScheme !== "Bearer") {
      return undefined;
    }
    return 0 < token.length ? token : undefined;
  }

  public createSessionCookie(sessionId: string): Cookie {
    return this.sessionCookieController.createCookie(sessionId);
  }

  public createBlankSessionCookie(): Cookie {
    return this.sessionCookieController.createBlankCookie();
  }
}

export type SessionCookieOptions = {
  name?: string;
  expires?: boolean;
  attributes?: SessionCookieAttributesOptions;
};

export type SessionCookieAttributesOptions = {
  sameSite?: "lax" | "strict" | "none";
  domain?: string;
  path?: string;
  secure?: boolean;
};
