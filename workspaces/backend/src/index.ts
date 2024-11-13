import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { verifyRequestOrigin } from "./libs/request.ts";
import { getLuciaInstance } from "./libs/auth.ts";
import { logoutRouter } from "./routes/logout.ts";
import { loginRouter } from "./routes/index.tsx";
import type { Env } from "./libs/types.ts";

const app = new Hono<Env>()
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
  }).route("/", loginRouter)
  .route("/", logoutRouter);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("Server running on port 3000");
