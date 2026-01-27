import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Development-specific stricter rules
    rules: {
      // TypeScript rules - stricter for development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/prefer-const": "warn",
      "@typescript-eslint/no-inferrable-types": "error",
      
      // React rules
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react/no-unescaped-entities": "warn",
      
      // General JavaScript rules
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-unreachable": "error",
      "prefer-const": "warn",
      
      // Next.js specific rules
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error"
    }
  },
  {
    // Override for test files
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
    // Override for API routes
    files: ["**/api/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Allow some any for API flexibility
      "no-unused-vars": "warn"
    }
  }
]);

export default eslintConfig;
