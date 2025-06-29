# ccccctl

**Claude Code Custom slash commands Control** - A CLI tool for managing Claude Code Custom slash commands.

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
ccccctl --version

# Using npx
npx ccccctl --version
```

### Help Information

```bash
ccccctl --help
ccccctl add --help

# Using npx
npx ccccctl --help
npx ccccctl remove --help
```

## Command Storage Locations

- **Project scope** (default): `{cwd}/.claude/commands/`
- **User scope** (with --user flag): `~/.claude/commands/`

## Development Setup

If you want to contribute to `ccccctl` or develop with a local registry:

### Prerequisites

```bash
# Clone the repository
git clone https://github.com/codemountains/ccccctl.git
cd ccccctl

# Install dependencies
npm install
```

### Set up Development Registry

```bash
# Set up local development registry
npm run setup:dev

# This will:
# - Create a .registry/ directory with sample commands
# - Download the latest registry data from GitHub
# - Enable development mode for testing
```

### Development Commands

```bash
# Build the project
npm run build

# Run in development mode (with watch)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint and fix code
npm run lint:fix
```

### Reset Development Environment

```bash
# Clean up development registry
npm run reset:dev

# Set up again if needed
npm run setup:dev
```

### Development Mode vs Production Mode

- **Development Mode**: Uses local `.registry/` directory when available
- **Production Mode**: Fetches commands from the external registry repository

The tool automatically detects the mode based on the presence of `.registry/registry.yml`.
