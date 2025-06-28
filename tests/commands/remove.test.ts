import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	commandExists,
	removeCommand as removeCommandFile,
} from "@/utils/files.js";
import { removeCommand } from "@/commands/remove.js";

vi.mock("@/utils/files.js");

const mockCommandExists = vi.mocked(commandExists);
const mockRemoveCommandFile = vi.mocked(removeCommandFile);

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
	.spyOn(console, "error")
	.mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit unexpectedly called");
});

describe("removeCommand", () => {
	beforeEach(() => {
		// Only clear the call history, don't reset implementations
		mockCommandExists.mockClear();
		mockRemoveCommandFile.mockClear();
		mockConsoleLog.mockClear();
		mockConsoleError.mockClear();
		mockProcessExit.mockClear();
	});

	it("should exit with error when both --project and --user options are specified", () => {
		const options = { project: true, user: true };

		expect(() => removeCommand("test-command", options)).toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockConsoleError).toHaveBeenCalledWith(
			"Cannot specify both --project and --user options",
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should exit with error when command does not exist", () => {
		mockCommandExists.mockReturnValue(false);

		expect(() => removeCommand("nonexistent-command", {})).toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockCommandExists).toHaveBeenCalledWith(
			"nonexistent-command",
			false,
		);
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Command "nonexistent-command" not found in project scope',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should remove command from project directory by default", () => {
		mockCommandExists.mockReturnValue(true);

		removeCommand("test-command", {});

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", false);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith("test-command", false);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Removed command "test-command"',
		);
	});

	it("should remove command from user directory when --user option is true", () => {
		mockCommandExists.mockReturnValue(true);

		removeCommand("test-command", { user: true });

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", true);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith("test-command", true);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Removed command "test-command"',
		);
	});

	it("should use project directory when --project option is true", () => {
		mockCommandExists.mockReturnValue(true);

		removeCommand("test-command", { project: true });

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", false);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith("test-command", false);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Removed command "test-command"',
		);
	});

	it("should handle empty options object", () => {
		mockCommandExists.mockReturnValue(true);

		removeCommand("test-command");

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", false);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith("test-command", false);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Removed command "test-command"',
		);
	});

	it("should exit with error when removal fails", () => {
		mockCommandExists.mockReturnValue(true);
		mockRemoveCommandFile.mockImplementation(() => {
			throw new Error("Remove failed");
		});

		expect(() => removeCommand("test-command", {})).toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", false);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith("test-command", false);
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Failed to remove command "test-command":',
			expect.any(Error),
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should check command existence in user directory when user option is provided", () => {
		mockCommandExists.mockReturnValue(false);

		expect(() => removeCommand("test-command", { user: true })).toThrow(
			"process.exit unexpectedly called",
		);

		expect(mockCommandExists).toHaveBeenCalledWith("test-command", true);
		expect(mockConsoleError).toHaveBeenCalledWith(
			'Command "test-command" not found in user scope',
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	it("should successfully remove existing command with custom name", () => {
		mockCommandExists.mockReturnValue(true);
		mockRemoveCommandFile.mockReturnValue(undefined); // Explicitly mock successful removal

		removeCommand("my-custom-command", {});

		expect(mockCommandExists).toHaveBeenCalledWith("my-custom-command", false);
		expect(mockRemoveCommandFile).toHaveBeenCalledWith(
			"my-custom-command",
			false,
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			'Removed command "my-custom-command"',
		);
	});
});
