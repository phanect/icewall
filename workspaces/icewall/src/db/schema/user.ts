import { integer, table, text } from "../dbms.ts";
import type { InferSelectModel } from "drizzle-orm";

export const IcewallUsersTable = table("IcewallUsers", {
  id: text().primaryKey(),
  username: text().unique().notNull(),
  googleId: integer().unique(),
  githubId: integer().unique(),
});

export type IcewallUser = InferSelectModel<typeof IcewallUsersTable>;
