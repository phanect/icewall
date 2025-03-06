import { defineConfig } from "tsup";
import { universalLib } from "@phanect/configs/tsup";

export default defineConfig({
  ...universalLib,

  entry: [
    "src/index.ts",
  ],
});
