import { OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { IcedGateUsers } from "../db/schema/user.ts";
import { generateId } from "../libs/crypto.ts";
import { github, lucia } from "../libs/auth.ts";
import type { IcedGateEnv } from "../types.ts";

type GitHubUser = {
  id: number;
  login: string;
};

export const githubLoginRouter = new Hono<IcedGateEnv>();

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
  const code = c.req.query("code")?.toString();
  const state = c.req.query("state")?.toString();
  const storedState = getCookie(c).github_oauth_state;
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
    const [ existingUser ] = await drizzle.select().from(IcedGateUsers)
      .limit(1)
      .where(eq(IcedGateUsers.githubId, githubUser.id));

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      return c.redirect("/");
    }

    const userId = generateId(15);
    await drizzle.insert(IcedGateUsers).values({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
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
