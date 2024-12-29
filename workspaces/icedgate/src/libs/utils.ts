import { env } from "hono/adapter";
import type { Context } from "hono";
import type { IcedGateEnv } from "../types.ts";

export const isLocal = (context: Context<IcedGateEnv>): boolean => {
  const { SERVER_ENV: serverEnv } = env(context);

  return serverEnv === "development" || serverEnv === "local";
};
