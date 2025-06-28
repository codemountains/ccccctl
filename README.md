# ccccctl

Claude Code Custom Commands Control - A CLI tool for managing Claude Code custom commands

## Overview

`ccccctl` is a CLI tool that allows you to easily manage custom commands for Claude Code. You can add, remove, and list commands from a registry, supporting both local and GitHub registries.

## Installation

```bash
npm install -g ccccctl
```

## Usage

### List Available Commands

```bash
# Display all commands in the registry
ccccctl list

# Using npx
npx ccccctl list
```

### Add Commands

```bash
# Add a command from registry to project
ccccctl add history
npx ccccctl add history

# Add a command with a custom name
ccccctl add history --name my-history
npx ccccctl add history --name my-history

# Add a command to user directory
ccccctl add history --user
npx ccccctl add history --user
```

### Remove Commands

```bash
# Remove a command from project
ccccctl remove history
npx ccccctl remove history

# Remove a command from user directory
ccccctl remove history --user
npx ccccctl remove history --user
```

### Update Commands

```bash
# Update a command (remove then add)
ccccctl remove history
ccccctl add history
```

### Version Information

```bash
ccccctl version

# Using npx
npx ccccctl version
```

## Command Storage Locations

- **Project scope** (default): `{cwd}/.claude/commands/`
- **User scope** (with --user flag): `~/.claude/commands/`
