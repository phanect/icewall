import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { IcedGateUsersTable } from "./user.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateSessionsTable = sqliteTable("IcedGateSessions", {
  id: text().primaryKey(),
  fresh: integer({ mode: "boolean" })
    .notNull(),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
  userId: text()
    .notNull()
    .references(() => IcedGateUsersTable.id),
});

export type IcedGateSession = InferSelectModel<typeof IcedGateSessionsTable>;
