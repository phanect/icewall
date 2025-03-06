import { Hono } from "hono";
import { middleware } from "./middleware.ts";
import { api } from "./api.ts";
import { ui } from "./ui.tsx";
import { github } from "./github.ts";

import type { IcewallEnv } from "../env.ts";

export const icewallAPIs = new Hono<IcewallEnv>()
  .use("/*", middleware)
  .route("/auth", api)
  .route("/auth", ui)
  .route("/auth", github);
