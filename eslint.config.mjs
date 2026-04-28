import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tailwindEntry = fileURLToPath(new URL("./src/app/globals.css", import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.{js,mjs,cjs}",
      "next-env.d.ts"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:tailwindcss/recommended"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: false
        }
      ],
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off"
    },
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: tailwindEntry
      }
    }
  }
];

export default eslintConfig;
