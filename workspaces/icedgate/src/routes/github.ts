import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";
import { IcedGateUsers } from "../db/schema/user.ts";
import { generateId } from "../libs/crypto.ts";
import { isLocal } from "../libs/utils.ts";
import type { IcedGateEnv } from "../types.ts";

type GitHubUser = {
  id: number;
  login: string;
};

export const github = new Hono<IcedGateEnv>()
  .get("/login/github", async (c) => {
    const {
      SERVER_ENV,
      PROTOCOL_AND_HOST,
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
    } = env(c);

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      throw new Error("GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET are not set as environment variable(s).");
    }

    if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
      throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
    }

    const github = new GitHub(
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
      `${ PROTOCOL_AND_HOST }/login/github/callback`,
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
  }).get("/login/github/callback", async (c) => {
    const {
      SERVER_ENV,
      PROTOCOL_AND_HOST,
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
    } = env(c);

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      throw new Error("GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET are not set as environment variable(s).");
    }

    if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
      throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
    }

    const github = new GitHub(
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
      `${ PROTOCOL_AND_HOST }/login/github/callback`,
    );

    const code = c.req.query("code")?.toString();
    const state = c.req.query("state")?.toString();
    const storedState = getCookie(c).github_oauth_state;
    if (!code || !state || !storedState || state !== storedState) {
      return c.text("Failed to authenticate with GitHub. Sorry, this is probably caused by a bug or incident of this service or GitHub.", 400);
    }
    try {
      const drizzle = c.get("drizzle");
      const lucia = c.get("lucia");

      const tokens = await github.validateAuthorizationCode(code);
      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${ tokens.accessToken() }`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "IcedGate",
        },
      });
      const githubUser: GitHubUser = await githubUserResponse.json();
      const [ existingUser ] = await drizzle.select().from(IcedGateUsers)
        .limit(1)
        .where(eq(IcedGateUsers.githubId, githubUser.id));

      if (existingUser) {
        const session = await lucia.createSession(existingUser.id);
        c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
        return c.redirect("/");
      }

      const userId = generateId(15);
      await drizzle.insert(IcedGateUsers).values({
        id: userId,
        githubId: githubUser.id,
        username: githubUser.login,
      });

      const session = await lucia.createSession(userId);
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
