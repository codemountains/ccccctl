import { describe, test, expect } from "vitest";
import type { RegistryCommand, Registry } from "@/types/registry.js";

describe("Registry Type Definitions", () => {
	describe("RegistryCommand type safety", () => {
		test("should accept valid ccccctl_registry command", () => {
			const command: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test-command",
				author: "test-author",
				description: "Test description",
			};

			expect(command.type).toBe("ccccctl_registry");
			expect(command.name).toBe("test-command");
			expect(command.author).toBe("test-author");
			expect(command.description).toBe("Test description");
			// ccccctl_registry型にはurlプロパティがないことを確認
			expect("url" in command).toBe(false);
		});

		test("should accept valid github command", () => {
			const command: RegistryCommand = {
				type: "github",
				name: "github-command",
				author: "github-author",
				description: "GitHub command description",
				url: "https://example.com/command.md",
			};

			expect(command.type).toBe("github");
			expect(command.name).toBe("github-command");
			expect(command.author).toBe("github-author");
			expect(command.description).toBe("GitHub command description");
			expect(command.url).toBe("https://example.com/command.md");
		});
	});

	describe("Registry type safety", () => {
		test("should accept valid registry with mixed command types", () => {
			const registry: Registry = {
				commands: [
					{
						type: "ccccctl_registry",
						name: "local-command",
						author: "local-author",
						description: "Local command",
					},
					{
						type: "github",
						name: "remote-command",
						author: "remote-author",
						description: "Remote command",
						url: "https://example.com/remote.md",
					},
				],
			};

			expect(registry.commands).toHaveLength(2);
			expect(registry.commands[0].type).toBe("ccccctl_registry");
			expect(registry.commands[1].type).toBe("github");
		});

		test("should accept empty commands array", () => {
			const registry: Registry = {
				commands: [],
			};

			expect(registry.commands).toHaveLength(0);
		});
	});

	describe("Type guard functions", () => {
		function isCcccctlRegistryCommand(
			command: RegistryCommand,
		): command is RegistryCommand & { type: "ccccctl_registry" } {
			return command.type === "ccccctl_registry";
		}

		function isGithubCommand(
			command: RegistryCommand,
		): command is RegistryCommand & { type: "github"; url: string } {
			return command.type === "github";
		}

		test("should correctly identify ccccctl_registry commands", () => {
			const command: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "desc",
			};

			expect(isCcccctlRegistryCommand(command)).toBe(true);
			expect(isGithubCommand(command)).toBe(false);

			if (isCcccctlRegistryCommand(command)) {
				// TypeScriptの型システムにより、ここではurlプロパティにアクセスできない
				expect(command.type).toBe("ccccctl_registry");
				// @ts-expect-error - urlプロパティは存在しない
				expect(command.url).toBeUndefined();
			}
		});

		test("should correctly identify github commands", () => {
			const command: RegistryCommand = {
				type: "github",
				name: "test",
				author: "author",
				description: "desc",
				url: "https://example.com",
			};

			expect(isGithubCommand(command)).toBe(true);
			expect(isCcccctlRegistryCommand(command)).toBe(false);

			if (isGithubCommand(command)) {
				// TypeScriptの型システムにより、ここではurlプロパティにアクセスできる
				expect(command.url).toBe("https://example.com");
			}
		});
	});

	describe("Discriminated union behavior", () => {
		test("should handle command type discrimination correctly", () => {
			const commands: RegistryCommand[] = [
				{
					type: "ccccctl_registry",
					name: "local",
					author: "author1",
					description: "desc1",
				},
				{
					type: "github",
					name: "remote",
					author: "author2",
					description: "desc2",
					url: "https://example.com",
				},
			];

			const processCommand = (command: RegistryCommand): string => {
				switch (command.type) {
					case "ccccctl_registry":
						// この分岐では、TypeScriptはcommandがCcccctlRegistryCommand型であることを知っている
						return `Local command: ${command.name}`;
					case "github":
						// この分岐では、TypeScriptはcommandがGithubCommand型であることを知っている
						return `GitHub command: ${command.name} at ${command.url}`;
					default:
						// TypeScriptの exhaustiveness check
						const _exhaustiveCheck: never = command;
						return _exhaustiveCheck;
				}
			};

			expect(processCommand(commands[0])).toBe("Local command: local");
			expect(processCommand(commands[1])).toBe("GitHub command: remote at https://example.com");
		});
	});

	describe("Type inference and narrowing", () => {
		test("should narrow types based on type property", () => {
			const commands: RegistryCommand[] = [
				{
					type: "ccccctl_registry",
					name: "local",
					author: "author",
					description: "desc",
				},
				{
					type: "github",
					name: "remote",
					author: "author",
					description: "desc",
					url: "https://example.com",
				},
			];

			const githubCommands = commands.filter(
				(cmd): cmd is RegistryCommand & { type: "github"; url: string } =>
					cmd.type === "github",
			);

			const localCommands = commands.filter(
				(cmd): cmd is RegistryCommand & { type: "ccccctl_registry" } =>
					cmd.type === "ccccctl_registry",
			);

			expect(githubCommands).toHaveLength(1);
			expect(localCommands).toHaveLength(1);

			// 型が正しく推論されていることを確認
			if (githubCommands.length > 0) {
				expect(githubCommands[0].url).toBe("https://example.com");
			}

			if (localCommands.length > 0) {
				// @ts-expect-error - ccccctl_registry型にはurlプロパティがない
				expect(localCommands[0].url).toBeUndefined();
			}
		});
	});
});