import {
	commandExists,
	removeCommand as removeCommandFile,
} from "@/utils/files.js";

export function removeCommand(
	commandName: string,
	options: { project?: boolean; user?: boolean } = {},
): void {
	// Check for exclusive options
	if (options.project && options.user) {
		console.error("Cannot specify both --project and --user options");
		process.exit(1);
	}

	// Default to project mode if neither is specified
	const useUserDir = options.user === true;

	try {
		if (!commandExists(commandName, useUserDir)) {
			console.error(`Command "${commandName}" not found in local commands`);
			process.exit(1);
		}

		removeCommandFile(commandName, useUserDir);
		console.log(`Removed command "${commandName}"`);
	} catch (error) {
		console.error(`Failed to remove command "${commandName}":`, error);
		process.exit(1);
	}
}
