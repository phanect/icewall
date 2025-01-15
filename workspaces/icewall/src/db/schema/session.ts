import { table, boolean, text, timestamp } from "../dbms.ts";
import { IcewallUsersTable } from "./user.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcewallSessionsTable = table("IcewallSessions", {
  id: text().primaryKey(),
  fresh: boolean().notNull(),
  expiresAt: timestamp().notNull(),
  userId: text()
    .notNull()
    .references(() => IcewallUsersTable.id),
});

export type IcewallSession = InferSelectModel<typeof IcewallSessionsTable>;
