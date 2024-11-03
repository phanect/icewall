import { readFile } from "node:fs/promises";
import { Hono } from "hono";
import { githubLoginRouter } from "./github.ts";

import type { IcedGateEnv } from "../types.ts";

export const loginRouter = new Hono<IcedGateEnv>();

loginRouter.route("/", githubLoginRouter);

loginRouter.get("/login", async (c) => {
  const session = c.get("session");
  if (session) {
    return c.redirect("/");
  }
  const htmlFile = await readFile("routes/login/index.html");
  return c.html(htmlFile.toString(), 200);
});
