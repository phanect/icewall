import { Hono } from "hono";
import { icewallAPIs } from "./routes/index.ts";
import type { IcewallEnv } from "./env.ts";

/**
 * Create Hono routes
 * @param postLogin path or URL to redirect after successful login process
 * @returns a Hono instance
 */
export const startIcewallServer = (postLogin: string) => new Hono<IcewallEnv>()
  .route("/", icewallAPIs)
  .get("/auth/postlogin", async (c) => c.redirect(postLogin));
