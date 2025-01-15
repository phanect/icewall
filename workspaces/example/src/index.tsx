import { Hono } from "hono";
import { authRoutes, authProtection, getUser, type IcewallEnv } from "icewall";

const app = new Hono<IcewallEnv>()
  .route("/", authRoutes)
  .use("/dashboard", authProtection)
  .get("/", async (c) => {
    const user = getUser(c);

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
          <a href="/auth/logout">Sign out</a>
        </body>
      </html>
    ), 200);
  });

export default app;
