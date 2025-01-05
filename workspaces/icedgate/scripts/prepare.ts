import { copyFile, rm } from "node:fs/promises";
import { join } from "node:path";

// TODO read dialect from user configuration
const dialect: "sqlite" | "postgresql" | "mysql" = "sqlite";

await rm(join(import.meta.dirname, "../src/db/dbms.ts"), { force: true });
await copyFile(
  join(import.meta.dirname, `../src/db/dbms.${ dialect }.ts`),
  join(import.meta.dirname, "../src/db/dbms.ts"),
);
