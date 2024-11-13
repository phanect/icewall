import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { Env } from "./libs/types.ts";

const app = new Hono<Env>()
  .route("/", routers);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("Server running on port 3000");
