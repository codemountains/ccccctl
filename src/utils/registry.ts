import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Registry, RegistryCommand } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getRegistryPath(): string {
	return join(__dirname, "../../registry/registry.yml");
}

export function loadRegistry(): Registry {
	const registryPath = getRegistryPath();

	if (!existsSync(registryPath)) {
		throw new Error(`Registry file not found: ${registryPath}`);
	}

	const registryContent = readFileSync(registryPath, "utf-8");
	return load(registryContent) as Registry;
}

export function findCommand(commandName: string): RegistryCommand | undefined {
	const registry = loadRegistry();
	return registry.commands.find((cmd) => cmd.name === commandName);
}
