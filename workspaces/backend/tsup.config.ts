import { defineConfig } from "tsup";

export default defineConfig({
  entry: [ "src/index.ts" ],
  target: [
    "chrome131", // For Cloudflare Workers
    "node20",
  ],
  format: "esm",

  dts: true,
  sourcemap: true,

  treeshake: false,
  minify: false,
  splitting: false,
  clean: true,
});
