import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
import { defineIcewallUserPropsTable } from "icewall";
import { IcewallUsersTable } from "icewall/schema";

export { IcewallUsersTable, IcewallSessionsTable } from "icewall/schema";

export const UserPropsTable = defineIcewallUserPropsTable({
  name: text(),
});

relations(UserPropsTable, ({ one }) => ({
  IcewallUsersTable: one(IcewallUsersTable),
}));

relations(IcewallUsersTable, ({ one }) => ({
  UserPropsTable: one(UserPropsTable),
}));
