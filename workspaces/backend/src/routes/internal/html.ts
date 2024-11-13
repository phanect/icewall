import { readFile } from "node:fs/promises";

export async function renderHTMLTemplate(
  filePath: string,
  args: Record<string, string>
): Promise<string> {
  const templateFile = await readFile(filePath);
  let template = templateFile.toString("utf-8");
  for (const key in args) {
    template = template.replaceAll(`%${ key }%`, args[key]);
  }
  return template;
}
