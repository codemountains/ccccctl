// 基本的な共通プロパティ
interface BaseRegistryCommand {
	name: string;
	author: string;
	description: string;
}

// ccccctl_registryタイプ（urlは不要）
interface CcccctlRegistryCommand extends BaseRegistryCommand {
	type: "ccccctl_registry";
}

// githubタイプ（urlが必須）
interface GithubCommand extends BaseRegistryCommand {
	type: "github";
	url: string;
}

// 判別共用体として定義
export type RegistryCommand = CcccctlRegistryCommand | GithubCommand;

export interface Registry {
	commands: RegistryCommand[];
}
