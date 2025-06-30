# CLI Reference

Complete reference for all ccccctl commands and options.

## Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show version number |
| `--help`, `-h` | Show help information |

## Commands

### `ccccctl list`

Display all available commands in the registry.

**Usage:**
```bash
ccccctl list
```

**Example Output:**
```
Available commands:
- history: Command for viewing command history
- search: Search through files and content
- format: Format code files
```

### `ccccctl add <command>`

Add a command from the registry to your project.

**Usage:**
```bash
ccccctl add <command> [options]
```

**Arguments:**
- `<command>` - Name of the command to add (required)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Custom name for the command | Same as command name |
| `--user` | Add to user directory instead of project | false |

**Examples:**
```bash
# Add command to project directory
ccccctl add history

# Add command with custom name
ccccctl add history --name my-history

# Add command to user directory
ccccctl add history --user

# Combine options
ccccctl add history --user --name my-history
```

**Command Storage:**
- Project scope: `{cwd}/.claude/commands/`
- User scope: `~/.claude/commands/`

### `ccccctl remove <command>`

Remove a command from your project.

**Usage:**
```bash
ccccctl remove <command> [options]
```

**Arguments:**
- `<command>` - Name of the command to remove (required)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--user` | Remove from user directory instead of project | false |

**Examples:**
```bash
# Remove command from project directory
ccccctl remove history

# Remove command from user directory
ccccctl remove history --user

# Remove custom named command
ccccctl remove my-history
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Error (command failed, file not found, etc.) |

## Error Messages

Common error scenarios:

### Command Already Exists
```
Error: Command 'history' already exists. Remove it first with 'ccccctl remove history'
```

### Command Not Found
```
Error: Command 'nonexistent' not found in registry
```

### File Not Found
```
Error: Command 'history' not found in .claude/commands/
```

### Permission Errors
```
Error: Permission denied accessing ~/.claude/commands/
```

## Registry Information

The tool uses different registry sources:

- **Development Mode**: Local `.registry/registry.yml` file
- **Production Mode**: External GitHub registry at `https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/registry.yml`

## Examples

### Complete Workflow

```bash
# List available commands
ccccctl list

# Add a command
ccccctl add history

# Verify it was added
ls .claude/commands/

# Remove the command
ccccctl remove history

# Add it to user directory instead
ccccctl add history --user

# Check user directory
ls ~/.claude/commands/
```

### Using npx

All commands work with npx as well:

```bash
npx ccccctl list
npx ccccctl add history
npx ccccctl remove history --user
```