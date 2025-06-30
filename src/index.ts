#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { addCommand } from '@/commands/add.js';
import { listCommand } from '@/commands/list.js';
import { removeCommand } from '@/commands/remove.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
	readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
	.name('ccccctl')
	.description(
		'Claude Code Custom Commands Control - Manage Claude Code Custom slash commands',
	)
	.version(packageJson.version);

program
	.command('add')
	.description(
		'Add a command from registry to local .claude/commands directory',
	)
	.argument('<command-name>', 'Name of the command to add')
	.option('-n, --name <name>', 'Override the command name when adding')
	.option(
		'-P, --project',
		'Store command in project .claude/commands directory (default)',
	)
	.option('-U, --user', 'Store command in user ~/.claude/commands directory')
	.action(addCommand);

program
	.command('remove')
	.description('Remove a command from local .claude/commands directory')
	.argument('<command-name>', 'Name of the command to remove')
	.option(
		'-P, --project',
		'Remove command from project .claude/commands directory (default)',
	)
	.option('-U, --user', 'Remove command from user ~/.claude/commands directory')
	.action(removeCommand);

program
	.command('list')
	.description('List all available commands in the registry')
	.action(listCommand);

program.parse();
