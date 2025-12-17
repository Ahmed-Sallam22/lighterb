import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist"]),

	{
		files: ["**/*.{js,jsx}"],

		plugins: {
			react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},

		languageOptions: {
			ecmaVersion: "latest",
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},

		settings: {
			react: {
				version: "detect",
			},
		},

		rules: {
			/* --- CORE SAFETY --- */
			"no-undef": "error",
			"no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],

			/* --- REACT SAFETY --- */
			"react/jsx-no-undef": "error",

			/* --- HOOKS --- */
			...reactHooks.configs["recommended-latest"].rules,

			/* --- FAST REFRESH --- */
			...reactRefresh.configs.vite.rules,
		},
	},
]);
