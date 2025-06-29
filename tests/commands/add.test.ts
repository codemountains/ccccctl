import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	commandExists,
	copyLocalCommand,
	downloadCommand,
} from "@/utils/files.js";
import { findCommandAsync, getRegistryPath } from "@/utils/registry.js";
import { addCommand } from "@/commands/add.js";
import { RegistryCommand } from "@/types/registry.js";

vi.mock("node:fs");
vi.mock("@/utils/files.js");
vi.mock("@/utils/registry.js");

const mockExistsSync = vi.mocked(existsSync);
const mockCommandExists = vi.mocked(commandExists);
const mockCopyLocalCommand = vi.mocked(copyLocalCommand);
const mockDownloadCommand = vi.mocked(downloadCommand);
const mockFindCommandAsync = vi.mocked(findCommandAsync);
const mockGetRegistryPath = vi.mocked(getRegistryPath);

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
	.spyOn(console, "error")
	.mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit unexpectedly called");
});

describe("addCommand", () => {
	beforeEach(() => {
		// Only clear the call history, don't reset implementations
		mockFindCommandAsync.mockClear();
		mockCommandExists.mockClear();
		mockCopyLocalCommand.mockClear();
		mockDownloadCommand.mockClear();
		mockGetRegistryPath.mockClear();
		mockExistsSync.mockClear();
		mockConsoleLog.mockClear();
		mockConsoleError.mockClear();
		mockProcessExit.mockClear();
	});

	it("should exit with error when both --project and --user options are specified", async () => {
		const options = { project: true, user: true };

		await expect(addCommand("test-command", options)).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockConsoleError).toHaveBeenCalledWith(
			"Cannot specify both --project and --user options",
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should exit with error when command is not found in registry", async () => {
		mockFindCommandAsync.mockResolvedValue(undefined);

		await expect(addCommand("nonexistent-command", {})).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockFindCommandAsync).toHaveBeenCalledWith("nonexistent-command");
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Command "nonexistent-command" not found in registry',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should exit with error when command already exists in project scope", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(true);

		await expect(addCommand("test-command", {})).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", false);
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Command "test-command" already exists in project scope. Please remove it first using: ccccctl remove test-command',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should exit with error when command already exists in user scope", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(true);

		await expect(addCommand("test-command", { user: true })).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", true);
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Command "test-command" already exists in user scope. Please remove it first using: ccccctl remove test-command --user',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should add ccccctl_registry command from local registry in development mode", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);
		mockGetRegistryPath.mockReturnValue(
			"/workspace/ccccctl/.registry/registry.yml",
		);
		mockExistsSync.mockReturnValue(true);

		await addCommand("test-command", {});

		expect(mockCopyLocalCommand).toHaveBeenCalledWith(
			"/workspace/ccccctl/.registry/commands/test-command/test-command.md",
			"test-command",
			false,
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Added command "test-command" from local registry',
		);
	});

	it("should add ccccctl_registry command from GitHub in production mode", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);
		mockGetRegistryPath.mockReturnValue(
			"/workspace/ccccctl/.registry/registry.yml",
		);
		mockExistsSync.mockReturnValue(false);

		await addCommand("test-command", {});

		expect(mockDownloadCommand).toHaveBeenCalledWith(
			"https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/commands/test-command/test-command.md",
			"test-command",
			false,
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Added command "test-command" from GitHub registry',
		);
	});

	it("should add github command with custom URL", async () => {
		const mockCommand: RegistryCommand = {
			type: "github",
			name: "custom-command",
			author: "custom-author",
			description: "Custom command",
			url: "https://github.com/user/repo/.claude/commands/custom.md",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);

		await addCommand("custom-command", {});

		expect(mockDownloadCommand).toHaveBeenCalledWith(
			"https://github.com/user/repo/.claude/commands/custom.md",
			"custom-command",
			false,
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Added command "custom-command" from https://github.com/user/repo/.claude/commands/custom.md',
		);
	});

	it("should use custom name when --name option is provided", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);
		mockGetRegistryPath.mockReturnValue(
			"/workspace/ccccctl/.registry/registry.yml",
		);
		mockExistsSync.mockReturnValue(true);

		await addCommand("test-command", { name: "my-custom-name" });

		expect(mockCopyLocalCommand).toHaveBeenCalledWith(
			"/workspace/ccccctl/.registry/commands/test-command/test-command.md",
			"my-custom-name",
			false,
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Added command "my-custom-name" from local registry',
		);
	});

	it("should use user directory when --user option is true", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);
		mockGetRegistryPath.mockReturnValue(
			"/workspace/ccccctl/.registry/registry.yml",
		);
		mockExistsSync.mockReturnValue(true);

		await addCommand("test-command", { user: true });

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", true);
		expect(mockCopyLocalCommand).toHaveBeenCalledWith(
			"/workspace/ccccctl/.registry/commands/test-command/test-command.md",
			"test-command",
			true,
		);
	});

	it("should exit with error for invalid command configuration", async () => {
		const mockCommand: any = {
			type: "unknown",
			name: "invalid-command",
			author: "invalid-author",
			description: "Invalid command with unknown type",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);

		await expect(addCommand("invalid-command", {})).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockConsoleError).toHaveBeenCalledWith(
			'Invalid command configuration for "invalid-command"',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should exit with error when command addition fails", async () => {
		const mockCommand: RegistryCommand = {
			type: "ccccctl_registry",
			name: "test-command",
			author: "test-author",
			description: "Test command",
		};

		mockFindCommandAsync.mockResolvedValue(mockCommand);
		mockCommandExists.mockReturnValue(false);
		mockGetRegistryPath.mockReturnValue(
			"/workspace/ccccctl/.registry/registry.yml",
		);
		mockExistsSync.mockReturnValue(true);
		mockCopyLocalCommand.mockImplementation(() => {
			throw new Error("Copy failed");
		});

		await expect(addCommand("test-command", {})).rejects.toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockConsoleError).toHaveBeenCalledWith(
			'Failed to add command "test-command":',
			expect.any(Error),
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});
});
