import { describe, test, expect } from "vitest";
import {
	isCcccctlRegistryCommand,
	isGithubCommand,
	isRegistryCommandLike,
	filterCommandsByType,
} from "@/utils/type-guards.js";
import type { RegistryCommand } from "@/types/registry.js";

describe("Type Guard Functions", () => {
	describe("isCcccctlRegistryCommand", () => {
		test("should return true for ccccctl_registry commands", () => {
			const command: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "description",
			};

			expect(isCcccctlRegistryCommand(command)).toBe(true);
		});

		test("should return false for github commands", () => {
			const command: RegistryCommand = {
				type: "github",
				name: "test",
				author: "author",
				description: "description",
				url: "https://example.com",
			};

			expect(isCcccctlRegistryCommand(command)).toBe(false);
		});

		test("should narrow type correctly", () => {
			const command: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "description",
			};

			if (isCcccctlRegistryCommand(command)) {
				// TypeScriptの型システムによってccccctl_registry型として認識される
				expect(command.type).toBe("ccccctl_registry");
				// @ts-expect-error - ccccctl_registry型にはurlプロパティがない
				expect(command.url).toBeUndefined();
			}
		});
	});

	describe("isGithubCommand", () => {
		test("should return true for github commands", () => {
			const command: RegistryCommand = {
				type: "github",
				name: "test",
				author: "author",
				description: "description",
				url: "https://example.com",
			};

			expect(isGithubCommand(command)).toBe(true);
		});

		test("should return false for ccccctl_registry commands", () => {
			const command: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "description",
			};

			expect(isGithubCommand(command)).toBe(false);
		});

		test("should narrow type correctly", () => {
			const command: RegistryCommand = {
				type: "github",
				name: "test",
				author: "author",
				description: "description",
				url: "https://example.com",
			};

			if (isGithubCommand(command)) {
				// TypeScriptの型システムによってgithub型として認識される
				expect(command.type).toBe("github");
				expect(command.url).toBe("https://example.com");
			}
		});
	});

	describe("isRegistryCommandLike", () => {
		test("should return true for valid ccccctl_registry command", () => {
			const obj = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "description",
			};

			expect(isRegistryCommandLike(obj)).toBe(true);
		});

		test("should return true for valid github command", () => {
			const obj = {
				type: "github",
				name: "test",
				author: "author",
				description: "description",
				url: "https://example.com",
			};

			expect(isRegistryCommandLike(obj)).toBe(true);
		});

		test("should return false for null", () => {
			expect(isRegistryCommandLike(null)).toBe(false);
		});

		test("should return false for non-object", () => {
			expect(isRegistryCommandLike("string")).toBe(false);
			expect(isRegistryCommandLike(123)).toBe(false);
			expect(isRegistryCommandLike([])).toBe(false);
		});

		test("should return false for object missing required properties", () => {
			expect(
				isRegistryCommandLike({
					name: "test",
					author: "author",
					// description missing
				}),
			).toBe(false);

			expect(
				isRegistryCommandLike({
					type: "ccccctl_registry",
					author: "author",
					description: "description",
					// name missing
				}),
			).toBe(false);
		});

		test("should return false for invalid type", () => {
			expect(
				isRegistryCommandLike({
					type: "invalid_type",
					name: "test",
					author: "author",
					description: "description",
				}),
			).toBe(false);
		});

		test("should return false for github command without url", () => {
			expect(
				isRegistryCommandLike({
					type: "github",
					name: "test",
					author: "author",
					description: "description",
					// url missing
				}),
			).toBe(false);
		});

		test("should return false for properties with wrong types", () => {
			expect(
				isRegistryCommandLike({
					type: "ccccctl_registry",
					name: 123, // should be string
					author: "author",
					description: "description",
				}),
			).toBe(false);
		});
	});

	describe("filterCommandsByType", () => {
		const commands: RegistryCommand[] = [
			{
				type: "ccccctl_registry",
				name: "local1",
				author: "author1",
				description: "description1",
			},
			{
				type: "github",
				name: "remote1",
				author: "author2",
				description: "description2",
				url: "https://example.com/1",
			},
			{
				type: "ccccctl_registry",
				name: "local2",
				author: "author3",
				description: "description3",
			},
			{
				type: "github",
				name: "remote2",
				author: "author4",
				description: "description4",
				url: "https://example.com/2",
			},
		];

		test("should filter ccccctl_registry commands", () => {
			const localCommands = filterCommandsByType(commands, "ccccctl_registry");

			expect(localCommands).toHaveLength(2);
			expect(localCommands[0].name).toBe("local1");
			expect(localCommands[1].name).toBe("local2");

			// 型が正しく推論されていることを確認
			for (const command of localCommands) {
				expect(command.type).toBe("ccccctl_registry");
				// @ts-expect-error - ccccctl_registry型にはurlプロパティがない
				expect(command.url).toBeUndefined();
			}
		});

		test("should filter github commands", () => {
			const githubCommands = filterCommandsByType(commands, "github");

			expect(githubCommands).toHaveLength(2);
			expect(githubCommands[0].name).toBe("remote1");
			expect(githubCommands[1].name).toBe("remote2");

			// 型が正しく推論されていることを確認
			for (const command of githubCommands) {
				expect(command.type).toBe("github");
				expect(typeof command.url).toBe("string");
			}
		});

		test("should return empty array when no matches found", () => {
			const emptyCommands: RegistryCommand[] = [];
			expect(filterCommandsByType(emptyCommands, "ccccctl_registry")).toHaveLength(0);
			expect(filterCommandsByType(emptyCommands, "github")).toHaveLength(0);
		});
	});
});