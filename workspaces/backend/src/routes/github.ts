import { OAuth2RequestError, generateState } from "arctic";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "../../lib/lucia/index.ts";
import { github, lucia } from "../../lib/auth.ts";
import { db, type DatabaseUser } from "../../lib/db.ts";
import type { Context } from "../../lib/context.ts";

type GitHubUser = {
  id: string;
  login: string;
};

export const githubLoginRouter = new Hono<Context>();

githubLoginRouter.get("/login/github", async (c) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, [ "user:email" ]);
  setCookie(c, "github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
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
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${ tokens.accessToken() }`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();
    const existingUser: DatabaseUser | null = (db
      .prepare("SELECT * FROM user WHERE github_id = ?")
      .get(githubUser.id) ?? null) as DatabaseUser | null;
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      return c.redirect("/");
    }

    const userId = generateId(15);
    db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
      userId,
      githubUser.id,
      githubUser.login
    );
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
