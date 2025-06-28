/// <reference types="vitest" />

import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"],
			fileName: () => "index.js",
		},
		outDir: "dist",
		rollupOptions: {
			external: [
				"commander",
				"fs-extra",
				"js-yaml",
				"node-fetch",
				"node:fs",
				"node:path",
				"node:url",
				"node:process",
				"node:os",
				"fs",
				"path",
				"url",
				"process",
				"os",
			],
		},
		target: "node18",
		minify: false,
	},
	plugins: [
		dts({
			outDir: "dist",
			insertTypesEntry: true,
		}),
	],
	test: {
		environment: "node",
		testTimeout: 10000,
		setupFiles: ["./tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
			exclude: [
				"node_modules/**",
				"dist/**",
				"**/*.test.ts",
				"**/*.spec.ts",
				"vite.config.ts",
				"tests/setup.ts",
			],
			thresholds: {
				global: {
					statements: 80,
					branches: 80,
					functions: 80,
					lines: 80,
				},
			},
		},
		include: ["tests/**/*.{test,spec}.{js,ts}"],
	},
});
