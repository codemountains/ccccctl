import { existsSync, readFileSync } from "node:fs";
import { load } from "js-yaml";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Registry } from "@/types/registry.js";
import {
	clearRegistryCache,
	findCommand,
	findCommandAsync,
	getRegistryPath,
	loadRegistry,
	loadRegistryAsync,
} from "../../src/utils/registry.js";

vi.mock("node:fs");
vi.mock("js-yaml");

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockLoad = vi.mocked(load);

// Mock process.cwd()
const mockProcessCwd = vi.spyOn(process, "cwd");

// Mock global fetch
globalThis.fetch = vi.fn();

const mockRegistry: Registry = {
	commands: [
		{
			type: "ccccctl_registry",
			name: "history",
			author: "test-author",
			description: "Show prompt history.",
		},
		{
			type: "github",
			name: "example",
			author: "github-author",
			description: "Example command.",
			url: "https://github.com/codemountains/cccc-example/.claude/commands/example.md",
		},
	],
};

describe("registry utilities", () => {
	const TEST_CWD = process.cwd(); // Use actual current working directory

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock process.cwd to return current working directory
		mockProcessCwd.mockReturnValue(TEST_CWD);
		// Clear the registry cache
		clearRegistryCache();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getRegistryPath", () => {
		it("should return current working directory path when it exists", () => {
			const cwdPath = `${TEST_CWD}/.registry/registry.yml`;
			mockExistsSync.mockImplementation((path) => path === cwdPath);

			const result = getRegistryPath();
			expect(result).toBe(cwdPath);
		});

		it("should return relative path when cwd path does not exist", () => {
			mockExistsSync.mockReturnValue(false);

			const result = getRegistryPath();
			expect(result).toContain("/.registry/registry.yml");
		});
	});

	describe("loadRegistry", () => {
		it("should load registry from local file in development mode", () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = loadRegistry();

			expect(mockReadFileSync).toHaveBeenCalledWith(registryPath, "utf-8");
			expect(mockLoad).toHaveBeenCalledWith("yaml content");
			expect(result).toEqual(mockRegistry);
		});

		it("should throw error when registry file not found in development mode", () => {
			// Mock to simulate development mode detection but file doesn't exist for loading
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			let callCount = 0;
			mockExistsSync.mockImplementation((path) => {
				callCount++;
				if (path === registryPath) {
					// First call for isDevelopmentMode returns true, second call for loadRegistry returns false
					return callCount === 1;
				}
				return false;
			});

			expect(() => loadRegistry()).toThrow("Registry file not found:");
		});

		it("should throw error in production mode", () => {
			mockExistsSync.mockReturnValue(false);

			expect(() => loadRegistry()).toThrow(
				"Registry must be loaded asynchronously in production mode",
			);
		});
	});

	describe("loadRegistryAsync", () => {
		it("should load registry from local file in development mode", async () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = await loadRegistryAsync();

			expect(mockReadFileSync).toHaveBeenCalledWith(registryPath, "utf-8");
			expect(mockLoad).toHaveBeenCalledWith("yaml content");
			expect(result).toEqual(mockRegistry);
		});

		it("should fetch registry from GitHub in production mode", async () => {
			mockExistsSync.mockReturnValue(false);

			const mockResponse = {
				ok: true,
				text: () => Promise.resolve("yaml content"),
			};
			const mockFetch = vi.fn().mockResolvedValue(mockResponse);
			globalThis.fetch = mockFetch;
			mockLoad.mockReturnValue(mockRegistry);

			const result = await loadRegistryAsync();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/registry.yml",
				{ headers: { "User-Agent": "ccccctl" } },
			);
			expect(mockLoad).toHaveBeenCalledWith("yaml content");
			expect(result).toEqual(mockRegistry);
		});

		it("should throw error when GitHub fetch fails", async () => {
			mockExistsSync.mockReturnValue(false);

			const mockResponse = {
				ok: false,
				status: 404,
				statusText: "Not Found",
			};
			const mockFetch = vi.fn().mockResolvedValue(mockResponse);
			globalThis.fetch = mockFetch;

			await expect(loadRegistryAsync()).rejects.toThrow(
				"Failed to fetch registry from https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/registry.yml: 404 Not Found",
			);
		});
	});

	describe("findCommand", () => {
		it("should find existing command", () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = findCommand("history");

			expect(result).toEqual({
				type: "ccccctl_registry",
				name: "history",
				author: "test-author",
				description: "Show prompt history.",
			});
		});

		it("should return undefined for non-existing command", () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = findCommand("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("findCommandAsync", () => {
		it("should find existing command", async () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = await findCommandAsync("example");

			expect(result).toEqual({
				type: "github",
				name: "example",
				author: "github-author",
				description: "Example command.",
				url: "https://github.com/codemountains/cccc-example/.claude/commands/example.md",
			});
		});

		it("should return undefined for non-existing command", async () => {
			const registryPath = `${TEST_CWD}/.registry/registry.yml`;
			// Mock development mode detection - isDevelopmentMode checks cwd path exists
			mockExistsSync.mockImplementation((path) => {
				return path === registryPath;
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = await findCommandAsync("nonexistent");

			expect(result).toBeUndefined();
		});
	});
});
