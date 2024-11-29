import { TimeSpan, createDate, isWithinExpirationDate } from "./date.ts";
import { CookieController } from "./cookie.ts";
import { generateIdFromEntropySize } from "./crypto.ts";

import type { IcedGateUser, IcedGateSession } from "@prisma/client";
import type { Adapter } from "./database.ts";
import type { Cookie, CookieAttributes } from "./cookie.ts";
import type { SessionAttributes, UserAttributes } from "./types.ts";

export class Lucia {
  private adapter: Adapter;
  private sessionExpiresIn: TimeSpan;
  private sessionCookieController: CookieController;

  private getSessionAttributes: (sessionAttributes: SessionAttributes) => Omit<IcedGateSession, "id"> | Record<never, never>;
  private getUserAttributes: ((userAttributes: UserAttributes) => Omit<IcedGateUser, "id">) | undefined;

  public readonly sessionCookieName: string;

  constructor(
    adapter: Adapter,
    options?: {
      sessionExpiresIn?: TimeSpan;
      sessionCookie?: SessionCookieOptions;
      getSessionAttributes?: (sessionAttributes: SessionAttributes) => Omit<IcedGateSession, "id">;
      getUserAttributes?: (userAttributes: UserAttributes) => Omit<IcedGateUser, "id">;
    }
  ) {
    this.adapter = adapter;
    this.getUserAttributes = options?.getUserAttributes;
    this.getSessionAttributes = options?.getSessionAttributes ?? (() => ({}));
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

  public async getUserSessions(userId: string): Promise<IcedGateSession[]> {
    const databaseSessions = await this.adapter.getUserSessions(userId);
    const sessions: IcedGateSession[] = [];
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
  ): Promise<{ user: IcedGateUser; session: IcedGateSession; } | { user: null; session: null; }> {
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
    const session: IcedGateSession = {
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
    const user: IcedGateUser = {
      ...this.getUserAttributes(databaseUser.attributes),
      id: databaseUser.id,
    };
    return { user, session };
  }

  public async createSession(
    userId: string,
    attributes: SessionAttributes,
    options?: {
      sessionId?: string;
    }
  ): Promise<IcedGateSession> {
    if (!this.getSessionAttributes) {
      throw new Error("getSessionAttributes is not defined on instanciating Lucia class.");
    }

    const sessionId = options?.sessionId ?? generateIdFromEntropySize(25);
    const sessionExpiresAt = createDate(this.sessionExpiresIn);
    await this.adapter.setSession({
      id: sessionId,
      userId,
      expiresAt: sessionExpiresAt,
      attributes,
    });
    const session: IcedGateSession = {
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

  public async invalidateUserSessions(userId: string): Promise<void> {
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
