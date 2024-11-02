import type { Env } from "hono";
import type { User, Session } from "./lucia/index.ts";

export type Context = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
} & Env;
