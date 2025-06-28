import {
	ConfigurationError,
	FileSystemError,
	isCcccctlError,
} from "@/types.js";
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
		if (!commandExists(commandName, useUserDir)) {
			const scope = useUserDir ? "user" : "project";
			const error = FileSystemError.commandNotFound(commandName, scope);
			console.error(error.message);
			process.exit(1);
		}

		removeCommandFile(commandName, useUserDir);
		console.log(`Removed command "${commandName}"`);
	} catch (error: unknown) {
		if (isCcccctlError(error)) {
			console.error(error.message);
		} else {
			console.error(`Failed to remove command "${commandName}":`, error);
		}
		process.exit(1);
	}
}
