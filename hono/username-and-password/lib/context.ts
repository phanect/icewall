import type { Env } from "hono";
import type { User, Session } from "lucia";

export type Context = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
} & Env;
