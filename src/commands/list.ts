import { isCcccctlError } from "@/types.js";
import { loadRegistryAsync } from "@/utils/registry.js";

export async function listCommand(): Promise<void> {
	try {
		const registry = await loadRegistryAsync();

		console.log("Available commands:");
		console.log("");

		registry.commands.forEach((command) => {
			console.log(`  ${command.name}`);
			console.log(`    Description: ${command.description}`);
			console.log(`    Type: ${command.type}`);
			if (command.url) {
				console.log(`    URL: ${command.url}`);
			}
			console.log("");
		});
	} catch (error: unknown) {
		if (isCcccctlError(error)) {
			console.error(error.message);
		} else {
			console.error("Failed to list commands:", error);
		}
		process.exit(1);
	}
}
