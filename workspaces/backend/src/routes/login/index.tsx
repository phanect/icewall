import { Hono } from "hono";
import { githubLoginRouter } from "./github.ts";

import type { Env } from "../../lib/types.ts";

export const loginRouter = new Hono<Env>()
  .route("/", githubLoginRouter)
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
  });
