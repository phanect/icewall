import { Hono } from "hono";
import { middleware } from "./middleware.ts";
import { ui } from "./ui.tsx";
import { github } from "./github.ts";

import type { IcewallEnv } from "../env.ts";

export const icewallAPIs = new Hono<IcewallEnv>()
  .use("/*", middleware)
  .route("/auth", ui)
  .route("/auth", github);
