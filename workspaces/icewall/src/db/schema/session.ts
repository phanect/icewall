import { table, boolean, text, timestamp } from "../dbms.ts";
import { IcedGateUsersTable } from "./user.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateSessionsTable = table("IcedGateSessions", {
  id: text().primaryKey(),
  fresh: boolean().notNull(),
  expiresAt: timestamp().notNull(),
  userId: text()
    .notNull()
    .references(() => IcedGateUsersTable.id),
});

export type IcedGateSession = InferSelectModel<typeof IcedGateSessionsTable>;
