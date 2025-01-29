import type {
  MySqlDatabase,
  MySqlQueryResultHKT,
  PreparedQueryHKTBase,
} from "drizzle-orm/mysql-core";

export {
  mysqlTable as table,
  boolean,
  timestamp,
  text,
  int as integer,
  type MySqlColumnBuilderBase as ColumnBuilderBase,
  type MySqlTableExtraConfigValue as TableExtraConfigValue,
} from "drizzle-orm/mysql-core";

export type dialect = "mysql";

export type Database = MySqlDatabase<MySqlQueryResultHKT, PreparedQueryHKTBase>;
