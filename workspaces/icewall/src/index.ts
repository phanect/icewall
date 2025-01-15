import type { Context, Input } from "hono";
import type { IcewallEnv } from "./types.ts";
import type { IcewallUser } from "./db/schema/user.ts";

export { icewall } from "./routes/index.ts";

export const getUser = (c: Context<IcewallEnv, string, Input>): IcewallUser | undefined => c.get("user");
export const isAuthenticated = (c: Context<IcewallEnv, string, Input>): boolean => !!getUser(c);
export type { IcewallEnv, IcewallUser };
