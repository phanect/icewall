import { Hono } from "hono";
import { lucia } from "../libs/auth.ts";

import type { IcedGateEnv } from "../types.ts";

export const logoutRouter = new Hono<IcedGateEnv>();

logoutRouter.post("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.body(null, 401);
  }
  await lucia.invalidateSession(session.id);
  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
  return c.redirect("/login");
});
