import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { Lucia } from "../libs/core.ts";
import { DrizzleSQLiteAdapter } from "../libs/adapter-sqlite.ts";
import { verifyRequestOrigin } from "../libs/request.ts";
import { isLocal } from "../libs/utils.ts";
import type { IcedGateEnv } from "../types.ts";

export const middleware = new Hono<IcedGateEnv>()
  .use("*", async (c, next) => {
    if (c.req.method === "GET") {
      return next();
    }
    const originHeader = c.req.header("Origin");
    const hostHeader = c.req.header("Host");
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [ hostHeader ])) {
      return c.body(null, 403);
    }
    return next();
  }).use("*", async (c, next) => {
    if (!c.env.D1) {
      throw new Error(`\`D1\` is not set as a Cloudflare D1 binding.
Set the following config in wrangler.toml.

[[d1_databases]]
binding: "D1"
`);
    }

    const db = drizzle(c.env.D1);
    const lucia = new Lucia(
      new DrizzleSQLiteAdapter(db),
      {
        sessionCookie: {
          attributes: {
            secure: !isLocal(c),
          },
        },
      }
    );
    c.set("drizzle", db);
    c.set("lucia", lucia);

    const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
    if (!sessionId) {
      c.set("user", undefined);
      c.set("session", undefined);
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
  });
