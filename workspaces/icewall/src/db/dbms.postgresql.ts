import type {
  PgDatabase,
  PgQueryResultHKT,
} from "drizzle-orm/pg-core";

export {
  pgTable as table,
  boolean,
  timestamp,
  text,
  integer,
  type PgColumnBuilderBase as ColumnBuilderBase,
  type PgTableExtraConfigValue as TableExtraConfigValue,
} from "drizzle-orm/pg-core";

export type dialect = "pg";

export type Database = PgDatabase<PgQueryResultHKT>;
