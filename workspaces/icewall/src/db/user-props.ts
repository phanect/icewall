import { IcewallUsersTable } from "./schema/user.ts";
import {
  table,
  text,
  type ColumnBuilderBase,
  type dialect,
  type TableExtraConfigValue,
} from "./dbms.ts";
import type { BuildColumns, ColumnBuilderBaseConfig, ColumnDataType } from "drizzle-orm";

/**
 * Define a IcewallUserProps table schema.
 * @param columns - columns of the table.
 * @param extraConfig - extraConfig of the table.
 * @returns Table object.
 */
export const defineIcewallUserPropsTable = <TColumnsMap extends Record<string, ColumnBuilderBase<ColumnBuilderBaseConfig<ColumnDataType, string>>>>(
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

export type UserPropsTable = ReturnType<typeof defineIcewallUserPropsTable>;
