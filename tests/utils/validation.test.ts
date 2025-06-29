import { describe, expect, test } from "vitest";
import { validateRegistryCommand, validateRegistry } from "@/utils/validation.js";
import { RegistryError } from "@/types/index.js";

describe("validation utilities", () => {
	describe("validateRegistryCommand", () => {
		test("should validate ccccctl_registry command", () => {
			const data = {
				type: "ccccctl_registry",
				name: "test-command",
				author: "test-author",
				description: "Test command description",
			};

			const result = validateRegistryCommand(data);

			expect(result).toEqual({
				type: "ccccctl_registry",
				name: "test-command",
				author: "test-author",
				description: "Test command description",
			});
		});

		test("should validate github command with url", () => {
			const data = {
				type: "github",
				name: "test-command",
				author: "test-author",
				description: "Test command description",
				url: "https://example.com/test.md",
			};

			const result = validateRegistryCommand(data);

			expect(result).toEqual({
				type: "github",
				name: "test-command",
				author: "test-author",
				description: "Test command description",
				url: "https://example.com/test.md",
			});
		});

		test("should throw error for non-object input", () => {
			expect(() => validateRegistryCommand(null)).toThrow("Command must be an object");
			expect(() => validateRegistryCommand("string")).toThrow("Command must be an object");
			expect(() => validateRegistryCommand([])).toThrow("Command must be an object");
		});

		test("should throw error for missing name", () => {
			const data = {
				type: "ccccctl_registry",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty name");
		});

		test("should throw error for empty name", () => {
			const data = {
				type: "ccccctl_registry",
				name: "",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty name");
		});

		test("should throw error for missing description", () => {
			const data = {
				type: "ccccctl_registry",
				name: "test-command",
				author: "test-author",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty description");
		});

		test("should throw error for empty description", () => {
			const data = {
				type: "ccccctl_registry",
				name: "test-command",
				author: "test-author",
				description: "",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty description");
		});

		test("should throw error for missing author", () => {
			const data = {
				type: "ccccctl_registry",
				name: "test-command",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty author");
		});

		test("should throw error for empty author", () => {
			const data = {
				type: "ccccctl_registry",
				name: "test-command",
				author: "",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a non-empty author");
		});

		test("should throw error for missing type", () => {
			const data = {
				name: "test-command",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow("Command must have a type");
		});

		test("should throw error for invalid type", () => {
			const data = {
				type: "invalid-type",
				name: "test-command",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow('Command has invalid type "invalid-type"');
		});

		test("should throw error for github command without url", () => {
			const data = {
				type: "github",
				name: "test-command",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data)).toThrow('Command with type "github" must have a non-empty url');
		});

		test("should throw error for github command with empty url", () => {
			const data = {
				type: "github",
				name: "test-command",
				author: "test-author",
				description: "Test description",
				url: "",
			};

			expect(() => validateRegistryCommand(data)).toThrow('Command with type "github" must have a non-empty url');
		});

		test("should include index in error message when provided", () => {
			const data = {
				type: "invalid-type",
				name: "test-command",
				author: "test-author",
				description: "Test description",
			};

			expect(() => validateRegistryCommand(data, 2)).toThrow('Command at index 2 has invalid type "invalid-type"');
		});
	});

	describe("validateRegistry", () => {
		test("should validate valid registry", () => {
			const data = {
				commands: [
					{
						type: "ccccctl_registry",
						name: "test-command",
						author: "test-author",
						description: "Test description",
					},
					{
						type: "github",
						name: "github-command",
						author: "github-author",
						description: "GitHub description",
						url: "https://example.com/test.md",
					},
				],
			};

			const result = validateRegistry(data, "test.yml");

			expect(result).toEqual({
				commands: [
					{
						type: "ccccctl_registry",
						name: "test-command",
						author: "test-author",
						description: "Test description",
					},
					{
						type: "github",
						name: "github-command",
						author: "github-author",
						description: "GitHub description",
						url: "https://example.com/test.md",
					},
				],
			});
		});

		test("should throw RegistryError for non-object input", () => {
			expect(() => validateRegistry(null, "test.yml")).toThrow(RegistryError);
			expect(() => validateRegistry(null, "test.yml")).toThrow("Registry must be an object");
		});

		test("should throw RegistryError for missing commands", () => {
			const data = {};

			expect(() => validateRegistry(data, "test.yml")).toThrow(RegistryError);
			expect(() => validateRegistry(data, "test.yml")).toThrow("Registry must have a 'commands' array");
		});

		test("should throw RegistryError for non-array commands", () => {
			const data = {
				commands: "not-an-array",
			};

			expect(() => validateRegistry(data, "test.yml")).toThrow(RegistryError);
			expect(() => validateRegistry(data, "test.yml")).toThrow("Registry must have a 'commands' array");
		});

		test("should throw RegistryError for invalid command", () => {
			const data = {
				commands: [
					{
						type: "invalid-type",
						name: "test-command",
						author: "test-author",
						description: "Test description",
					},
				],
			};

			expect(() => validateRegistry(data, "test.yml")).toThrow(RegistryError);
			expect(() => validateRegistry(data, "test.yml")).toThrow("Command at index 0 has invalid type");
		});

		test("should throw RegistryError for duplicate command names", () => {
			const data = {
				commands: [
					{
						type: "ccccctl_registry",
						name: "duplicate-name",
						author: "author1",
						description: "First command",
					},
					{
						type: "github",
						name: "duplicate-name",
						author: "author2",
						description: "Second command",
						url: "https://example.com/test.md",
					},
				],
			};

			expect(() => validateRegistry(data, "test.yml")).toThrow(RegistryError);
			expect(() => validateRegistry(data, "test.yml")).toThrow("Duplicate command names found: duplicate-name");
		});

		test("should validate empty commands array", () => {
			const data = {
				commands: [],
			};

			const result = validateRegistry(data, "test.yml");

			expect(result).toEqual({
				commands: [],
			});
		});
	});
});