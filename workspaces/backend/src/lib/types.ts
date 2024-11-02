import type { Env } from "hono";
import type { User, Session } from "@prisma/client";

export type Context = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
} & Env;
