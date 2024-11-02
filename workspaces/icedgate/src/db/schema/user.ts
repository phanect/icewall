import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateUsers = sqliteTable("IcedGateUsers", {
  id: text().primaryKey(),
  username: text().unique().notNull(),
  githubId: int().unique(),
});

export type IcedGateUser = InferSelectModel<typeof IcedGateUsers>;
