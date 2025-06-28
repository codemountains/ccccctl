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
			type: "registry_directory",
			name: "history",
			description: "Show prompt history.",
		},
		{
			type: "github",
			name: "example",
			description: "Example command.",
			url: "https://github.com/codemountains/cccc-example/.claude/commands/example.md",
		},
	],
};

describe("registry utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock process.cwd to return expected value
		mockProcessCwd.mockReturnValue("/workspace/ccccctl");
		// Clear the registry cache
		clearRegistryCache();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getRegistryPath", () => {
		it("should return current working directory path when it exists", () => {
			const cwdPath = "/workspace/ccccctl/registry/registry.yml";
			mockExistsSync.mockImplementation((path) => path === cwdPath);

			const result = getRegistryPath();
			expect(result).toBe(cwdPath);
		});

		it("should return relative path when cwd path does not exist", () => {
			mockExistsSync.mockReturnValue(false);

			const result = getRegistryPath();
			expect(result).toContain("/registry/registry.yml");
		});
	});

	describe("loadRegistry", () => {
		it("should load registry from local file in development mode", () => {
			const registryPath = "/workspaces/ccccctl/registry/registry.yml";
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = loadRegistry();

			expect(mockReadFileSync).toHaveBeenCalledWith(registryPath, "utf-8");
			expect(mockLoad).toHaveBeenCalledWith("yaml content");
			expect(result).toEqual(mockRegistry);
		});

		it("should throw error when registry file not found in development mode", () => {
			// Mock to simulate development mode but file doesn't exist
			const registryPath = "/workspaces/ccccctl/registry/registry.yml";
			mockExistsSync.mockImplementation((path) => {
				if (path === registryPath) {
					// First call for isDevelopmentMode returns true, second call for file existence returns false
					return mockExistsSync.mock.calls.length === 1;
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
			const registryPath = "/workspaces/ccccctl/registry/registry.yml";
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
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
				"https://raw.githubusercontent.com/codemountains/ccccctl/main/registry/registry.yml",
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
				"Failed to fetch registry from https://raw.githubusercontent.com/codemountains/ccccctl/main/registry/registry.yml: 404 Not Found",
			);
		});
	});

	describe("findCommand", () => {
		it("should find existing command", () => {
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = findCommand("history");

			expect(result).toEqual({
				type: "registry_directory",
				name: "history",
				description: "Show prompt history.",
			});
		});

		it("should return undefined for non-existing command", () => {
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = findCommand("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("findCommandAsync", () => {
		it("should find existing command", async () => {
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = await findCommandAsync("example");

			expect(result).toEqual({
				type: "github",
				name: "example",
				description: "Example command.",
				url: "https://github.com/codemountains/cccc-example/.claude/commands/example.md",
			});
		});

		it("should return undefined for non-existing command", async () => {
			// Mock development mode detection - isDevelopmentMode checks both cwd and dist paths
			mockExistsSync.mockImplementation((path) => {
				return (
					path === "/workspaces/ccccctl/registry/registry.yml" ||
					(typeof path === 'string' && path.endsWith("registry/registry.yml"))
				);
			});
			mockReadFileSync.mockReturnValue("yaml content");
			mockLoad.mockReturnValue(mockRegistry);

			const result = await findCommandAsync("nonexistent");

			expect(result).toBeUndefined();
		});
	});
});
