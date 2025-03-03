import { TimeSpan, createDate, isWithinExpirationDate } from "./date.ts";
import { CookieController } from "./cookie.ts";
import { generateIdFromEntropySize } from "./crypto.ts";

import type { Adapter } from "./database.ts";
import type {
  RegisteredDatabaseSessionAttributes,
  RegisteredDatabaseUserAttributes,
  RegisteredLucia,
  UserId,
} from "./index.ts";
import type { Cookie, CookieAttributes } from "./cookie.ts";

type SessionAttributes = RegisteredLucia extends Lucia<infer _SessionAttributes, object>
  ? _SessionAttributes
  : object;

type UserAttributes = RegisteredLucia extends Lucia<object, infer _UserAttributes>
  ? _UserAttributes
  : object;

export type Session = {
  id: string;
  expiresAt: Date;
  fresh: boolean;
  userId: UserId;
} & SessionAttributes;

export type User = {
  id: UserId;
} & UserAttributes;

export class Lucia<
  _SessionAttributes extends object = Record<never, never>,
  _UserAttributes extends object = Record<never, never>,
> {
  private adapter: Adapter;
  private sessionExpiresIn: TimeSpan;
  private sessionCookieController: CookieController;

  private getSessionAttributes: (
    databaseSessionAttributes: RegisteredDatabaseSessionAttributes
  ) => _SessionAttributes;

  private getUserAttributes: ((
    databaseUserAttributes: RegisteredDatabaseUserAttributes
  ) => _UserAttributes) | undefined;

  public readonly sessionCookieName: string;

  constructor(
    adapter: Adapter,
    options?: {
      sessionExpiresIn?: TimeSpan;
      sessionCookie?: SessionCookieOptions;
      getSessionAttributes?: (
        databaseSessionAttributes: RegisteredDatabaseSessionAttributes
      ) => _SessionAttributes;
      getUserAttributes?: (
        databaseUserAttributes: RegisteredDatabaseUserAttributes
      ) => _UserAttributes;
    }
  ) {
    this.adapter = adapter;
    this.getUserAttributes = options?.getUserAttributes;
    this.getSessionAttributes = (databaseSessionAttributes) => {
      if (options?.getSessionAttributes) {
        return options.getSessionAttributes(databaseSessionAttributes);
      }
      return {};
    };
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

  public async getUserSessions(userId: UserId): Promise<Session[]> {
    const databaseSessions = await this.adapter.getUserSessions(userId);
    const sessions: Session[] = [];
    for (const databaseSession of databaseSessions) {
      if (!isWithinExpirationDate(databaseSession.expiresAt)) {
        continue;
      }
      sessions.push({
        id: databaseSession.id,
        expiresAt: databaseSession.expiresAt,
        userId: databaseSession.userId,
        fresh: false,
        ...this.getSessionAttributes(databaseSession.attributes),
      });
    }
    return sessions;
  }

  public async validateSession(
    sessionId: string
  ): Promise<{ user: User; session: Session; } | { user: null; session: null; }> {
    if (!this.getUserAttributes) {
      throw new Error("getUserAttributes is not defined on instanciating Lucia class.");
    }

    const [ databaseSession, databaseUser ] = await this.adapter.getSessionAndUser(sessionId);
    if (!databaseSession) {
      return { session: null, user: null };
    }
    if (!databaseUser) {
      await this.adapter.deleteSession(databaseSession.id);
      return { session: null, user: null };
    }
    if (!isWithinExpirationDate(databaseSession.expiresAt)) {
      await this.adapter.deleteSession(databaseSession.id);
      return { session: null, user: null };
    }
    const activePeriodExpirationDate = new Date(
      databaseSession.expiresAt.getTime() - this.sessionExpiresIn.milliseconds() / 2
    );
    const session: Session = {
      ...this.getSessionAttributes(databaseSession.attributes),
      id: databaseSession.id,
      userId: databaseSession.userId,
      fresh: false,
      expiresAt: databaseSession.expiresAt,
    };
    if (!isWithinExpirationDate(activePeriodExpirationDate)) {
      session.fresh = true;
      session.expiresAt = createDate(this.sessionExpiresIn);
      await this.adapter.updateSessionExpiration(databaseSession.id, session.expiresAt);
    }
    const user: User = {
      ...this.getUserAttributes(databaseUser.attributes),
      id: databaseUser.id,
    };
    return { user, session };
  }

  public async createSession(
    userId: UserId,
    attributes: RegisteredDatabaseSessionAttributes,
    options?: {
      sessionId?: string;
    }
  ): Promise<Session> {
    const sessionId = options?.sessionId ?? generateIdFromEntropySize(25);
    const sessionExpiresAt = createDate(this.sessionExpiresIn);
    await this.adapter.setSession({
      id: sessionId,
      userId,
      expiresAt: sessionExpiresAt,
      attributes,
    });
    const session: Session = {
      id: sessionId,
      userId,
      fresh: true,
      expiresAt: sessionExpiresAt,
      ...this.getSessionAttributes(attributes),
    };
    return session;
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    await this.adapter.deleteSession(sessionId);
  }

  public async invalidateUserSessions(userId: UserId): Promise<void> {
    await this.adapter.deleteUserSessions(userId);
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.adapter.deleteExpiredSessions();
  }

  public readSessionCookie(cookieHeader: string): string | null {
    const sessionId = this.sessionCookieController.parse(cookieHeader);
    return sessionId;
  }

  public readBearerToken(authorizationHeader: string): string | null {
    const [ authScheme, token ] = authorizationHeader.split(" ") as [string, string | undefined];
    if (authScheme !== "Bearer") {
      return null;
    }
    return token ?? null;
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
