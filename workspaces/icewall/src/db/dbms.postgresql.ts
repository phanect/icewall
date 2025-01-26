import type {
  PgDatabase,
  PgQueryResultHKT,
  text,
} from "drizzle-orm/pg-core";

export {
  pgTable as table,
  boolean,
  timestamp,
  text,
  integer,
  type PgTableWithColumns as TableWithColumns,
  type PgColumnBuilderBase as ColumnBuilderBase,
  type PgTableExtraConfigValue as TableExtraConfigValue,
} from "drizzle-orm/pg-core";

export type dialect = "pg";

export type TextBuilderInitial = ReturnType<typeof text>;
export type Database = PgDatabase<PgQueryResultHKT>;
