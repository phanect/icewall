import { integer, table, text } from "../dbms.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcewallUsersTable = table("IcewallUsers", {
  id: text().primaryKey(),
  email: text().unique().notNull(),
  githubId: integer().unique(),
  githubDisplayId: text().unique(),
});

export type IcewallUser = InferSelectModel<typeof IcewallUsersTable>;
