import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Registry } from "@/types/registry.js";
import { loadRegistryAsync } from "@/utils/registry.js";
import { listCommand } from "@/commands/list.js";

vi.mock("@/utils/registry.js");

const mockLoadRegistryAsync = vi.mocked(loadRegistryAsync);

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
	.spyOn(console, "error")
	.mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit unexpectedly called");
});

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
		{
			type: "ccccctl_registry",
			name: "simple",
			author: "simple-author",
			description: "Simple command without URL.",
		},
	],
};

describe("listCommand", () => {
	beforeEach(() => {
		// Only clear the call history, don't reset implementations
		mockLoadRegistryAsync.mockClear();
		mockConsoleLog.mockClear();
		mockConsoleError.mockClear();
		mockProcessExit.mockClear();
	});

	it("should list all available commands with their details", async () => {
		mockLoadRegistryAsync.mockResolvedValue(mockRegistry);

		await listCommand();

		expect(mockLoadRegistryAsync).toHaveBeenCalled();
		expect(mockConsoleLog).toHaveBeenCalledWith("Available commands: 3");
		expect(mockConsoleLog).toHaveBeenCalledWith("");

		// Check that each command is logged with its details
		expect(mockConsoleLog).toHaveBeenCalledWith("[CCCCCTL] history");
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  Description: Show prompt history.",
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  URL: https://github.com/codemountains/ccccctl-registry/tree/main/commands/history/history.md",
		);

		expect(mockConsoleLog).toHaveBeenCalledWith("[GITHUB] example");
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  Description: Example command.",
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  URL: https://github.com/codemountains/cccc-example/.claude/commands/example.md",
		);

		expect(mockConsoleLog).toHaveBeenCalledWith("[CCCCCTL] simple");
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  Description: Simple command without URL.",
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  URL: https://github.com/codemountains/ccccctl-registry/tree/main/commands/simple/simple.md",
		);

		// Check that empty lines are printed after each command (1 header + 1 empty + 3 commands * 5 lines each)
		expect(mockConsoleLog).toHaveBeenCalledTimes(17);
	});

	it("should display command without URL correctly", async () => {
		const registryWithoutUrl: Registry = {
			commands: [
				{
					type: "ccccctl_registry",
					name: "simple",
					author: "simple-author",
					description: "Simple command.",
				},
			],
		};

		mockLoadRegistryAsync.mockResolvedValue(registryWithoutUrl);

		await listCommand();

		expect(mockConsoleLog).toHaveBeenCalledWith("[CCCCCTL] simple");
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  Description: Simple command.",
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  URL: https://github.com/codemountains/ccccctl-registry/tree/main/commands/simple/simple.md",
		);
	});

	it("should handle empty registry", async () => {
		const emptyRegistry: Registry = {
			commands: [],
		};

		mockLoadRegistryAsync.mockResolvedValue(emptyRegistry);

		await listCommand();

		expect(mockLoadRegistryAsync).toHaveBeenCalled();
		expect(mockConsoleLog).toHaveBeenCalledWith("Available commands: 0");
		expect(mockConsoleLog).toHaveBeenCalledWith("");
		// Only header and empty line should be called
		expect(mockConsoleLog).toHaveBeenCalledTimes(2);
	});

	it("should exit with error when registry loading fails", async () => {
		const error = new Error("Failed to load registry");
		mockLoadRegistryAsync.mockRejectedValue(error);

		await expect(listCommand()).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockLoadRegistryAsync).toHaveBeenCalled();
		expect(mockConsoleError).toHaveBeenCalledWith(
			"Failed to list commands:",
			error,
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should display GitHub command with URL correctly", async () => {
		const githubRegistry: Registry = {
			commands: [
				{
					type: "github",
					name: "github-cmd",
					author: "github-author",
					description: "GitHub command with URL.",
					url: "https://raw.githubusercontent.com/user/repo/main/cmd.md",
				},
			],
		};

		mockLoadRegistryAsync.mockResolvedValue(githubRegistry);

		await listCommand();

		expect(mockConsoleLog).toHaveBeenCalledWith("[GITHUB] github-cmd");
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  Description: GitHub command with URL.",
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"  URL: https://raw.githubusercontent.com/user/repo/main/cmd.md",
		);
	});
});
