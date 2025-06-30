# Registry

Learn about ccccctl's registry system and `registry.yml` format.

## Registry System

`ccccctl` uses a registry system to manage available commands. The registry contains metadata about each command including its name, description, and source location.

### Registry Sources

#### Production Registry
- **URL**: `https://github.com/codemountains/ccccctl-registry/blob/main/registry.yml`
- **Format**: YAML

### Registry Format

The registry is a YAML file with the following structure:

```yaml
commands:
  - type: ccccctl_registry
    name: about-ccccctl
    author: codemountains
    description: Explains about `ccccctl`.

  - type: github
    name: history
    author: codemountains
    description: |
      Outputs a summary of interactions in Claude Code sessions.
      This command is useful for reviewing the history of Claude Code sessions.
    url: https://github.com/codemountains/ccccctl-commands/blob/main/.claude/commands/history.md
```
