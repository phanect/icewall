import type { Context, Input } from "hono";
import type { IcedGateEnv } from "./types.ts";
import type { IcedGateUser } from "./db/schema/user.ts";

export { icedgate } from "./routes/index.ts";

export const getUser = (c: Context<IcedGateEnv, string, Input>): IcedGateUser | undefined => c.get("user");
export const isAuthenticated = (c: Context<IcedGateEnv, string, Input>): boolean => !!getUser(c);
export type { IcedGateEnv, IcedGateUser };
