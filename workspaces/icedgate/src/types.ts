import type { Env } from "hono";
import type { IcedGateUser } from "./db/schema/user.ts";
import type { IcedGateSession } from "./db/schema/session.ts";

export type IcedGateEnv = {
  Variables: {
    user?: IcedGateUser;
    session?: IcedGateSession;
  };
} & Env;
