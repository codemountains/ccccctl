import type { RegistryCommand } from "@/types/registry.js";

/**
 * ccccctl_registry型のコマンドかどうかを判定する型ガード関数
 */
export function isCcccctlRegistryCommand(
	command: RegistryCommand,
): command is RegistryCommand & { type: "ccccctl_registry" } {
	return command.type === "ccccctl_registry";
}

/**
 * github型のコマンドかどうかを判定する型ガード関数
 */
export function isGithubCommand(
	command: RegistryCommand,
): command is RegistryCommand & { type: "github"; url: string } {
	return command.type === "github";
}

/**
 * RegistryCommandオブジェクトの基本的な構造をチェックする型ガード関数
 */
export function isRegistryCommandLike(obj: unknown): obj is RegistryCommand {
	if (typeof obj !== "object" || obj === null) {
		return false;
	}

	const command = obj as Record<string, unknown>;

	// 必須プロパティのチェック
	if (
		typeof command.name !== "string" ||
		typeof command.author !== "string" ||
		typeof command.description !== "string" ||
		typeof command.type !== "string"
	) {
		return false;
	}

	// typeの値をチェック
	if (command.type !== "ccccctl_registry" && command.type !== "github") {
		return false;
	}

	// github型の場合はurlが必須
	if (command.type === "github" && typeof command.url !== "string") {
		return false;
	}

	return true;
}

/**
 * RegistryCommandの配列から特定の型のコマンドのみをフィルタリングする
 */
export function filterCommandsByType<T extends RegistryCommand["type"]>(
	commands: RegistryCommand[],
	type: T,
): Array<RegistryCommand & { type: T }> {
	return commands.filter(
		(cmd): cmd is RegistryCommand & { type: T } => cmd.type === type,
	);
}