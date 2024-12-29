import type { Env } from "hono";
import type { IcedGateUser } from "./db/schema/user.ts";
import type { IcedGateSession } from "./db/schema/session.ts";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Lucia } from "./libs/core.ts";

export type IcedGateEnv = {
  Variables: {
    drizzle: DrizzleD1Database;
    lucia: Lucia;
    user?: IcedGateUser;
    session?: IcedGateSession;
  };
} & Env;
