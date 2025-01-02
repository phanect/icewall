import { copyFile, rm } from "node:fs/promises";
import { join } from "node:path";
import drizzleConfig from "../drizzle.config.ts";

if (
  drizzleConfig.dialect !== "sqlite"
  && drizzleConfig.dialect !== "postgresql"
  && drizzleConfig.dialect !== "mysql"
) {
  throw new Error(`Unsupported dialect ${ drizzleConfig.dialect } configured in drizzle.config.ts.`);
}

await rm(join(import.meta.dirname, "../src/db/dbms.ts"), { force: true });
await copyFile(
  join(import.meta.dirname, `../src/db/dbms.${ drizzleConfig.dialect }.ts`),
  join(import.meta.dirname, "../src/db/dbms.ts"),
);
