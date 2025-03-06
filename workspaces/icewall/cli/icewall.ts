import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cwd } from "node:process";
import { command, run } from "@drizzle-team/brocli";
import { cmd } from "@phanect/utils";
import { parse as jsoncParse } from "jsonc-parser";
import type { Config as DrizzleConfig } from "drizzle-kit";
import type { Config } from "../src/libs.ts";

const generateDrizzleConfig = async (): Promise<string> => {
  const configPath = join(cwd(), "icewall.config.json");
  const configString: string = (await readFile(configPath)).toString();
  const config = jsoncParse(configString) as Config;

  const drizzleConfig: DrizzleConfig = {
    ...config,

    schema: join(import.meta.dirname, "../src/db/schema"),
  };

  const tmpDirPath = await mkdtemp(join(tmpdir(), "icewall-"));
  const drizzleConfigPath = join(tmpDirPath, "drizzle.config.json");
  await writeFile(drizzleConfigPath, JSON.stringify(drizzleConfig));

  return drizzleConfigPath;
};

await run([
  command({
    name: "generate",
    handler: async () => {
      const drizzleConfigPath = await generateDrizzleConfig();
      await cmd(`npx drizzle-kit generate --config="${ drizzleConfigPath }"`);
    },
  }),
  command({
    name: "migrate",
    handler: async () => {
      const drizzleConfigPath = await generateDrizzleConfig();
      await cmd(`npx drizzle-kit migrate --config="${ drizzleConfigPath }"`);
    },
  }),
  command({
    name: "push",
    handler: async () => {
      const drizzleConfigPath = await generateDrizzleConfig();
      await cmd(`npx drizzle-kit push --config="${ drizzleConfigPath }"`);
    },
  }),
]);
