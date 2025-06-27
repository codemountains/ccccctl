import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
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
});
