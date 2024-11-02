import { readFile } from "node:fs/promises";
import { Hono } from "hono";

import type { Context } from "../lib/types.ts";

export const mainRouter = new Hono<Context>();

mainRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.redirect("/login");
  }
  const templateFile = await readFile("routes/index.template.html");
  const template = templateFile.toString();
  const html = template.replaceAll("%username%", user.username).replaceAll("%user_id%", user.id);
  return c.html(html, 200);
});
