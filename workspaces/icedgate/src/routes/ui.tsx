import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../ui/layouts/default.tsx";

import type { IcedGateEnv } from "../types.ts";

export const ui = new Hono<IcedGateEnv>()
  .get(
    "/login",
    jsxRenderer(
      ({ children }) => (<>{ children }</>),
      { docType: true },
    ),
  ).get("/login", async (c) => {
    const session = c.get("session");
    if (session) {
      return c.redirect("/");
    }
    return c.html((
      <Layout title="Lucia example">
        <h1>Sign in</h1>
        <a href="/login/github">Sign in with GitHub</a>
      </Layout>
    ), 200);
  }).post("/", async (c) => {
    const lucia = c.get("lucia");
    const session = c.get("session");
    if (!session) {
      return c.body(null, 401);
    }
    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
    return c.redirect("/login");
  });
