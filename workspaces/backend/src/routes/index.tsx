import { Hono } from "hono";
import { getLuciaInstance } from "./internal/auth.ts";
import { verifyRequestOrigin } from "./internal/index.ts";
import { githubRouter } from "./github.ts";

import type { Env } from "../libs/types.ts";

export const authRoutes = new Hono<Env>()
  .use("*", async (c, next) => {
    if (c.req.method === "GET") {
      return next();
    }
    const originHeader = c.req.header("Origin") ?? null;
    const hostHeader = c.req.header("Host") ?? null;
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [ hostHeader ])) {
      return c.body(null, 403);
    }
    return next();
  }).use("*", async (c, next) => {
    const lucia = getLuciaInstance(c);
    const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
    if (!sessionId) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session?.fresh) {
      c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
    }
    if (!session) {
      c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
    }
    c.set("user", user);
    c.set("session", session);
    return next();
  })
  .get("/login", async (c) => {
    const session = c.get("session");
    if (session) {
      return c.redirect("/");
    }
    return c.html((
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
          <title>Login or Sign up</title>
        </head>
        <body>
          <h1>Login or Sign up</h1>
          <a href="/login/github">Login or sign up with GitHub</a>
        </body>
      </html>
    ), 200);
  }).post("/", async (c) => {
    const lucia = getLuciaInstance(c);
    const session = c.get("session");
    if (!session) {
      return c.body(null, 401);
    }
    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
    return c.redirect("/login");
  }).route("/", githubRouter);
