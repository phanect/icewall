import { IcewallUsersTable } from "./schema/user.ts";
import {
  integer,
  table,
  text,
  type ColumnBuilderBase,
  type dialect,
  type TableExtraConfigValue,
  type TableWithColumns,
  type TextBuilderInitial,
} from "./dbms.ts";
import type { BuildColumns } from "drizzle-orm";

export type UserPropsTable = TableWithColumns<{
  name: "IcewallUserProps";
  schema: undefined;
  columns: BuildColumns<"IcewallUserProps", {
    userId: TextBuilderInitial<"", [string, ...string[]], undefined>;
  }, dialect>;
  dialect: dialect;
}>;

/**
 * Define a IcewallUserProps table schema.
 * @param columns - columns of the table.
 * @param extraConfig - extraConfig of the table.
 * @returns Table object.
 */
export const defineIcewallUserPropsTable = <TColumnsMap extends Record<string, ColumnBuilderBase>>(
  columns: TColumnsMap,
  extraConfig?: (
    self: BuildColumns<"IcewallUserProps", TColumnsMap, dialect>,
  ) => TableExtraConfigValue[]
) => {
  if (columns.id !== undefined) {
    throw new Error("Column `userId` is reserved.");
  } else if (columns.userId !== undefined) {
    throw new Error("Column `userId` is reserved.");
  }

  return table("IcewallUserProps", {
    ...columns,
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => IcewallUsersTable.id),
  }, extraConfig);
};
