import type { Context, Input } from "hono";
import type { User } from "@prisma/client";
import type { Env } from "./types.ts";

export { authRoutes } from "./routes/index.tsx";
export type { Env, User };

export const getUser = (c: Context<Env, string, Input>): User | null => c.get("user");
export const isAuthenticated = (c: Context<Env, string, Input>): boolean => !!getUser(c);
