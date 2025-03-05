// @ts-nocheck TODO
/* eslint-disable */
import sqlite from "better-sqlite3";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { testAdapter, databaseUser } from "./utils/test-adapter.ts";
import { DrizzleSQLiteAdapter } from "../src/libs/adapter-sqlite.ts";

const sqliteDB = sqlite(":memory:");

sqliteDB.exec(`CREATE TABLE user (
  id TEXT NOT NULL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE
)`).exec(`CREATE TABLE user_session (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  country TEXT,
  FOREIGN KEY (user_id) REFERENCES user(id)
)`);

sqliteDB
  .prepare("INSERT INTO user (id, username) VALUES (?, ?)")
  .run(databaseUser.id, databaseUser.attributes.username);

const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
});

const sessionTable = sqliteTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
  country: text("country"),
});

const db = drizzle(sqliteDB);

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

await testAdapter(adapter);
