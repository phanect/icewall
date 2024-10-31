import type {
  RegisteredDatabaseSessionAttributes,
  RegisteredDatabaseUserAttributes,
  UserId,
} from "./index.js";

export type Adapter = {
  getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]>;
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
