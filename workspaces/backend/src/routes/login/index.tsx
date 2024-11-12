import { Hono } from "hono";
import { githubLoginRouter } from "./github.ts";

import type { Env } from "../../lib/types.ts";

export const loginRouter = new Hono<Env>();

loginRouter.route("/", githubLoginRouter);

loginRouter.get("/login", async (c) => {
  const session = c.get("session");
  if (session) {
    return c.redirect("/");
  }
  return c.html((
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Lucia example</title>
      </head>
      <body>
        <h1>Sign in</h1>
        <a href="/login/github">Sign in with GitHub</a>
      </body>
    </html>
  ), 200);
});
