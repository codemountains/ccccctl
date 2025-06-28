import { beforeEach, describe, expect, test, vi } from "vitest";
import { loadRegistryAsync, clearRegistryCache } from "@/utils/registry.js";
import { RegistryError } from "@/types.js";

// Mock the development mode detection
vi.mock("node:fs", async () => {
	const actual = await vi.importActual("node:fs");
	return {
		...actual,
		existsSync: vi.fn().mockReturnValue(false), // Force production mode
	};
});

describe("registry validation integration", () => {
	beforeEach(() => {
		// Reset mocks and clear cache
		vi.resetAllMocks();
		clearRegistryCache();
	});

	test("should throw validation error for invalid YAML structure", async () => {
		// Mock fetch to return invalid YAML
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => "invalid: yaml: structure: [unclosed",
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
	});

	test("should throw validation error for missing commands array", async () => {
		// Mock fetch to return YAML without commands
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => "version: 1.0",
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow("Registry must have a 'commands' array");
	});

	test("should throw validation error for non-array commands", async () => {
		// Mock fetch to return YAML with commands as string
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => "commands: not-an-array",
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow("Registry must have a 'commands' array");
	});

	test("should throw validation error for command missing required fields", async () => {
		// Mock fetch to return YAML with invalid command
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => `
commands:
  - name: test
    # missing type and description
`,
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow("Command at index 0 must have a non-empty description");
	});

	test("should throw validation error for github command without url", async () => {
		// Mock fetch to return YAML with github command missing url
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => `
commands:
  - type: github
    name: test-command
    description: Test description
    # missing url
`,
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow('Command at index 0 with type "github" must have a non-empty url');
	});

	test("should throw validation error for invalid command type", async () => {
		// Mock fetch to return YAML with invalid command type
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => `
commands:
  - type: invalid-type
    name: test-command
    description: Test description
`,
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow('Command at index 0 has invalid type "invalid-type"');
	});

	test("should throw validation error for duplicate command names", async () => {
		// Mock fetch to return YAML with duplicate command names
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => `
commands:
  - type: registry_directory
    name: duplicate-name
    description: First command
  - type: github
    name: duplicate-name
    description: Second command
    url: https://example.com/test.md
`,
		});
		globalThis.fetch = mockFetch;

		await expect(loadRegistryAsync()).rejects.toThrow(RegistryError);
		await expect(loadRegistryAsync()).rejects.toThrow("Duplicate command names found: duplicate-name");
	});

	test("should successfully validate correct registry structure", async () => {
		// Mock fetch to return valid YAML
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => `
commands:
  - type: registry_directory
    name: local-command
    description: Local command description
  - type: github
    name: github-command
    description: GitHub command description
    url: https://example.com/test.md
`,
		});
		globalThis.fetch = mockFetch;

		const registry = await loadRegistryAsync();

		expect(registry).toEqual({
			commands: [
				{
					type: "registry_directory",
					name: "local-command",
					description: "Local command description",
				},
				{
					type: "github",
					name: "github-command",
					description: "GitHub command description",
					url: "https://example.com/test.md",
				},
			],
		});
	});
});