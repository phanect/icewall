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
];
