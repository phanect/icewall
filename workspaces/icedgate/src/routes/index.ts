import { Hono } from "hono";
import { middleware } from "./middleware.ts";
import { ui } from "./ui.tsx";
import { github } from "./github.ts";

import type { IcedGateEnv } from "../types.ts";

export const icedgate = new Hono<IcedGateEnv>()
  .route("*", middleware)
  .route("/", ui)
  .route("/", github);
