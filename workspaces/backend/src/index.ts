import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { routers } from "./routes/index.tsx";
import type { Env } from "./lib/types.ts";

const app = new Hono<Env>()
  .route("/", routers);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("Server running on port 3000");
