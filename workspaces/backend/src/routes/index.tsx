import { Hono } from "hono";

import type { Env } from "../lib/types.ts";

export const mainRouter = new Hono<Env>();

mainRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.redirect("/login");
  }

  return c.html((
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Lucia example</title>
      </head>
      <body>
        <h1>Hi, { user.username }!</h1>
        <p>Your user ID is { user.id }.</p>
        <form method="post">
          <button>Sign out</button>
        </form>
      </body>
    </html>
  ), 200);
});
