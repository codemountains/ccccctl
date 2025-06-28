import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import fsExtra from "fs-extra";
import fetch, { Response } from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	commandExists,
	copyLocalCommand,
	downloadCommand,
	ensureClaudeCommandsDir,
	getClaudeCommandsDir,
	getLocalCommandPath,
	removeCommand,
} from "@/utils/files.js";

vi.mock("node:fs");
vi.mock("node:os");
vi.mock("fs-extra");
vi.mock("node-fetch");

const mockWriteFileSync = vi.mocked(writeFileSync);
const mockHomedir = vi.mocked(homedir);
const mockEnsureDirSync = vi.mocked(fsExtra.ensureDirSync);
const mockCopyFileSync = vi.mocked(fsExtra.copyFileSync);
const mockRemoveSync = vi.mocked(fsExtra.removeSync);
const mockExistsSync = vi.mocked(fsExtra.existsSync);
const mockFetch = vi.mocked(fetch);

describe("files utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHomedir.mockReturnValue("/home/user");
		vi.spyOn(process, "cwd").mockReturnValue("/workspace/ccccctl");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getClaudeCommandsDir", () => {
		it("should return project directory path by default", () => {
			const result = getClaudeCommandsDir();
			expect(result).toBe("/workspace/ccccctl/.claude/commands");
		});

		it("should return user directory path when useUserDir is true", () => {
			const result = getClaudeCommandsDir(true);
			expect(result).toBe("/home/user/.claude/commands");
		});
	});

	describe("ensureClaudeCommandsDir", () => {
		it("should ensure project directory exists by default", () => {
			ensureClaudeCommandsDir();
			expect(mockEnsureDirSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands",
			);
		});

		it("should ensure user directory exists when useUserDir is true", () => {
			ensureClaudeCommandsDir(true);
			expect(mockEnsureDirSync).toHaveBeenCalledWith(
				"/home/user/.claude/commands",
			);
		});
	});

	describe("getLocalCommandPath", () => {
		it("should return project command path by default", () => {
			const result = getLocalCommandPath("test-command");
			expect(result).toBe(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
		});

		it("should return user command path when useUserDir is true", () => {
			const result = getLocalCommandPath("test-command", true);
			expect(result).toBe("/home/user/.claude/commands/test-command.md");
		});
	});

	describe("copyLocalCommand", () => {
		it("should copy command to project directory by default", () => {
			const sourcePath = "/source/test-command.md";
			copyLocalCommand(sourcePath, "test-command");

			expect(mockEnsureDirSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands",
			);
			expect(mockCopyFileSync).toHaveBeenCalledWith(
				sourcePath,
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
		});

		it("should copy command to user directory when useUserDir is true", () => {
			const sourcePath = "/source/test-command.md";
			copyLocalCommand(sourcePath, "test-command", true);

			expect(mockEnsureDirSync).toHaveBeenCalledWith(
				"/home/user/.claude/commands",
			);
			expect(mockCopyFileSync).toHaveBeenCalledWith(
				sourcePath,
				"/home/user/.claude/commands/test-command.md",
			);
		});
	});

	describe("downloadCommand", () => {
		it("should download command from URL to project directory", async () => {
			const mockResponse = {
				ok: true,
				text: () =>
					Promise.resolve("# Test Command\n\nThis is a test command."),
			};
			mockFetch.mockResolvedValue(
				mockResponse as unknown as Response,
			);

			const url = "https://raw.githubusercontent.com/user/repo/main/command.md";
			await downloadCommand(url, "test-command");

			expect(mockFetch).toHaveBeenCalledWith(url);
			expect(mockEnsureDirSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands",
			);
			expect(mockWriteFileSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
				"# Test Command\n\nThis is a test command.",
			);
		});

		it("should convert GitHub blob URL to raw URL", async () => {
			const mockResponse = {
				ok: true,
				text: () => Promise.resolve("# Test Command"),
			};
			mockFetch.mockResolvedValue(
				mockResponse as unknown as Response,
			);

			const blobUrl = "https://github.com/user/repo/blob/main/commands/test.md";
			const expectedRawUrl =
				"https://raw.githubusercontent.com/user/repo/main/commands/test.md";

			await downloadCommand(blobUrl, "test-command");

			expect(mockFetch).toHaveBeenCalledWith(expectedRawUrl);
		});

		it("should throw error when download fails", async () => {
			const mockResponse = {
				ok: false,
				statusText: "Not Found",
			};
			mockFetch.mockResolvedValue(
				mockResponse as unknown as Response,
			);

			const url =
				"https://raw.githubusercontent.com/user/repo/main/nonexistent.md";

			await expect(downloadCommand(url, "test-command")).rejects.toThrow(
				"Failed to download command from",
			);
		});
	});

	describe("removeCommand", () => {
		it("should remove command file when it exists", () => {
			mockExistsSync.mockReturnValue(true);

			removeCommand("test-command");

			expect(mockExistsSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
			expect(mockRemoveSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
		});

		it("should not remove command file when it does not exist", () => {
			mockExistsSync.mockReturnValue(false);

			removeCommand("test-command");

			expect(mockExistsSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
			expect(mockRemoveSync).not.toHaveBeenCalled();
		});

		it("should remove command from user directory when useUserDir is true", () => {
			mockExistsSync.mockReturnValue(true);

			removeCommand("test-command", true);

			expect(mockExistsSync).toHaveBeenCalledWith(
				"/home/user/.claude/commands/test-command.md",
			);
			expect(mockRemoveSync).toHaveBeenCalledWith(
				"/home/user/.claude/commands/test-command.md",
			);
		});
	});

	describe("commandExists", () => {
		it("should return true when command exists in project directory", () => {
			mockExistsSync.mockReturnValue(true);

			const result = commandExists("test-command");

			expect(result).toBe(true);
			expect(mockExistsSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
		});

		it("should return false when command does not exist", () => {
			mockExistsSync.mockReturnValue(false);

			const result = commandExists("test-command");

			expect(result).toBe(false);
			expect(mockExistsSync).toHaveBeenCalledWith(
				"/workspace/ccccctl/.claude/commands/test-command.md",
			);
		});

		it("should check user directory when useUserDir is true", () => {
			mockExistsSync.mockReturnValue(true);

			const result = commandExists("test-command", true);

			expect(result).toBe(true);
			expect(mockExistsSync).toHaveBeenCalledWith(
				"/home/user/.claude/commands/test-command.md",
			);
		});
	});
});
