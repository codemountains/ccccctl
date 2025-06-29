# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`ccccctl` (Claude Code Custom Commands Control) is a CLI tool for managing Claude Code custom commands. It allows users to add, remove, and list custom commands from a registry that can be stored locally or fetched from GitHub.

## CLI Usage Examples

```bash
# List all available commands in the registry
ccccctl list

# Add a command from registry to project .claude/commands/
ccccctl add history

# Add a command with a custom name
ccccctl add history --name my-history

# Add a command to user directory (~/.claude/commands/)
ccccctl add history --user

# Update a command (first remove, then add)
ccccctl remove history
ccccctl add history

# Remove a command from project directory
ccccctl remove history

# Remove a command from user directory
ccccctl remove history --user

# Show version
ccccctl version
ccccctl --version
ccccctl -V
```

## Development Commands

- **Build**: `npm run build` - Compile TypeScript to dist/
- **Development build**: `npm run dev` - Build with watch mode  
- **Lint**: `npm run lint` - Check code with Biome
- **Lint and fix**: `npm run lint:fix` - Auto-fix linting issues
- **Test**: `npm test` - Run all tests with Vitest
- **Test with watch**: `npm run test:watch` - Run tests in watch mode
- **Test coverage**: `npm run test:coverage` - Generate coverage report
- **Test UI**: `npm run test:ui` - Open Vitest UI
- **Setup development registry**: `npm run setup:dev` - Create .registry/ with sample commands from external repository
- **Reset development registry**: `npm run reset:dev` - Remove .registry/ directory completely

## Code Architecture

### Core Structure

- **Entry point**: `src/index.ts` - CLI setup using Commander.js
- **Commands**: `src/commands/` - Individual CLI command implementations (add, remove, list)
- **Types**: `src/types.ts` - TypeScript interfaces for Registry and RegistryCommand
- **Utils**: `src/utils/` - Core utilities for registry operations and file management

### Registry System

The tool supports two command sources:
- `ccccctl_registry`: Commands stored in local `.registry/commands/` directory (development only)
- `github`: Commands fetched from external GitHub repositories via URL

Registry resolution follows this priority:
1. Development mode: Uses local `.registry/registry.yml` if present
2. Production mode: Fetches from `https://raw.githubusercontent.com/codemountains/ccccctl-registry/main/registry.yml`

Note: The `.registry/` directory is for development purposes only and is excluded from version control.

### Command Storage

Commands are stored in `.claude/commands/` directories:
- Project scope: `{cwd}/.claude/commands/` (default)
- User scope: `~/.claude/commands/` (with --user flag)

## Tools and Configuration

- **Language**: TypeScript with ES2022 target
- **Module system**: ESNext modules with `.js` imports for built files
- **Build tool**: Vite with custom library configuration
- **Linter/Formatter**: Biome v2.0.6
- **Test framework**: Vitest with v8 coverage (80% thresholds)
- **CLI framework**: Commander.js
- **Package manager**: npm (package-lock.json present)

## Key Implementation Details

### File Resolution

- Uses `@/` path alias mapping to `src/`
- Runtime path resolution handles both development and production contexts
- Registry loading supports both sync and async modes for backward compatibility

### Error Handling

- Commands exit with status 1 on errors
- Registry fetching includes proper HTTP error handling with User-Agent
- Adding a command that already exists will result in an error

### Caching

- Registry data is cached in memory after first load
- Cache can be cleared via `clearRegistryCache()` for testing
