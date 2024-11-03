import type { Env as HonoEnv } from "hono";
import type { User, Session } from "@prisma/client";

export type Env = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
} & HonoEnv;
