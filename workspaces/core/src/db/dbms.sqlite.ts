import { integer, type BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export {
  sqliteTable as table,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const boolean = (): ReturnType<typeof integer<"boolean">> => integer({ mode: "boolean" });
export const timestamp = (): ReturnType<typeof integer<"timestamp">> => integer({ mode: "timestamp" });

export type Database = BaseSQLiteDatabase<"async" | "sync", object>;
