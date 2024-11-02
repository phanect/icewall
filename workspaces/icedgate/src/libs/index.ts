export { Lucia } from "./core.ts";
export { Scrypt, LegacyScrypt, generateId, generateIdFromEntropySize } from "./crypto.ts";
export { TimeSpan } from "./date.ts";
export { Cookie, type CookieAttributes } from "./cookie.ts";
export { verifyRequestOrigin } from "./request.ts";

export type {
  SessionCookieOptions,
  SessionCookieAttributesOptions,
} from "./core.ts";
export type { Adapter } from "./database.ts";
export type { PasswordHashingAlgorithm } from "./crypto.ts";

import type { Lucia } from "./core.ts";

export type Register = {};

export type RegisteredLucia = Register extends {
  Lucia: infer _Lucia;
}
  ? _Lucia extends Lucia<object, object>
    ? _Lucia
    : Lucia
  : Lucia;
