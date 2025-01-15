import type { IcewallSession } from "../db/schema/session.ts";
import type { IcewallUser } from "../db/schema/user.ts";

export type Adapter = {
  getSessionAndUser(
    sessionId: IcewallSession["id"],
  ): Promise<[session: IcewallSession | undefined, user: IcewallUser | undefined]>;
  getUserSessions(userId: IcewallUser["id"]): Promise<IcewallSession[]>;
  setSession(session: IcewallSession): Promise<void>;
  updateSessionExpiration(sessionId: IcewallSession["id"], expiresAt: IcewallSession["expiresAt"]): Promise<void>;
  deleteSession(sessionId: IcewallSession["id"]): Promise<void>;
  deleteUserSessions(userId: IcewallUser["id"]): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
};
