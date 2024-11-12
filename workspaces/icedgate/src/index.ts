import { serve } from "@hono/node-server";
import { icedgate } from "./routes/index.ts";

serve({
  fetch: icedgate.fetch,
  port: 3000,
});

console.log("Server running on port 3000");
