import { readFileSync } from "node:fs";
import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs");
vi.mock("commander");
vi.mock("../src/commands/add.js");
vi.mock("../src/commands/list.js");
vi.mock("../src/commands/remove.js");

const mockReadFileSync = vi.mocked(readFileSync);
const mockCommand = vi.mocked(Command);

const mockPackageJson = {
	name: "ccccctl",
	version: "1.0.0",
	description:
		"Claude Code Custom Commands Control - Manage Claude Code custom commands",
};

describe("CLI index", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mock object for testing
	let mockProgram: Record<string, any>;
	// biome-ignore lint/suspicious/noExplicitAny: Mock object for testing
	let mockCommandInstance: Record<string, any>;

	beforeEach(() => {
		vi.clearAllMocks();

		mockCommandInstance = {
			name: vi.fn().mockReturnThis(),
			description: vi.fn().mockReturnThis(),
			version: vi.fn().mockReturnThis(),
			command: vi.fn().mockReturnThis(),
			argument: vi.fn().mockReturnThis(),
			option: vi.fn().mockReturnThis(),
			action: vi.fn().mockReturnThis(),
			parse: vi.fn(),
		};

		mockProgram = mockCommandInstance;
		mockCommand.mockReturnValue(mockProgram);

		mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

		// Reset modules before each test to ensure fresh imports
		vi.resetModules();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should setup CLI program with correct configuration", async () => {
		// Import the module to trigger the setup
		await import("../src/index.js");

		expect(mockProgram.name).toHaveBeenCalledWith("ccccctl");
		expect(mockProgram.description).toHaveBeenCalledWith(
			"Claude Code Custom Commands Control - Manage Claude Code custom commands",
		);
		expect(mockProgram.version).toHaveBeenCalledWith("1.0.0");
	});

	it("should setup add command with correct configuration", async () => {
		await import("../src/index.js");

		expect(mockProgram.command).toHaveBeenCalledWith("add");
		expect(mockProgram.description).toHaveBeenCalledWith(
			"Add a command from registry to local .claude/commands directory",
		);
		expect(mockProgram.argument).toHaveBeenCalledWith(
			"<command-name>",
			"Name of the command to add",
		);
		expect(mockProgram.option).toHaveBeenCalledWith(
			"-n, --name <name>",
			"Override the command name when adding",
		);
		expect(mockProgram.option).toHaveBeenCalledWith(
			"-P, --project",
			"Store command in project .claude/commands directory (default)",
		);
		expect(mockProgram.option).toHaveBeenCalledWith(
			"-U, --user",
			"Store command in user ~/.claude/commands directory",
		);
	});

	it("should setup remove command with correct configuration", async () => {
		await import("../src/index.js");

		expect(mockProgram.command).toHaveBeenCalledWith("remove");
		expect(mockProgram.description).toHaveBeenCalledWith(
			"Remove a command from local .claude/commands directory",
		);
		expect(mockProgram.argument).toHaveBeenCalledWith(
			"<command-name>",
			"Name of the command to remove",
		);
		expect(mockProgram.option).toHaveBeenCalledWith(
			"-P, --project",
			"Remove command from project .claude/commands directory (default)",
		);
		expect(mockProgram.option).toHaveBeenCalledWith(
			"-U, --user",
			"Remove command from user ~/.claude/commands directory",
		);
	});

	it("should setup list command with correct configuration", async () => {
		await import("../src/index.js");

		expect(mockProgram.command).toHaveBeenCalledWith("list");
		expect(mockProgram.description).toHaveBeenCalledWith(
			"List all available commands in the registry",
		);
	});

	it("should read package.json to get version", async () => {
		await import("../src/index.js");

		expect(mockReadFileSync).toHaveBeenCalledWith(
			expect.stringContaining("package.json"),
			"utf-8",
		);
		expect(mockProgram.version).toHaveBeenCalledWith("1.0.0");
	});

	it("should call parse on the program", async () => {
		await import("../src/index.js");

		expect(mockProgram.parse).toHaveBeenCalled();
	});

	it("should handle different package.json formats", async () => {
		const differentPackageJson = {
			name: "different-name",
			version: "2.0.0",
			description: "Different description",
		};

		mockReadFileSync.mockReturnValue(JSON.stringify(differentPackageJson));

		// Reset modules to force fresh imports with new mocks
		vi.resetModules();

		// Reinitialize the program mock
		mockProgram = mockCommandInstance;
		mockCommand.mockReturnValue(mockProgram);

		await import("../src/index.js");

		expect(mockProgram.version).toHaveBeenCalledWith("2.0.0");
	});
});
