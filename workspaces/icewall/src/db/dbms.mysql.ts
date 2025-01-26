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
} from "drizzle-orm/mysql-core";

export type Database = MySqlDatabase<MySqlQueryResultHKT, PreparedQueryHKTBase>;
