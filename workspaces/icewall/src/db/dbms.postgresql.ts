import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

export {
  pgTable as table,
  boolean,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";

export type Database = PgDatabase<PgQueryResultHKT>;
