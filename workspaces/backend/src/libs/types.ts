import type { Env as HonoEnv } from "hono";
import type { PrismaClient, IcedGateUser, IcedGateSession } from "@prisma/client";
import type { Lucia } from "./core.ts";

export type Env = {
  Variables: {
    prisma: PrismaClient;
    lucia: Lucia;
    user?: IcedGateUser;
    session?: IcedGateSession;
  };
  /** Environment variables */
  Bindings: {
    SERVER_ENV?: string;
    PROTOCOL_AND_HOST?: string;

    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };
} & HonoEnv;

export type UserAttributes = Omit<IcedGateUser, "id">;
export type SessionAttributes = Omit<IcedGateSession, "id" | "userId" | "expiresAt">;
