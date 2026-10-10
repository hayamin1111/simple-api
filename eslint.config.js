import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  js.configs.recommended, // JS向けの基本チェック
  ...tseslint.configs.recommended, //TS向けの基本チェック
  {
    files: ["**/*.ts"],
    rules: {
      // 使ってない変数を警告
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
);
