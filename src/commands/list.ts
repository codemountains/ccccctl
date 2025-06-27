import { loadRegistry } from "../utils/registry.js";

export function listCommand(): void {
	try {
		const registry = loadRegistry();

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
	} catch (error) {
		console.error("Failed to list commands:", error);
		process.exit(1);
	}
}
