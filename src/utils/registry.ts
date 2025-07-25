import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import type { Registry, RegistryCommand } from '@/types/index.js';
import { RegistryError } from '@/types/index.js';
import { validateRegistry } from '@/utils/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_URL =
	'https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/registry.yml';

// Simple in-memory cache
let registryCache: Registry | null = null;

// Export function to clear cache for testing
export function clearRegistryCache(): void {
	registryCache = null;
}

export function getRegistryPath(): string {
	// Try to find the registry.yml file from the current working directory or from the package root
	const cwdPath = join(process.cwd(), '.registry/registry.yml');
	if (existsSync(cwdPath)) {
		return cwdPath;
	}

	// For development, look relative to the dist directory
	return join(__dirname, '../../.registry/registry.yml');
}

function isDevelopmentMode(): boolean {
	// Check if we're in development (.registry directory exists locally)
	const cwdPath = join(process.cwd(), '.registry/registry.yml');
	const distPath = join(__dirname, '../../.registry/registry.yml');
	return existsSync(cwdPath) || existsSync(distPath);
}

async function fetchRegistryFromGitHub(): Promise<Registry> {
	const response = await globalThis.fetch(REGISTRY_URL, {
		headers: {
			'User-Agent': 'ccccctl',
		},
	});

	if (!response.ok) {
		throw RegistryError.fetchFailed(
			REGISTRY_URL,
			response.status,
			response.statusText,
		);
	}

	try {
		const registryContent = await response.text();
		const parsedData = load(registryContent);
		return validateRegistry(parsedData, REGISTRY_URL);
	} catch (error) {
		if (error instanceof RegistryError) {
			throw error;
		}
		throw RegistryError.parseFailed(
			REGISTRY_URL,
			error instanceof Error ? error : undefined,
		);
	}
}

export async function loadRegistryAsync(): Promise<Registry> {
	// Return cached version if available
	if (registryCache) {
		return registryCache;
	}

	let registry: Registry;

	try {
		if (isDevelopmentMode()) {
			// Development mode: use local file
			const registryPath = getRegistryPath();
			if (!existsSync(registryPath)) {
				throw RegistryError.notFound(registryPath);
			}
			const registryContent = readFileSync(registryPath, 'utf-8');
			const parsedData = load(registryContent);
			registry = validateRegistry(parsedData, registryPath);
		} else {
			// Production mode: fetch from GitHub
			registry = await fetchRegistryFromGitHub();
		}
	} catch (error) {
		if (error instanceof RegistryError) {
			throw error;
		}
		if (isDevelopmentMode()) {
			throw RegistryError.parseFailed(
				getRegistryPath(),
				error instanceof Error ? error : undefined,
			);
		}
		throw RegistryError.fetchFailed(REGISTRY_URL);
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
			throw RegistryError.notFound(registryPath);
		}
		try {
			const registryContent = readFileSync(registryPath, 'utf-8');
			const parsedData = load(registryContent);
			return validateRegistry(parsedData, registryPath);
		} catch (error) {
			if (error instanceof RegistryError) {
				throw error;
			}
			throw RegistryError.parseFailed(
				registryPath,
				error instanceof Error ? error : undefined,
			);
		}
	} else {
		throw RegistryError.asyncRequired();
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
