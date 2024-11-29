import { core, nodejs } from "@phanect/lint";

/** @type { import("eslint").Linter.Config[] } */
export default [
  {
    ignores: [
      "**/dist/**",
    ],
  },

  ...core,
  ...nodejs,

  {
    // Do not add `files: [ "*" ],` here.

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [ "./workspaces/backend/**" ],
    rules: {
      // To allow experimental`fetch()` on Node.js v20.
      // You can use `fetch()` without any Node.js CLI options.
      "n/no-unsupported-features/node-builtins": [ "error", {
        allowExperimental: true,
      }],
    },
  },
];
