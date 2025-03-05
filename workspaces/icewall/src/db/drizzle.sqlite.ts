import { drizzle } from "drizzle-orm/libsql";
import type { Context } from "hono";
import type { IcewallEnv } from "../env.ts";

/**
 * Instanciate Drizzle object for generic SQLite, LibSQL, and Turso.
 * @param c - Hono context
 * @returns Drizzle object
 */
export const getDrizzle = (c: Context<IcewallEnv>) => {
  if (!c.env.DB_URL) {
    throw new Error(`\`DB_URL\` is not set.
      1. If you use file-based SQLite on production or on your local machine, set file path to \`DB_URL\` environment variable.
      2. If you use Turso, set \`DB_URL\` and \`TURSO_AUTH_TOKEN\` environment variables.
    `.trim());
  }

  return drizzle({
    connection: {
      url: c.env.DB_URL,
      authToken: c.env.TURSO_AUTH_TOKEN,
    },
  });
};
