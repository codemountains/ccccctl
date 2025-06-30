# Usage

This guide covers all the features and options available in ccccctl.

## Command Overview

ccccctl provides three main commands:
- `list` - Display all available commands in the registry
- `add` - Add a command from the registry to your project
- `remove` - Remove a command from your project

## Listing Commands

### Basic Usage

```bash
ccccctl list
```

This displays all available commands in the registry with their descriptions.

## Adding Commands

### Add to Project Directory

By default, commands are added to your current project's `.claude/commands/` directory:

```bash
ccccctl add history
```

### Add to User Directory

Use the `--user` flag to add commands to your user directory (`~/.claude/commands/`):

```bash
ccccctl add history --user
```

### Custom Command Name

You can specify a custom name for the command:

```bash
ccccctl add history --name my-history
```

This will create a command file named `my-history` instead of `history`.

### Combining Options

You can combine the `--user` and `--name` options:

```bash
ccccctl add history --user --name my-history
```

## Removing Commands

### Remove from Project Directory

```bash
ccccctl remove history
```

### Remove from User Directory

```bash
ccccctl remove history --user
```

### Remove Custom Named Commands

If you added a command with a custom name, use that name to remove it:

```bash
ccccctl remove my-history
```

## Updating Commands

To update a command, first remove it, then add it again:

```bash
ccccctl remove history
ccccctl add history
```

## Command Storage Locations

Commands are stored in different locations based on the scope:

- **Project scope** (default): `{current-working-directory}/.claude/commands/`
- **User scope** (with `--user` flag): `~/.claude/commands/`

## Error Handling

If you try to add a command that already exists, ccccctl will show an error message. You need to remove the existing command first, then add it again.

## Getting Help

Use the `--help` flag to get help for any command:

```bash
ccccctl --help
ccccctl add --help
ccccctl remove --help
```