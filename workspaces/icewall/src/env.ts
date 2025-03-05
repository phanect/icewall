import type { Env } from "hono";
import type { IcewallUser } from "./db/schema/user.ts";
import type { IcewallSession } from "./db/schema/session.ts";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Lucia } from "./libs/core.ts";

export type IcewallEnv = Env & {
  Variables: {
    drizzle: LibSQLDatabase | DrizzleD1Database;
    lucia: Lucia;
    user?: IcewallUser;
    session?: IcewallSession;
  };
  /** Environment variables */
  Bindings: {
    D1?: D1Database;

    SERVER_ENV?: string;
    PROTOCOL_AND_HOST?: string;

    DB_URL?: string;
    TURSO_AUTH_TOKEN?: string;

    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };
};
