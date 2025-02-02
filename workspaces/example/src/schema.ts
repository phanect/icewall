import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
import { defineIcewallUserPropsTable } from "icewall";
import { IcewallUsersTable } from "icewall/schema";
import type { UserPropsTable as UserPropsTableType } from "../../icewall/src/db/user-props.ts";

export { IcewallUsersTable, IcewallSessionsTable } from "icewall/schema";

export const UserPropsTable: UserPropsTableType = defineIcewallUserPropsTable({
  name: text(),
});

relations(UserPropsTable, ({ one }) => ({
  IcewallUsersTable: one(IcewallUsersTable),
}));

relations(IcewallUsersTable, ({ one }) => ({
  UserPropsTable: one(UserPropsTable),
}));
