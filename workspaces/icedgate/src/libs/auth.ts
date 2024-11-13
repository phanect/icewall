import { GitHub } from "arctic";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Lucia } from "./core.ts";
import { DrizzleSQLiteAdapter } from "./adapter-sqlite.ts";

export const lucia = new Lucia(
  new DrizzleSQLiteAdapter(drizzle()),
  {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
  }
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  "/login/github/callback",
);
