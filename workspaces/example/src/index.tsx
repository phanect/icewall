import { Hono } from "hono";
import { icedgate, getUser, type IcedGateEnv } from "icedgate";
import { Layout } from "./Layout.tsx";

const app = new Hono<IcedGateEnv>()
  .route("/", icedgate)
  .get("/", async (c) => {
    const user = getUser(c);
    if (!user) {
      return c.redirect("/login");
    }

    return c.html((
      <Layout title="Login status">
        <h1>Hi, { user.username }!</h1>
        <p>Your user ID is { user.id }.</p>
        <form method="post">
          <button>Sign out</button>
        </form>
      </Layout>
    ), 200);
  });

export default app;
