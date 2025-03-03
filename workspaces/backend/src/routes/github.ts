import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "../libs/crypto.ts";
import { prisma, getLuciaInstance } from "../libs/auth.ts";
import { isLocal } from "../libs/utils.ts";
import type { Env } from "../libs/types.ts";

type GitHubUser = {
  id: number;
  login: string;
};

export const githubLoginRouter = new Hono<Env>();

githubLoginRouter.get("/login/github", async (c) => {
  const {
    SERVER_ENV,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
  } = env(c);

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET are not set as environment variable(s).");
  }

  if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
    throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
  }

  const { hostname } = constants(SERVER_ENV);

  const github = new GitHub(
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    `${ hostname }/login/github/callback`,
  );
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
  const {
    SERVER_ENV,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
  } = env(c);

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET are not set as environment variable(s).");
  }

  if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
    throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
  }

  const { hostname } = constants(SERVER_ENV);

  const github = new GitHub(
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    `${ hostname }/login/github/callback`,
  );

  const code = c.req.query("code")?.toString() ?? null;
  const state = c.req.query("state")?.toString() ?? null;
  const storedState = getCookie(c).github_oauth_state ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return c.text("Failed to authenticate with GitHub. Sorry, this is probably caused by a bug or incident of this service or GitHub.", 400);
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
      const session = await lucia.createSession(existingUser.id, { fresh: false });
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

    const session = await lucia.createSession(userId, { fresh: true });
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
    return c.redirect("/");
  } catch (e) {
    console.error(e);

    if (e instanceof OAuth2RequestError && e.message.endsWith("bad_verification_code")) {
      return c.text("Failed to authenticate with GitHub due to invalid verification code. Sorry, this is probably caused by a bug or incident of this service or GitHub.", 400);
    }
    return c.text("Failed to authenticate with GitHub due to unexpected error. Sorry, this is probably caused by a bug or incident of this service or GitHub.", 500);
  }
});
