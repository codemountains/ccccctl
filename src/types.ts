export interface RegistryCommand {
	type: "registry_directory" | "github";
	name: string;
	description: string;
	url?: string;
}

export interface Registry {
	commands: RegistryCommand[];
}
