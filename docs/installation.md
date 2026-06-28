# Installation Guide

## Requirements

- Node.js 20 or newer.
- Bun available for `bunx oh-my-pm` usage.
- A project directory where Oh My PM may write `.parkops/`, `.opencode/`, `AGENTS.md`, and optional platform files.

## Install through bunx

```bash
bunx oh-my-pm init
bunx oh-my-pm install
```

`init` creates `.parkops/pm_manifest.json` and copies the schema into `.parkops/schemas/pm-manifest-schema.json`.

`install` writes the OpenCode runtime plugin configuration plus project skill files:

```text
.opencode/skills/jc/SKILL.md
.opencode/skills/hammurabi/SKILL.md
.opencode/skills/davinci/SKILL.md
.opencode/skills/ada/SKILL.md
.opencode/skills/suntzu/SKILL.md
.opencode/skills/oh-my-pm/SKILL.md
opencode.jsonc
oh-my-pm.json
AGENTS.md
```


## Global OpenCode install

```bash
bunx oh-my-pm install --global
```

This installs into `~/.config/opencode/`, merges `"oh-my-pm@latest"` into the existing `plugin` array, writes `oh-my-pm.json`, and installs all six skills under `skills/`. Existing files are backed up with `.oh-my-pm.backup`.

## Optional platform outputs

```bash
bunx oh-my-pm install --claude
bunx oh-my-pm install --openai
bunx oh-my-pm install --generic
bunx oh-my-pm install --all
```

These commands install `CLAUDE.md`, `agents.py`, or `OH_MY_PM_AGENTS.md` alongside the OpenCode runtime plugin configuration.

## Template generation

Use generation when you want to inspect templates before installing them:

```bash
bunx oh-my-pm generate opencode
bunx oh-my-pm generate claude
bunx oh-my-pm generate openai
bunx oh-my-pm generate generic
```

Generated templates are written under `.parkops/generated/{platform}`.

## Validation

```bash
bunx oh-my-pm validate
```

Validation checks the shape of `.parkops/pm_manifest.json`, lifecycle status, blueprint paths, DAG tasks, verification criteria, blockers, and decisions.

## OpenCode runtime plugin

The generated `opencode.jsonc` uses OpenCode's `plugin` and `agent` fields. The `plugin` entry loads `oh-my-pm@latest`; the runtime plugin injects the five PM agents through the OpenCode config hook. `oh-my-pm.json` stores model presets, mirroring the `oh-my-opencode-slim.json` pattern. The `agent` block remains available for project-level model overrides.
