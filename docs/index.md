---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: ccccctl
  text: "Claude Code Custom Slash Commands Control"
  tagline: A CLI tool for managing Claude Code Custom slash commands.
  image:
    src: logo.png
    alt: ccccctl
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/codemountains/ccccctl

features:
  - icon: 📦
    title: Easy Command Management
    details: Add, remove, and list custom commands for Claude Code with simple CLI commands.
  - icon: 🌐
    title: Registry Support
    details: Support for both ccccctl and GitHub registries to share commands across projects.
  - icon: 🔧
    title: Flexible Installation
    details: Install commands at project level or user level, with custom naming support.
  - icon: 🤝
    title: User Friendly
    details: Intuitive command operations for efficient management of your Claude Code Custom slash commands.
---

## Quick Start

Install ccccctl globally:

```bash
npm install -g ccccctl
```

List available commands:

```bash
ccccctl list
```

Add a command to your project:

```bash
ccccctl add history
```

## Example Usage

```bash
# List all available commands
ccccctl list

# Add a command with custom name
ccccctl add history --name my-history

# Add to user directory
ccccctl add history --user

# Remove a command
ccccctl remove history

# Show version
ccccctl --version
```

## Command Storage

- **Project scope** (default): `{cwd}/.claude/commands/`
- **User scope** (with --user flag): `~/.claude/commands/`