import type { Env as HonoEnv } from "hono";
import type { User, Session } from "@prisma/client";

export type Env = {
  Variables: {
    user?: User;
    session?: Session;
  };
  /** Environment variables */
  Bindings: {
    SERVER_ENV: string;
    PROTOCOL_AND_HOST: string;

    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  };
} & HonoEnv;

export type UserAttributes = Omit<User, "id">;
export type SessionAttributes = Omit<Session, "id" | "userId" | "expiresAt">;
