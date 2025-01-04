import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    schema: "src/schema.ts",
  },
  target: [
    "chrome131", // For Cloudflare Workers
    "node20",
  ],
  format: [
    "esm",
    "cjs", // Required because drizzle-kit read schema code as CJS as of drizzle-kit@0.30.1
  ],

  dts: true,
  sourcemap: true,

  treeshake: false,
  minify: false,
  splitting: false,
  clean: true,
});
