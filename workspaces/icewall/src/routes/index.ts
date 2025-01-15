import { Hono } from "hono";
import { middleware } from "./middleware.ts";
import { ui } from "./ui.tsx";
import { google } from "./google.ts";
import { github } from "./github.ts";

import type { IcewallEnv } from "../types.ts";

export const authRoutes = new Hono<IcewallEnv>()
  .use("/*", middleware)
  .route("/auth", ui)
  .route("/auth", google)
  .route("/auth", github);
