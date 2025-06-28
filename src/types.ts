// 基本的な共通プロパティ
interface BaseRegistryCommand {
	name: string;
	description: string;
}

// registry_directoryタイプ（urlは不要）
interface RegistryDirectoryCommand extends BaseRegistryCommand {
	type: "registry_directory";
}

// githubタイプ（urlが必須）
interface GithubCommand extends BaseRegistryCommand {
	type: "github";
	url: string;
}

// 判別共用体として定義
export type RegistryCommand = RegistryDirectoryCommand | GithubCommand;

export interface Registry {
	commands: RegistryCommand[];
}

export * from "@/types/errors.js";
