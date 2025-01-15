import type { IcedGateSession } from "../db/schema/session.ts";
import type { IcedGateUser } from "../db/schema/user.ts";

export type Adapter = {
  getSessionAndUser(
    sessionId: IcedGateSession["id"],
  ): Promise<[session: IcedGateSession | undefined, user: IcedGateUser | undefined]>;
  getUserSessions(userId: IcedGateUser["id"]): Promise<IcedGateSession[]>;
  setSession(session: IcedGateSession): Promise<void>;
  updateSessionExpiration(sessionId: IcedGateSession["id"], expiresAt: IcedGateSession["expiresAt"]): Promise<void>;
  deleteSession(sessionId: IcedGateSession["id"]): Promise<void>;
  deleteUserSessions(userId: IcedGateUser["id"]): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
};
