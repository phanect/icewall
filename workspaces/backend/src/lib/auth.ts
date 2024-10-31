import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { GitHub } from "arctic";
import dotenv from "dotenv";
import { db } from "./db.js";

import type { DatabaseUser } from "./db.js";

// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;

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

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);

declare module "lucia" {
  type Register = {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  };
}
