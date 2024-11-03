import { OAuth2RequestError, generateState } from "arctic";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "../../lib/lucia/index.ts";
import { prisma, github, getLuciaInstance } from "../../lib/auth.ts";
import { isLocal } from "../../lib/utils.ts";
import type { Env } from "../../lib/types.ts";

type GitHubUser = {
  id: number;
  login: string;
};

export const githubLoginRouter = new Hono<Env>();

githubLoginRouter.get("/login/github", async (c) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, [ "user:email" ]);
  setCookie(c, "github_oauth_state", state, {
    path: "/",
    secure: !isLocal(c),
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "Lax",
  });
  return c.redirect(url.toString());
});

githubLoginRouter.get("/login/github/callback", async (c) => {
  const code = c.req.query("code")?.toString() ?? null;
  const state = c.req.query("state")?.toString() ?? null;
  const storedState = getCookie(c).github_oauth_state ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return c.body(null, 400);
  }
  try {
    const lucia = getLuciaInstance(c);
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${ tokens.accessToken() }`,
      },
    });
    const githubUser = await githubUserResponse.json() as GitHubUser;
    const existingUser = await prisma.user.findFirst({
      where: {
        githubId: githubUser.id,
      },
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      return c.redirect("/");
    }

    const userId = generateId(15);
    await prisma.user.create({
      data: {
        id: userId,
        githubId: githubUser.id,
        username: githubUser.login,
      },
    });

    const session = await lucia.createSession(userId, {});
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
    return c.redirect("/");
  } catch (e) {
    if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
      // invalid code
      return c.body(null, 400);
    }
    return c.body(null, 500);
  }
});
