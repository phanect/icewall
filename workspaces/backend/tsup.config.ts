import { defineConfig } from "tsup";

export default defineConfig({
  entry: [ "src/index.ts" ],
  target: "node20",
  format: "esm",

  dts: false,
  sourcemap: true,

  treeshake: true,
  minify: false,
  splitting: false,
  clean: true,
});
