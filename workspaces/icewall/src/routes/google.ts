import { ArcticFetchError, Google, OAuth2RequestError, decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";
import { IcewallUsersTable } from "../db/schema/user.ts";
import { generateId } from "../libs/crypto.ts";
import { isLocal } from "../libs/utils.ts";
import type { IcewallEnv } from "../types.ts";

type GitHubUser = {
  id: number;
  login: string;
};

export const google = new Hono<IcewallEnv>()
  .get("/login/google", async (c) => {
    const {
      SERVER_ENV,
      PROTOCOL_AND_HOST,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    } = env(c);

    if (typeof GOOGLE_CLIENT_ID !== "string" || typeof GOOGLE_CLIENT_SECRET !== "string") {
      throw new Error("GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set as environment variable(s).");
    }

    if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
      throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
    }

    const google = new Google(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${ PROTOCOL_AND_HOST }/login/google/callback`,
    );
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [ "openid", "profile" ]);

    setCookie(c, "google_oauth_state", state, {
      path: "/",
      secure: !isLocal(c),
      httpOnly: true,
      maxAge: 60 * 10, // 10 mins
      sameSite: "Strict",
    });
    setCookie(c, "google_code_verifier", codeVerifier, {
      path: "/",
      secure: !isLocal(c),
      httpOnly: true,
      maxAge: 60 * 10, // 10 mins
      sameSite: "Strict",
    });

    return c.redirect(url.toString());
  }).get("/login/google/callback", async (c) => {
    const {
      SERVER_ENV,
      PROTOCOL_AND_HOST,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    } = env(c);
    if (typeof GOOGLE_CLIENT_ID !== "string" || typeof GOOGLE_CLIENT_SECRET !== "string") {
      throw new Error("GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set as environment variable(s).");
    }

    if (SERVER_ENV !== "production" && SERVER_ENV !== "staging" && SERVER_ENV !== "development") {
      throw new Error(`Unexpected SERVER_ENV: "${ SERVER_ENV }"`);
    }

    const google = new Google(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${ PROTOCOL_AND_HOST }/login/google/callback`,
    );

    const code = c.req.query("code")?.toString();
    const state = c.req.query("state")?.toString();
    const {
      google_oauth_state: storedState,
      google_code_verifier: storedCodeVerifier,
    } = getCookie(c);

    if (!code || !state || !storedState || state !== storedState) {
      return c.text("Failed to authenticate with GitHub. Sorry, this is probably caused by a bug or incident of this service or GitHub.", 400);
    }
    try {
      const drizzle = c.get("drizzle");
      const lucia = c.get("lucia");

      const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
      const accessToken = tokens.accessToken();

      const accessTokenExpiresInSeconds = tokens.accessTokenExpiresInSeconds();
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
      const refreshToken = tokens.refreshToken();
      const idToken = decodeIdToken(tokens.idToken());

console.log(idToken)

return;
      // const githubUserResponse = await fetch("https://api.github.com/user", {
      //   headers: {
      //     Authorization: `Bearer ${ tokens.accessToken() }`,
      //     Accept: "application/vnd.github+json",
      //     "X-GitHub-Api-Version": "2022-11-28",
      //     "User-Agent": "Icewall",
      //   },
      // });
      // const githubUser: GitHubUser = await githubUserResponse.json();
      // const [ existingUser ] = await drizzle.select().from(IcewallUsers)
      //   .limit(1)
      //   .where(eq(IcewallUsers.githubId, githubUser.id));

      // if (existingUser) {
      //   const session = await lucia.createSession(existingUser.id);
      //   c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      //   return c.redirect("/");
      // }

      // const userId = generateId(15);
      // await drizzle.insert(IcewallUsers).values({
      //   id: userId,
      //   githubId: githubUser.id,
      //   username: githubUser.login,
      // });

      // const session = await lucia.createSession(userId);
      // c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      // return c.redirect("/");
    } catch (err) {
      if (err instanceof OAuth2RequestError && err.message.endsWith("bad_verification_code")) {
        console.error(err);
        return c.text("Failed to authenticate with Google due to invalid verification code. Sorry, this is probably caused by a bug or incident of this service or Google.", 400);
      } else if (err instanceof ArcticFetchError) {
        console.error(err.cause, err);
        return c.text("Failed to authenticate with Google due to failure of fetch. Sorry, this is probably caused by a bug or incident of this service or Google.", 500);
      } else {
        console.error(err);
        return c.text("Failed to authenticate with Google due to unexpected error. Sorry, this is probably caused by a bug or incident of this service or Google. Error code: G-UNEXPECTED.", 500);
      }
    }
  });
