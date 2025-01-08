import { core } from "@phanect/lint";

/** @type { import("eslint").Linter.Config[] } */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/vendor/**",
    ],
  },

  ...core,

  {
    // Do not add `files: [ "*" ],` here.

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [ "**/*.test.ts" ],
    rules: {
      "n/no-unsupported-features/node-builtins": "off",
    },
  },
];
