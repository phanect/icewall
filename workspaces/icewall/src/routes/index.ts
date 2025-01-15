import { Hono } from "hono";
import { middleware } from "./middleware.ts";
import { ui } from "./ui.tsx";
import { github } from "./github.ts";

import type { IcewallEnv } from "../types.ts";

export const icewall = new Hono<IcewallEnv>()
  .use(middleware)
  .route("/", ui)
  .route("/", github);
