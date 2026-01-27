import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores for CI/CD
    "scripts/**",
    "regression-detection.js",
    "*.config.js",
    "*.config.mjs",
  ]),
  {
    rules: {
      // Allow some flexibility for CI/CD
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      // Keep critical errors as errors
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unused-vars": "warn",
    }
  }
]);

export default eslintConfig;
