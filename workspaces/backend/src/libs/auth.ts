import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { GitHub } from "arctic";
import dotenv from "dotenv";
import { db, type DatabaseUser } from "./db.ts";
import { Lucia } from "./lucia/index.ts";

dotenv.config();

const adapter = new BetterSqlite3Adapter(db, {
  user: "user",
  session: "session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => ({
    githubId: attributes.github_id,
    username: attributes.username,
  }),
});

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  "/login/github/callback",
);

export type Register = {
  Lucia: typeof lucia;
  DatabaseUserAttributes: Omit<DatabaseUser, "id">;
};
