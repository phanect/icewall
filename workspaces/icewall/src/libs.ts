import type { Context, Input } from "hono";
import type { Config as DrizzleConfig } from "drizzle-kit";
import type { IcewallUser } from "./db/schema/user.ts";
import type { IcewallEnv } from "./env.ts";

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

export type Config = Omit<DrizzleConfig, "schema">;
export const defineConfig = (config: Config) => config;
