import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ["**/*.tsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  globalIgnores([
    "node_modules/**",
    "browser-automation-app/**",
    "dist/**",
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;
