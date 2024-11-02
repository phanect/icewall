import { PrismaClient } from "@prisma/client";
import { GitHub } from "arctic";
import dotenv from "dotenv";
import { Lucia } from "./lucia/index.ts";
import { PrismaAdapter } from "./lucia/prisma-adapter.ts";

dotenv.config();

export const prisma = new PrismaClient();

export const lucia = new Lucia(
  new PrismaAdapter(prisma.session, prisma.user),
  {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => ({
      githubId: attributes.githubId,
      username: attributes.username,
    }),
  }
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  "/login/github/callback",
);

export type Register = {
  Lucia: typeof lucia;
  DatabaseUserAttributes: {
    username: string;
    githubId: number;
  };
};
