import type { Context, Input } from "hono";
import type { IcedGateUser } from "@prisma/client";
import type { Env } from "./libs/types.ts";

export { authRoutes } from "./routes/index.tsx";
export type { Env, IcedGateUser };

export const getUser = (c: Context<Env, string, Input>): IcedGateUser | undefined => c.get("user");
export const isAuthenticated = (c: Context<Env, string, Input>): boolean => !!getUser(c);
