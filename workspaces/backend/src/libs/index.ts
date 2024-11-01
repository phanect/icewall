export { Lucia } from "./core.ts";
export { Scrypt, LegacyScrypt, generateId, generateIdFromEntropySize } from "./crypto.ts";
export { TimeSpan } from "./date.ts";
export { Cookie, type CookieAttributes } from "./cookie.ts";
export { verifyRequestOrigin } from "./request.ts";

export type {
  User,
  Session,
  SessionCookieOptions,
  SessionCookieAttributesOptions,
} from "./core.ts";
export type { DatabaseSession, DatabaseUser, Adapter } from "./database.ts";
export type { PasswordHashingAlgorithm } from "./crypto.ts";

import type { Lucia } from "./core.ts";

export type Register = {};

export type UserId = Register extends {
  UserId: infer _UserId;
}
  ? _UserId
  : string;

export type RegisteredLucia = Register extends {
  Lucia: infer _Lucia;
}
  ? _Lucia extends Lucia<object, object>
    ? _Lucia
    : Lucia
  : Lucia;

export type RegisteredDatabaseUserAttributes = Register extends {
  DatabaseUserAttributes: infer _DatabaseUserAttributes;
}
  ? _DatabaseUserAttributes
  : {};

export type RegisteredDatabaseSessionAttributes = Register extends {
  DatabaseSessionAttributes: infer _DatabaseSessionAttributes;
}
  ? _DatabaseSessionAttributes
  : {};
