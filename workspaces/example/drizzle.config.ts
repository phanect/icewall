import { env } from "node:process";
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (
  !env.CLOUDFLARE_ACCOUNT_ID
  || !env.CLOUDFLARE_DATABASE_ID
  || !env.CLOUDFLARE_D1_TOKEN
) {
  throw new Error(`Missing Cloudflare secrets:
    CLOUDFLARE_ACCOUNT_ID: ${ env.CLOUDFLARE_ACCOUNT_ID }
    CLOUDFLARE_DATABASE_ID: ${ env.CLOUDFLARE_DATABASE_ID }
    CLOUDFLARE_D1_TOKEN: ${ env.CLOUDFLARE_D1_TOKEN }
  `);
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_D1_TOKEN,
  },
});
