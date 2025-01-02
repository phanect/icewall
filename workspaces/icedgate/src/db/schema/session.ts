import { table, boolean, text, timestamp } from "../dbms.ts";
import { IcedGateUsers } from "./user.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateSessions = table("IcedGateSessions", {
  id: text().primaryKey(),
  fresh: boolean().notNull(),
  expiresAt: timestamp().notNull(),
  userId: text()
    .notNull()
    .references(() => IcedGateUsers.id),
});

export type IcedGateSession = InferSelectModel<typeof IcedGateSessions>;
