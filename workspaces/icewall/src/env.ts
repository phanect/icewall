import type { Env } from "hono";
import type { IcewallUser } from "./db/schema/user.ts";
import type { IcewallSession } from "./db/schema/session.ts";
import type { UserPropsTable } from "./db/user-props.ts";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Lucia } from "./libs/core.ts";

export type IcewallEnv = Env & {
  Variables: {
    drizzle: DrizzleD1Database;
    lucia: Lucia;
    user?: IcewallUser;
    userPropsTable?: UserPropsTable;
    session?: IcewallSession;
  };
  /** Environment variables */
  Bindings: {
    D1?: D1Database;
    SERVER_ENV?: string;
    PROTOCOL_AND_HOST?: string;

    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };
};
