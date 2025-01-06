import { integer, table, text } from "../dbms.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcedGateUsersTable = table("IcedGateUsers", {
  id: text().primaryKey(),
  username: text().unique().notNull(),
  githubId: integer().unique(),
});

export type IcedGateUser = InferSelectModel<typeof IcedGateUsersTable>;
