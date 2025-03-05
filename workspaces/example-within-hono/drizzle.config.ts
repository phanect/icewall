import { env } from "node:process";
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (
  !env.CLOUDFLARE_ACCOUNT_ID
  || !env.CLOUDFLARE_DATABASE_ID
  || !env.CLOUDFLARE_API_TOKEN
) {
  throw new Error(`Missing Cloudflare secrets:
    CLOUDFLARE_ACCOUNT_ID: ${ env.CLOUDFLARE_ACCOUNT_ID }
    CLOUDFLARE_DATABASE_ID: ${ env.CLOUDFLARE_DATABASE_ID }
    CLOUDFLARE_API_TOKEN: ${ env.CLOUDFLARE_API_TOKEN }
  `);
}

export default defineConfig({
  schema: "./src/schema.ts",
  // default ./drizzle directory is not recognized by D1 due to Wrangler's bug?
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_API_TOKEN,
  },
});
