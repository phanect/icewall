import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { optimize as optimizeSVG } from "svgo";

const copyDbmsTs = async () => {
  // TODO read dialect from user configuration
  const dialect: "sqlite" | "postgresql" | "mysql" = "sqlite";

  await rm(join(import.meta.dirname, "../src/db/dbms.ts"), { force: true });
  await copyFile(
    join(import.meta.dirname, `../src/db/dbms.${ dialect }.ts`),
    join(import.meta.dirname, "../src/db/dbms.ts"),
  );
};

const copyDrizzleTs = async () => {
  // TODO read dialect from user configuration
  const dialect: "sqlite" | "sqlite-d1" = "sqlite";

  const src = join(import.meta.dirname, `../src/db/drizzle.${ dialect }.ts`);
  const dest = join(import.meta.dirname, "../src/db/drizzle.ts");

  await rm(dest, { force: true });
  await copyFile(src, dest);
};

const copyIcons = async () => {
  const services = [
    "Google",
    "Facebook",
    "GitHub",
  ];

  const featherIconTargetDirPath = join(import.meta.dirname, "../src/vendor/feathericon/");

  await rm(featherIconTargetDirPath, {
    force: true,
    recursive: true,
  });
  await mkdir(featherIconTargetDirPath, { recursive: true });

  await Promise.all(
    services.map(async (service) => {
      const icon = service.toLowerCase();
      const svgPath = join(import.meta.dirname, `../node_modules/feathericon/build/svg/${ icon }.svg`);

      const svgContent = (await readFile(svgPath)).toString();
      const { data: optimizedSvgContent } = optimizeSVG(svgContent, { path: svgPath });

      await writeFile(
        join(featherIconTargetDirPath, `${ icon }.tsx`),
        `
          import type { FC } from "hono/jsx";
          export const ${ service }Icon: FC = () => (${ optimizedSvgContent });
        `.trim(),
      );
    })
  );
};

await Promise.all([
  copyDbmsTs(),
  copyDrizzleTs(),
  copyIcons(),
]);
