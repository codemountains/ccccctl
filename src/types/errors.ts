export enum ErrorCode {
	// Registry errors
	REGISTRY_NOT_FOUND = 'REGISTRY_NOT_FOUND',
	REGISTRY_FETCH_FAILED = 'REGISTRY_FETCH_FAILED',
	REGISTRY_PARSE_FAILED = 'REGISTRY_PARSE_FAILED',
	COMMAND_NOT_FOUND_IN_REGISTRY = 'COMMAND_NOT_FOUND_IN_REGISTRY',
	REGISTRY_ASYNC_REQUIRED = 'REGISTRY_ASYNC_REQUIRED',

	// File system errors
	COMMAND_ALREADY_EXISTS = 'COMMAND_ALREADY_EXISTS',
	COMMAND_NOT_FOUND_LOCAL = 'COMMAND_NOT_FOUND_LOCAL',
	FILE_COPY_FAILED = 'FILE_COPY_FAILED',
	FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',
	DIRECTORY_CREATE_FAILED = 'DIRECTORY_CREATE_FAILED',

	// Network errors
	NETWORK_REQUEST_FAILED = 'NETWORK_REQUEST_FAILED',
	DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',

	// Configuration errors
	INVALID_OPTIONS_COMBINATION = 'INVALID_OPTIONS_COMBINATION',
	INVALID_COMMAND_CONFIG = 'INVALID_COMMAND_CONFIG',

	// Validation errors
	INVALID_COMMAND_NAME = 'INVALID_COMMAND_NAME',
	INVALID_URL = 'INVALID_URL',
	REGISTRY_VALIDATION_FAILED = 'REGISTRY_VALIDATION_FAILED',
}

export interface ErrorContext {
	[key: string]: unknown;
}

export abstract class CcccctlError extends Error {
	public readonly code: ErrorCode;
	public readonly context: ErrorContext;

	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.context = context;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class RegistryError extends CcccctlError {
	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message, code, context);
	}

	static notFound(path: string): RegistryError {
		return new RegistryError(
			`Registry file not found: ${path}`,
			ErrorCode.REGISTRY_NOT_FOUND,
			{ path },
		);
	}

	static fetchFailed(
		url: string,
		status?: number,
		statusText?: string,
	): RegistryError {
		return new RegistryError(
			`Failed to fetch registry from ${url}${status ? `: ${status} ${statusText}` : ''}`,
			ErrorCode.REGISTRY_FETCH_FAILED,
			{ url, status, statusText },
		);
	}

	static parseFailed(path: string, cause?: Error): RegistryError {
		return new RegistryError(
			`Failed to parse registry file: ${path}`,
			ErrorCode.REGISTRY_PARSE_FAILED,
			{ path, cause },
		);
	}

	static validationFailed(path: string, message: string): RegistryError {
		return new RegistryError(
			`Registry validation failed for ${path}: ${message}`,
			ErrorCode.REGISTRY_VALIDATION_FAILED,
			{ path, message },
		);
	}

	static commandNotFound(commandName: string): RegistryError {
		return new RegistryError(
			`Command "${commandName}" not found in registry`,
			ErrorCode.COMMAND_NOT_FOUND_IN_REGISTRY,
			{ commandName },
		);
	}

	static asyncRequired(): RegistryError {
		return new RegistryError(
			'Registry must be loaded asynchronously in production mode. Use loadRegistryAsync() instead.',
			ErrorCode.REGISTRY_ASYNC_REQUIRED,
		);
	}
}

export class FileSystemError extends CcccctlError {
	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message, code, context);
	}

	static commandExists(
		commandName: string,
		scope: 'user' | 'project',
	): FileSystemError {
		return new FileSystemError(
			`Command "${commandName}" already exists in ${scope} scope. Please remove it first using: ccccctl remove ${commandName}${scope === 'user' ? ' --user' : ''}`,
			ErrorCode.COMMAND_ALREADY_EXISTS,
			{ commandName, scope },
		);
	}

	static commandNotFound(
		commandName: string,
		scope: 'user' | 'project',
	): FileSystemError {
		return new FileSystemError(
			`Command "${commandName}" not found in ${scope} scope`,
			ErrorCode.COMMAND_NOT_FOUND_LOCAL,
			{ commandName, scope },
		);
	}

	static copyFailed(
		source: string,
		target: string,
		cause?: Error,
	): FileSystemError {
		return new FileSystemError(
			`Failed to copy file from ${source} to ${target}`,
			ErrorCode.FILE_COPY_FAILED,
			{ source, target, cause },
		);
	}

	static writeFailed(path: string, cause?: Error): FileSystemError {
		return new FileSystemError(
			`Failed to write file: ${path}`,
			ErrorCode.FILE_WRITE_FAILED,
			{ path, cause },
		);
	}

	static directoryCreateFailed(path: string, cause?: Error): FileSystemError {
		return new FileSystemError(
			`Failed to create directory: ${path}`,
			ErrorCode.DIRECTORY_CREATE_FAILED,
			{ path, cause },
		);
	}
}

export class NetworkError extends CcccctlError {
	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message, code, context);
	}

	static requestFailed(
		url: string,
		status?: number,
		statusText?: string,
	): NetworkError {
		return new NetworkError(
			`Network request failed for ${url}${status ? `: ${status} ${statusText}` : ''}`,
			ErrorCode.NETWORK_REQUEST_FAILED,
			{ url, status, statusText },
		);
	}

	static downloadFailed(
		url: string,
		status?: number,
		statusText?: string,
	): NetworkError {
		return new NetworkError(
			`Failed to download command from ${url}${status ? `: ${status} ${statusText}` : ''}`,
			ErrorCode.DOWNLOAD_FAILED,
			{ url, status, statusText },
		);
	}
}

export class ConfigurationError extends CcccctlError {
	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message, code, context);
	}

	static invalidOptionsCombination(options: string[]): ConfigurationError {
		return new ConfigurationError(
			`Cannot specify both ${options.join(' and ')} options`,
			ErrorCode.INVALID_OPTIONS_COMBINATION,
			{ options },
		);
	}

	static invalidCommandConfig(commandName: string): ConfigurationError {
		return new ConfigurationError(
			`Invalid command configuration for "${commandName}"`,
			ErrorCode.INVALID_COMMAND_CONFIG,
			{ commandName },
		);
	}
}

export class ValidationError extends CcccctlError {
	constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
		super(message, code, context);
	}

	static invalidCommandName(commandName: string): ValidationError {
		return new ValidationError(
			`Invalid command name: "${commandName}"`,
			ErrorCode.INVALID_COMMAND_NAME,
			{ commandName },
		);
	}

	static invalidUrl(url: string): ValidationError {
		return new ValidationError(`Invalid URL: "${url}"`, ErrorCode.INVALID_URL, {
			url,
		});
	}
}

export type CcccctlErrorTypes =
	| RegistryError
	| FileSystemError
	| NetworkError
	| ConfigurationError
	| ValidationError;

export function isCcccctlError(error: unknown): error is CcccctlError {
	return error instanceof CcccctlError;
}
