import { Hono } from "hono";
import { getLuciaInstance } from "../libs/auth.ts";

import type { Env } from "../libs/types.ts";

export const logoutRouter = new Hono<Env>();

logoutRouter.post("/", async (c) => {
  const lucia = getLuciaInstance(c);
  const session = c.get("session");
  if (!session) {
    return c.body(null, 401);
  }
  await lucia.invalidateSession(session.id);
  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
  return c.redirect("/login");
});
