# Getting Started

Welcome to ccccctl! This guide will help you get started with managing Claude Code custom commands.

## What is ccccctl?

`ccccctl` (Claude Code Custom slash Commands Control) is a CLI tool that allows you to easily manage custom commands for Claude Code. You can add, remove, and list commands from a registry, supporting both local and GitHub registries.

## Quick Start

### Installation

Install ccccctl globally using npm:

```bash
npm install -g ccccctl
```

Or use npx to run without installing:

```bash
npx ccccctl --help
```

### First Steps

1. **List available commands** to see what's in the registry:
   ```bash
   ccccctl list
   ```

2. **Add a command** from the registry to your project:
   ```bash
   ccccctl add history
   ```

3. **Verify the command was added** by checking your `.claude/commands/` directory:
   ```bash
   ls .claude/commands/
   ```

That's it! You now have a custom command available in Claude Code.

## Next Steps

- Learn more about [Installation](./installation.md) options
- Explore detailed [Usage](./usage.md) examples
- Set up for [Development](./development.md) if you want to contribute