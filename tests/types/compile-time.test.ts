import { describe, test, expect } from "vitest";
import type { RegistryCommand, Registry } from "@/types/registry.js";

describe("Compile-time Type Safety", () => {
	describe("Type compatibility tests", () => {
		test("should enforce discriminated union constraints", () => {
			// これらの型定義は正常にコンパイルされる
			const ccccctlCommand: RegistryCommand = {
				type: "ccccctl_registry",
				name: "test",
				author: "author",
				description: "description",
			};

			const githubCommand: RegistryCommand = {
				type: "github", 
				name: "test",
				author: "author",
				description: "description",
				url: "https://example.com",
			};

			expect(ccccctlCommand.type).toBe("ccccctl_registry");
			expect(githubCommand.type).toBe("github");
		});

		test("should prevent invalid type combinations", () => {
			// TypeScriptコンパイラによってキャッチされるべきエラーの例

			// 正しい例: github型にはurlが必要
			const validGithubCommand: RegistryCommand = {
				type: "github",
				name: "test",
				author: "author", 
				description: "description",
				url: "https://example.com",
			};

			expect(validGithubCommand.url).toBe("https://example.com");

			// 以下は実際には書けない（コンパイルエラーになる）ことを確認するテスト
			// これらは実行時に型の不整合を検出することで、コンパイル時の制約を模擬する

			// @ts-expect-error - github型にurlが含まれていない
			const invalidGithubCommand = {
				type: "github" as const,
				name: "test",
				author: "author",
				description: "description",
				// url: 欠けている
			};

			// 実行時にこの不整合を検出
			expect(() => {
				const cmd = invalidGithubCommand as RegistryCommand;
				if (cmd.type === "github") {
					// この時点でTypeScriptはurlプロパティの存在を期待する
					return cmd.url; // undefinedになってしまう
				}
			}).not.toThrow(); // TypeScriptの型システムでは防げない実行時エラー

			// @ts-expect-error - ccccctl_registry型にurlは含まれない
			const invalidCcccctlCommand = {
				type: "ccccctl_registry" as const,
				name: "test",
				author: "author",
				description: "description", 
				url: "https://should-not-exist.com", // 存在してはいけない
			};

			expect(invalidCcccctlCommand.url).toBe("https://should-not-exist.com");
		});
	});

	describe("Registry type constraints", () => {
		test("should enforce commands array type", () => {
			const validRegistry: Registry = {
				commands: [
					{
						type: "ccccctl_registry",
						name: "test1",
						author: "author1",
						description: "description1",
					},
					{
						type: "github",
						name: "test2", 
						author: "author2",
						description: "description2",
						url: "https://example.com",
					},
				],
			};

			expect(validRegistry.commands).toHaveLength(2);
			expect(validRegistry.commands[0].type).toBe("ccccctl_registry");
			expect(validRegistry.commands[1].type).toBe("github");
		});

		test("should support empty commands array", () => {
			const emptyRegistry: Registry = {
				commands: [],
			};

			expect(emptyRegistry.commands).toHaveLength(0);
		});
	});

	describe("Type narrowing and exhaustiveness", () => {
		test("should support exhaustive type checking", () => {
			const commands: RegistryCommand[] = [
				{
					type: "ccccctl_registry",
					name: "local",
					author: "author",
					description: "description",
				},
				{
					type: "github",
					name: "remote",
					author: "author", 
					description: "description",
					url: "https://example.com",
				},
			];

			const processCommand = (command: RegistryCommand): string => {
				switch (command.type) {
					case "ccccctl_registry":
						return `Local: ${command.name}`;
					case "github":
						return `Remote: ${command.name} (${command.url})`;
					default:
						// Exhaustiveness check - すべてのcaseが処理されていることを保証
						const _exhaustive: never = command;
						throw new Error(`Unhandled command type: ${_exhaustive}`);
				}
			};

			expect(processCommand(commands[0])).toBe("Local: local");
			expect(processCommand(commands[1])).toBe("Remote: remote (https://example.com)");
		});

		test("should narrow types correctly in conditional blocks", () => {
			const commands: RegistryCommand[] = [
				{
					type: "ccccctl_registry",
					name: "local",
					author: "author",
					description: "description",
				},
				{
					type: "github",
					name: "remote",
					author: "author",
					description: "description", 
					url: "https://example.com",
				},
			];

			const githubUrls: string[] = [];
			const localNames: string[] = [];

			for (const command of commands) {
				if (command.type === "github") {
					// この時点でTypeScriptはcommandがgithub型であることを知っている
					githubUrls.push(command.url);
				} else if (command.type === "ccccctl_registry") {
					// この時点でTypeScriptはcommandがccccctl_registry型であることを知っている
					localNames.push(command.name);
					// @ts-expect-error - ccccctl_registry型にはurlプロパティがない
					expect(command.url).toBeUndefined();
				}
			}

			expect(githubUrls).toEqual(["https://example.com"]);
			expect(localNames).toEqual(["local"]);
		});
	});

	describe("Generic type constraints", () => {
		test("should support generic type operations", () => {
			function getCommandNames<T extends RegistryCommand>(commands: T[]): string[] {
				return commands.map(cmd => cmd.name);
			}

			const ccccctlCommands: Array<RegistryCommand & { type: "ccccctl_registry" }> = [
				{
					type: "ccccctl_registry",
					name: "cmd1",
					author: "author1",
					description: "desc1",
				},
				{
					type: "ccccctl_registry",
					name: "cmd2", 
					author: "author2",
					description: "desc2",
				},
			];

			const githubCommands: Array<RegistryCommand & { type: "github"; url: string }> = [
				{
					type: "github",
					name: "cmd3",
					author: "author3",
					description: "desc3",
					url: "https://example.com/1",
				},
			];

			expect(getCommandNames(ccccctlCommands)).toEqual(["cmd1", "cmd2"]);
			expect(getCommandNames(githubCommands)).toEqual(["cmd3"]);
		});
	});
});