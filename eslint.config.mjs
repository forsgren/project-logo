import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["out", "dist", "**/*.d.ts"] },
    {
        files: ["**/*.ts"],
        plugins: { "@typescript-eslint": tseslint.plugin },
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 6,
            sourceType: "module",
        },
        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                { selector: "import", format: ["camelCase", "PascalCase"] },
            ],
            semi: "warn",
            curly: "warn",
            eqeqeq: "warn",
            "no-throw-literal": "warn",
        },
    },
);
