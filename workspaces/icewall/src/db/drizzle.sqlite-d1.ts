import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import type { IcewallEnv } from "../env.ts";

/**
 * Instanciate Drizzle object for Cloudflare D1.
 * @param c - Hono context
 * @returns Drizzle object
 */
export const getDrizzle = (c: Context<IcewallEnv>) => {
  if (!c.env.D1) {
    throw new Error(`\`D1\` is not set as a Cloudflare D1 binding.
      Set the following config in wrangler.toml.
      \`\`\`
      [[d1_databases]]
      binding: "D1"
      \`\`\`
    `.trim());
  }

  return drizzle(c.env.D1);
};
