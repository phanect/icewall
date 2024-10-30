export type Options = {
  platform: "cloudflare"; // TODO: | "vercel" | "bun" | "deno" | "lambda" | "lambda-edge" | "fastly" | "lagon" | "winterjs" | "nodejs"
  favicon?: string;
  outDir?: string;
  google?: {
    serviceAccountJsonPath?: string;
  };
};
