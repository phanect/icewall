import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Login } from "../ui/pages/login.tsx";
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

    return c.render(<Login />);
  }).get("/logout", async (c) => {
    const lucia = c.get("lucia");
    const session = c.get("session");
    if (!session) {
      return c.body(null, 401);
    }
    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
    return c.redirect("/login");
  });
