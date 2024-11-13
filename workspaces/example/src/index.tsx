import { Hono } from "hono";

import type { Env } from "./libs/types.ts";

const app = new Hono<Env>()
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.redirect("/login");
    }

    return c.html((
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width" />
          <title>Login status</title>
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

export default app;
