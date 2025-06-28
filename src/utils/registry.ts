import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Registry, RegistryCommand } from "@/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_URL =
	"https://raw.githubusercontent.com/codemountains/ccccctl/main/registry/registry.yml";

// Simple in-memory cache
let registryCache: Registry | null = null;

// Export function to clear cache for testing
export function clearRegistryCache(): void {
	registryCache = null;
}

export function getRegistryPath(): string {
	// Try to find the registry.yml file from the current working directory or from the package root
	const cwdPath = join(process.cwd(), "registry/registry.yml");
	if (existsSync(cwdPath)) {
		return cwdPath;
	}

	// For development, look relative to the dist directory
	return join(__dirname, "../../registry/registry.yml");
}

function isDevelopmentMode(): boolean {
	// Check if we're in development (registry directory exists locally)
	const cwdPath = join(process.cwd(), "registry/registry.yml");
	const distPath = join(__dirname, "../../registry/registry.yml");
	return existsSync(cwdPath) || existsSync(distPath);
}

async function fetchRegistryFromGitHub(): Promise<Registry> {
	const response = await globalThis.fetch(REGISTRY_URL, {
		headers: {
			"User-Agent": "ccccctl",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch registry from GitHub: ${response.status} ${response.statusText}`,
		);
	}

	const registryContent = await response.text();
	return load(registryContent) as Registry;
}

export async function loadRegistryAsync(): Promise<Registry> {
	// Return cached version if available
	if (registryCache) {
		return registryCache;
	}

	let registry: Registry;

	if (isDevelopmentMode()) {
		// Development mode: use local file
		const registryPath = getRegistryPath();
		const registryContent = readFileSync(registryPath, "utf-8");
		registry = load(registryContent) as Registry;
	} else {
		// Production mode: fetch from GitHub
		registry = await fetchRegistryFromGitHub();
	}

	// Cache the result
	registryCache = registry;
	return registry;
}

export function loadRegistry(): Registry {
	// Synchronous version for backward compatibility
	if (isDevelopmentMode()) {
		const registryPath = getRegistryPath();
		if (!existsSync(registryPath)) {
			throw new Error(`Registry file not found: ${registryPath}`);
		}
		const registryContent = readFileSync(registryPath, "utf-8");
		return load(registryContent) as Registry;
	} else {
		throw new Error(
			"Registry must be loaded asynchronously in production mode. Use loadRegistryAsync() instead.",
		);
	}
}

export async function findCommandAsync(
	commandName: string,
): Promise<RegistryCommand | undefined> {
	const registry = await loadRegistryAsync();
	return registry.commands.find((cmd) => cmd.name === commandName);
}

export function findCommand(commandName: string): RegistryCommand | undefined {
	const registry = loadRegistry();
	return registry.commands.find((cmd) => cmd.name === commandName);
}
