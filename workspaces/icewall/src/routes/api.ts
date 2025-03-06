import { Hono } from "hono";
import type { IcewallEnv } from "../env.ts";

export const api = new Hono<IcewallEnv>()
  .basePath("/api")
  .get("/user", async (c) => {
    const user = c.get("user");

    return c.json(user ?? {}, user ? 200 : 401);
  });
