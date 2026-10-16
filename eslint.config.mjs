import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

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
    // Carpeta de referencia de diseño (no es código de producción)
    "_design-reference/**",
  ]),
  prettier,
  // Reglas del proyecto (Reglas 2, 8, 9)
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "Usá imports con alias @/ (Regla 2)",
            },
          ],
        },
      ],
      "max-lines": ["warn", { max: 200 }],
    },
  },
  // Override: desactivar max-lines para el archivo generado por Supabase
  {
    files: ["src/types/database.types.ts"],
    rules: {
      "max-lines": "off",
    },
  },
]);

export default eslintConfig;
