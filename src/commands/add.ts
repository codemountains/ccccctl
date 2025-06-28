import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	ConfigurationError,
	FileSystemError,
	isCcccctlError,
	RegistryError,
} from "@/types.js";
import {
	commandExists,
	copyLocalCommand,
	downloadCommand,
} from "@/utils/files.js";
import { findCommandAsync, getRegistryPath } from "@/utils/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function addCommand(
	commandName: string,
	options: { name?: string; project?: boolean; user?: boolean },
): Promise<void> {
	const targetName = options.name || commandName;

	// Check for exclusive options
	if (options.project && options.user) {
		const error = ConfigurationError.invalidOptionsCombination([
			"--project",
			"--user",
		]);
		console.error(error.message);
		process.exit(1);
	}

	// Default to project mode if neither is specified
	const useUserDir = options.user === true;

	try {
		const command = await findCommandAsync(commandName);
		if (!command) {
			const error = RegistryError.commandNotFound(commandName);
			console.error(error.message);
			process.exit(1);
		}

		if (commandExists(targetName, useUserDir)) {
			const scope = useUserDir ? "user" : "project";
			const error = FileSystemError.commandExists(targetName, scope);
			console.error(error.message);
			process.exit(1);
		}

		if (command.type === "registry_directory") {
			// Check if we're in development mode (local registry exists)
			const localRegistryPath = getRegistryPath();
			if (existsSync(localRegistryPath)) {
				// Development mode: use local file
				const registryDir = dirname(localRegistryPath);
				const sourcePath = join(
					registryDir,
					"commands",
					commandName,
					`${commandName}.md`,
				);
				copyLocalCommand(sourcePath, targetName, useUserDir);
				console.log(`Added command "${targetName}" from local registry`);
			} else {
				// Production mode: download from GitHub
				const githubUrl = `https://raw.githubusercontent.com/codemountains/ccccctl/main/registry/commands/${commandName}/${commandName}.md`;
				await downloadCommand(githubUrl, targetName, useUserDir);
				console.log(`Added command "${targetName}" from GitHub registry`);
			}
		} else if (command.type === "github") {
			await downloadCommand(command.url, targetName, useUserDir);
			console.log(`Added command "${targetName}" from ${command.url}`);
		} else {
			const error = ConfigurationError.invalidCommandConfig(commandName);
			console.error(error.message);
			process.exit(1);
		}
	} catch (error: unknown) {
		if (isCcccctlError(error)) {
			console.error(error.message);
		} else {
			console.error(`Failed to add command "${commandName}":`, error);
		}
		process.exit(1);
	}
}
