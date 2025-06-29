import type { Registry, RegistryCommand } from "@/types/index.js";
import { RegistryError } from "@/types/index.js";

/**
 * Validates if the given data is a valid RegistryCommand
 */
export function validateRegistryCommand(
	data: unknown,
	index?: number,
): RegistryCommand {
	const prefix = index !== undefined ? `Command at index ${index}` : "Command";

	if (!data || typeof data !== "object" || Array.isArray(data)) {
		throw new Error(`${prefix} must be an object`);
	}

	// At this point we know data is a non-null object
	const obj = data as Record<string, unknown>;

	// Validate required fields
	if (typeof obj.name !== "string" || obj.name.trim() === "") {
		throw new Error(`${prefix} must have a non-empty name`);
	}

	if (typeof obj.author !== "string" || obj.author.trim() === "") {
		throw new Error(`${prefix} must have a non-empty author`);
	}

	if (typeof obj.description !== "string" || obj.description.trim() === "") {
		throw new Error(`${prefix} must have a non-empty description`);
	}

	if (typeof obj.type !== "string") {
		throw new Error(`${prefix} must have a type`);
	}

	// Validate based on command type
	switch (obj.type) {
		case "ccccctl_registry":
			return {
				type: "ccccctl_registry",
				name: obj.name,
				author: obj.author,
				description: obj.description,
			};

		case "github":
			if (typeof obj.url !== "string" || obj.url.trim() === "") {
				throw new Error(
					`${prefix} with type "github" must have a non-empty url`,
				);
			}
			return {
				type: "github",
				name: obj.name,
				author: obj.author,
				description: obj.description,
				url: obj.url,
			};

		default:
			throw new Error(
				`${prefix} has invalid type "${obj.type}". Must be "ccccctl_registry" or "github"`,
			);
	}
}

/**
 * Validates if the given data is a valid Registry
 */
export function validateRegistry(data: unknown, path: string): Registry {
	if (!data || typeof data !== "object") {
		throw RegistryError.validationFailed(path, "Registry must be an object");
	}

	// At this point we know data is a non-null object
	const obj = data as Record<string, unknown>;

	if (!Array.isArray(obj.commands)) {
		throw RegistryError.validationFailed(
			path,
			"Registry must have a 'commands' array",
		);
	}

	// Validate each command
	const validatedCommands: RegistryCommand[] = [];
	for (let i = 0; i < obj.commands.length; i++) {
		try {
			const validatedCommand = validateRegistryCommand(obj.commands[i], i);
			validatedCommands.push(validatedCommand);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown validation error";
			throw RegistryError.validationFailed(path, message);
		}
	}

	// Check for duplicate command names
	const names = validatedCommands.map((cmd) => cmd.name);
	const duplicates = names.filter(
		(name, index) => names.indexOf(name) !== index,
	);
	if (duplicates.length > 0) {
		throw RegistryError.validationFailed(
			path,
			`Duplicate command names found: ${duplicates.join(", ")}`,
		);
	}

	return {
		commands: validatedCommands,
	};
}
