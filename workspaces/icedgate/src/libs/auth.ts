import { GitHub } from "arctic";
import { drizzle } from "drizzle-orm/better-sqlite3";
import dotenv from "dotenv";
import { type DatabaseUser } from "./db.ts";
import { Lucia } from "./index.ts";
import { DrizzleSQLiteAdapter } from "./adapter-sqlite.ts";
import { IcedGateUsers } from "../db/schema/user.ts";
import { IcedGateSessions } from "../db/schema/session.ts";

dotenv.config();

export const lucia = new Lucia(
  new DrizzleSQLiteAdapter(drizzle(), IcedGateSessions, IcedGateUsers),
  {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => ({
      githubId: attributes.github_id,
      username: attributes.username,
    }),
  }
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  "/login/github/callback",
);

declare module "lucia" {
  type Register = {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  };
}
