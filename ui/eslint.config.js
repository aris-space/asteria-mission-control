import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', "packages"]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.base,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "react-refresh/only-export-components": [
        "off"
      ],
      "react-hooks/exhaustive-deps": ["off"],
      // Ignore unused variables in function parameters. This is needed
      // because typescript types like `(name: string) => void` would complain
      // that the `name` variable is never used (_very stupid_).
      "no-unused-vars": ["warn", { "argsIgnorePattern": "*" }],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "*"}]
    }
  },
])
