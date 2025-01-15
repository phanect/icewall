import { env } from "hono/adapter";
import type { Context } from "hono";
import type { IcewallEnv } from "../types.ts";

export const isLocal = (context: Context<IcewallEnv>): boolean => {
  const { SERVER_ENV: serverEnv } = env(context);

  return serverEnv === "development" || serverEnv === "local";
};
