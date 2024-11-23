import { existsSync as exists } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { argv, cwd } from "node:process";
import type { PackageJson } from "type-fest";

const cwdPath = cwd();
// must starts with slash (/) because this value is written to .gitignore
const schemaRelativePath = "/prisma/schema/icedgate.prisma";

const copySchemaFile = async (): Promise<void> => {
  const schemaAbsolutePath = join(cwdPath, schemaRelativePath);

  await mkdir(dirname(schemaAbsolutePath), { recursive: true });
  await copyFile(
    join(import.meta.dirname, "../..", schemaRelativePath),
    schemaAbsolutePath,
  );
};

const copyTemplates = async (): Promise<void> => {
  const files = [
    {
      src: join(import.meta.dirname, "../../prisma/schema/schema.prisma"),
      dest: join(cwdPath, "prisma/schema/schema.prisma"),
    },
  ];

  await Promise.all(files.map(async (file) => {
    await mkdir(dirname(file.src), { recursive: true });
    return copyFile(file.src, file.dest);
  }));
};

const gitignoreSchema = async (): Promise<void> => {
  const gitignorePath = join(cwdPath, ".gitignore");

  if (exists(gitignorePath)) {
    const gitignoreContent = (await readFile(gitignorePath)).toString();

    for (const gitignoreLine of gitignoreContent.split("\n")) {
      if (gitignoreLine.trim() === schemaRelativePath) {
        return;
      }
    }

    // If schemaRelativePath is not found in .gitignore
    await writeFile(gitignorePath, `${ gitignoreContent }

# IcedGate
${ schemaRelativePath }
`);
  } else { // if .gitignore does not exist
    await writeFile(gitignorePath, schemaRelativePath);
  }
};

const addNpmScripts = async (): Promise<void> => {
  const packageJsonPath = join(cwdPath, "package.json");
  let packageJson: PackageJson;

  if (exists(packageJsonPath)) {
    packageJson = JSON.parse((await readFile(packageJsonPath)).toString()) as PackageJson;

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    if (packageJson.scripts.build) {
      packageJson.scripts.build = `icedgate build && ${ packageJson.scripts.build }`;
    } else {
      packageJson.scripts.build = "icedgate build";
    }

    if (packageJson.scripts.prepare) {
      packageJson.scripts.prepare += " && icedgate build";
    } else {
      packageJson.scripts.prepare = "icedgate build";
    }
  } else {
    packageJson = {
      scripts: {
        build: "icedgate build",
        prepare: "icedgate build",
      },
    };
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
};

const [ ,, subCommand ] = argv;

if (subCommand === "init") {
  await Promise.all([
    copyTemplates(),
    gitignoreSchema(),
    addNpmScripts(),
  ]);
} else if (subCommand === "build") {
  await copySchemaFile();
} else {
  throw new Error(`Unknown subcommand "${ subCommand }". Only \`icedgate init\` and \`icedgate build\` are allowed.`);
}
