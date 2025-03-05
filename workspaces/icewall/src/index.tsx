import { Hono } from "hono";
import {
  icewallAPIs,
  icewallMiddleware,
  isAuthenticated,
  getUser,
  type IcewallEnv,
} from "@icewall/core";

const app = new Hono<IcewallEnv>()
  .route("/", icewallAPIs)
  .use("/dashboard", icewallMiddleware)
  // When the login process has completed, users are redirected to /auth/postlogin.
  // Redirect again to any URL you like here.
  .get("/auth/postlogin", async (c) => c.redirect("/dashboard"))
  .get("/", async (c) => {
    return c.html((
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Icewall Demo</title>
        </head>
        <body>
          <h1>Icewall Demo</h1>
          <p>This is a public page. Anyone can view this page without login.</p>

          <p>
            { isAuthenticated(c) ? (
              <a href="/auth/logout">Logout</a>
            ) : (
              <a href="/auth/login">Login</a>
            )}
          </p>

          <p>
            <a href="/dashboard">User dashboard (auth required, to be implemented by library users)</a>
          </p>
        </body>
      </html>
    ), 200);
  }).get("/dashboard", async (c) => {
    const user = getUser(c);

    return c.html((
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Login status</title>
        </head>
        <body>
          <h1>Hi, { user.email }!</h1>
          <p>
            This page is protected by Icewall. You need to login to view this page.<br />
            Your user ID is { user.id }.
          </p>
          <a href="/auth/logout">Sign out</a>
        </body>
      </html>
    ), 200);
  });

export default app;
