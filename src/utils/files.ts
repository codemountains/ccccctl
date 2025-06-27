import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import fsExtra from "fs-extra";
import fetch from "node-fetch";

const { ensureDirSync, copyFileSync, removeSync, existsSync } = fsExtra;

export function getClaudeCommandsDir(useUserDir = false): string {
	if (useUserDir) {
		return join(homedir(), ".claude", "commands");
	}
	return join(process.cwd(), ".claude", "commands");
}

export function ensureClaudeCommandsDir(useUserDir = false): void {
	const claudeDir = getClaudeCommandsDir(useUserDir);
	ensureDirSync(claudeDir);
}

export function getLocalCommandPath(
	commandName: string,
	useUserDir = false,
): string {
	return join(getClaudeCommandsDir(useUserDir), `${commandName}.md`);
}

export function copyLocalCommand(
	sourcePath: string,
	commandName: string,
	useUserDir = false,
): void {
	ensureClaudeCommandsDir(useUserDir);
	const targetPath = getLocalCommandPath(commandName, useUserDir);
	copyFileSync(sourcePath, targetPath);
}

function convertGitHubUrlToRaw(url: string): string {
	// GitHub blob URL to raw URL conversion
	// https://github.com/user/repo/blob/branch/path/file.md
	// -> https://raw.githubusercontent.com/user/repo/branch/path/file.md
	const githubBlobPattern =
		/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;
	const match = url.match(githubBlobPattern);

	if (match) {
		const [, user, repo, pathWithBranch] = match;
		return `https://raw.githubusercontent.com/${user}/${repo}/${pathWithBranch}`;
	}

	return url; // Return original URL if not a GitHub blob URL
}

export async function downloadCommand(
	url: string,
	commandName: string,
	useUserDir = false,
): Promise<void> {
	ensureClaudeCommandsDir(useUserDir);
	const targetPath = getLocalCommandPath(commandName, useUserDir);

	// Convert GitHub blob URLs to raw URLs
	const rawUrl = convertGitHubUrlToRaw(url);

	const response = await fetch(rawUrl);
	if (!response.ok) {
		throw new Error(
			`Failed to download command from ${rawUrl}: ${response.statusText}`,
		);
	}

	const content = await response.text();
	writeFileSync(targetPath, content);
}

export function removeCommand(commandName: string, useUserDir = false): void {
	const targetPath = getLocalCommandPath(commandName, useUserDir);
	if (existsSync(targetPath)) {
		removeSync(targetPath);
	}
}

export function commandExists(
	commandName: string,
	useUserDir = false,
): boolean {
	const targetPath = getLocalCommandPath(commandName, useUserDir);
	return existsSync(targetPath);
}
