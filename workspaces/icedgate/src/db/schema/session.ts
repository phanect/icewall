import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { IcedGateUsers } from "./user.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateSessions = sqliteTable("IcedGateSessions", {
  id: text().primaryKey(),
  fresh: integer({ mode: "boolean" })
    .notNull(),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
  userId: text()
    .notNull()
    .references(() => IcedGateUsers.id),
});

export type IcedGateSession = InferSelectModel<typeof IcedGateSessions>;
