import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Lucia } from "./lucia/index.ts";
import { PrismaAdapter } from "./lucia/prisma-adapter.ts";
import { isLocal } from "./utils.ts";
import type { Context } from "hono";
import type { Env } from "./types.ts";

dotenv.config();

export const prisma = new PrismaClient();

export const getLuciaInstance = (context: Context<Env>): Lucia => new Lucia(
  new PrismaAdapter(prisma.session, prisma.user),
  {
    sessionCookie: {
      attributes: {
        secure: !isLocal(context),
      },
    },
    getUserAttributes: (attributes) => ({
      githubId: attributes.githubId,
      username: attributes.username,
    }),
  }
);
