import { isCcccctlError } from "@/types/index.js";
import { loadRegistryAsync } from "@/utils/registry.js";

function formatDescription(description: string, indent = "  "): string {
	const lines = description.split("\n");
	return lines
		.map((line, index) => {
			if (index === 0) {
				return `${indent}Description: ${line.trim()}`;
			}
			return line.trim() ? `${indent}             ${line.trim()}` : "";
		})
		.filter((line) => line !== "")
		.join("\n");
}

function getCommandTypeLabel(type: string): string {
	switch (type) {
		case "registry_directory":
			return "[CCCCCTL]";
		case "github":
			return "[GITHUB]";
		default:
			return `[${type.toUpperCase()}]`;
	}
}

function generateCcccctlUrl(commandName: string): string {
	return `https://github.com/codemountains/ccccctl/tree/main/registry/commands/${commandName}/${commandName}.md`;
}

export async function listCommand(): Promise<void> {
	try {
		const registry = await loadRegistryAsync();

		console.log(`Available commands: ${registry.commands.length}`);
		console.log("");

		registry.commands.forEach((command) => {
			const typeLabel = getCommandTypeLabel(command.type);
			console.log(`${typeLabel} ${command.name}`);
			console.log(formatDescription(command.description));

			if (command.type === "github") {
				console.log(`  URL: ${command.url}`);
			} else if (command.type === "registry_directory") {
				console.log(`  URL: ${generateCcccctlUrl(command.name)}`);
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
