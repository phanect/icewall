import { integer, table, boolean, text, timestamp } from "./dbms.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcewallUsersTable = table("IcewallUsers", {
  id: text().primaryKey(),
  email: text().unique().notNull(),
  githubId: integer().unique(),
  githubDisplayId: text().unique(),
});

export const IcewallSessionsTable = table("IcewallSessions", {
  id: text().primaryKey(),
  fresh: boolean().default(true),
  expiresAt: timestamp().notNull(),
  userId: text()
    .notNull()
    .references(() => IcewallUsersTable.id),
});

export type IcewallUser = InferSelectModel<typeof IcewallUsersTable>;
export type IcewallSession = InferSelectModel<typeof IcewallSessionsTable>;
