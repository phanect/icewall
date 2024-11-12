import { Hono } from "hono";
import { icedgate, getUser, type IcedGateEnv } from "icedgate";

const app = new Hono<IcedGateEnv>()
  .route("/", icedgate)
  .get("/", async (c) => {
    const user = getUser(c);
    if (!user) {
      return c.redirect("/login");
    }

    return c.html((
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
