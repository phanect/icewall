import type { Context, Input } from "hono";
import type { IcewallEnv } from "./types.ts";
import type { IcewallUser } from "./db/schema/user.ts";

export { authRoutes } from "./routes/index.ts";
export { authProtection } from "./routes/middleware.ts";

export type GetUserOptions = {
  ifLoggedOut: "throw" | "returnUndefined";
};
export function getUser(
  c: Context<IcewallEnv, string, Input>,
  options?: { ifLoggedOut: "throw"; },
): IcewallUser;
export function getUser(
  c: Context<IcewallEnv, string, Input>,
  options: { ifLoggedOut: "returnUndefined"; },
): IcewallUser | undefined;
export function getUser(
  c: Context<IcewallEnv, string, Input>,
  options?: GetUserOptions,
): IcewallUser | undefined {
  const { ifLoggedOut = "throw" } = options ?? {};
  const user = c.get("user");

  if (user) {
    return user;
  } else {
    if (ifLoggedOut === "throw") {
      throw new Error("Unauthorized");
    } else { // if (ifLoggedOut === "returnUndefined")
      return user;
    }
  }
};

export const isAuthenticated = (c: Context<IcewallEnv, string, Input>): boolean => !!c.get("user");
export type { IcewallEnv, IcewallUser };
