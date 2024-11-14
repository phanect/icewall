import type { SessionAttributes, UserAttributes } from "./types.ts";

export type Adapter = {
  getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | undefined, user: DatabaseUser | undefined]>;
  getUserSessions(userId: string): Promise<DatabaseSession[]>;
  setSession(session: DatabaseSession): Promise<void>;
  updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
};

export type DatabaseUser = {
  id: string;
  attributes: UserAttributes;
};

export type DatabaseSession = {
  userId: string;
  expiresAt: Date;
  id: string;
  attributes: SessionAttributes;
};
