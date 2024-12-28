import type {
  RegisteredDatabaseSessionAttributes,
  RegisteredDatabaseUserAttributes,
  UserId,
} from "./index.ts";

export type Adapter = {
  getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | undefined, user: DatabaseUser | undefined]>;
  getUserSessions(userId: UserId): Promise<DatabaseSession[]>;
  setSession(session: DatabaseSession): Promise<void>;
  updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSessions(userId: UserId): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
};

export type DatabaseUser = {
  id: UserId;
  attributes: RegisteredDatabaseUserAttributes;
};

export type DatabaseSession = {
  userId: UserId;
  expiresAt: Date;
  id: string;
  attributes: RegisteredDatabaseSessionAttributes;
};
