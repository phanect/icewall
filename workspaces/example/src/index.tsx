import { readFile } from "node:fs/promises";
import { Hono } from "hono";
import { icedgate, getUser, type IcedGateEnv } from "icedgate";

export const mainRouter = new Hono<IcedGateEnv>()
  .route("/", icedgate);

mainRouter.get("/", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.redirect("/login");
  }
  const templateFile = await readFile("routes/index.template.html");
  const template = templateFile.toString();
  const html = template.replaceAll("%username%", user.username).replaceAll("%user_id%", user.id);
  return c.html(html, 200);
});
