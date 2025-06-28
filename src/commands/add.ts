import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
		console.error("Cannot specify both --project and --user options");
		process.exit(1);
	}

	// Default to project mode if neither is specified
	const useUserDir = options.user === true;

	try {
		const command = await findCommandAsync(commandName);
		if (!command) {
			console.error(`Command "${commandName}" not found in registry`);
			process.exit(1);
		}

		if (commandExists(targetName, useUserDir)) {
			const scope = useUserDir ? "user" : "project";
			console.error(`Command "${targetName}" already exists in ${scope} scope. Please remove it first using: ccccctl remove ${targetName}${useUserDir ? " --user" : ""}`);
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
		} else if (command.type === "github" && command.url) {
			await downloadCommand(command.url, targetName, useUserDir);
			console.log(`Added command "${targetName}" from ${command.url}`);
		} else {
			console.error(`Invalid command configuration for "${commandName}"`);
			process.exit(1);
		}
	} catch (error) {
		console.error(`Failed to add command "${commandName}":`, error);
		process.exit(1);
	}
}
