import { createMiddleware } from "hono/factory";
import { drizzle } from "drizzle-orm/d1";
import { getUser } from "../libs.ts";
import { Lucia } from "../libs/core.ts";
import { verifyRequestOrigin } from "../libs/request.ts";
import { isLocal } from "../libs/utils.ts";
import type { IcewallEnv } from "../env.ts";
import type { UserPropsTable } from "../db/user-props.ts";

export type IcewallMiddlewareOptions = {
  userPropsTable: UserPropsTable;
};

/**
 * Middleware for pages to be protected by the authwall
 * @param options - Options
 * @param options.userPropsTable - User-defined UserProps table instance.
 * @returns Icewall middleware
 */
export const icewallMiddleware = (options?: IcewallMiddlewareOptions) =>
  createMiddleware<IcewallEnv>(async (c, next) => {
    if (options?.userPropsTable) {
      c.set("userPropsTable", options.userPropsTable);
    }

    const user = getUser(c, { ifLoggedOut: "returnUndefined" });
    if (user) {
      return next();
    } else {
      return c.redirect("/auth/login");
    }
  });

/** Middleware to be used internally */
export const middleware = createMiddleware<IcewallEnv>(async (c, next) => {
  if (c.req.method !== "GET") {
    const originHeader = c.req.header("Origin");
    const hostHeader = c.req.header("Host");
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [ hostHeader ])) {
      return c.body(null, 403);
    }
  }

  if (!c.env.D1) {
    throw new Error(`\`D1\` is not set as a Cloudflare D1 binding.
Set the following config in wrangler.toml.

[[d1_databases]]
binding: "D1"
`);
  }

  const userPropsTable = c.get("userPropsTable");
  const db = drizzle(c.env.D1);
  const lucia = new Lucia(
    db,
    {
      sessionCookie: {
        attributes: {
          secure: !isLocal(c),
        },
      },
      userPropsTable,
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
