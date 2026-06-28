# Installation Guide

## Requirements

- Node.js 20 or newer.
- Bun available for `bunx pm-harness` usage.
- A project directory where PM-Harness may write `.parkops/`, `.opencode/`, `AGENTS.md`, and optional platform files.

## Install through bunx

```bash
bunx pm-harness init
bunx pm-harness install
```

`init` creates `.parkops/pm_manifest.json` and copies the schema into `.parkops/schemas/pm-manifest-schema.json`.

`install` writes the OpenCode runtime plugin configuration plus project skill files:

```text
.opencode/skills/jc/SKILL.md
.opencode/skills/hammurabi/SKILL.md
.opencode/skills/davinci/SKILL.md
.opencode/skills/ada/SKILL.md
.opencode/skills/suntzu/SKILL.md
opencode.jsonc
AGENTS.md
```

## Optional platform outputs

```bash
bunx pm-harness install --claude
bunx pm-harness install --openai
bunx pm-harness install --generic
bunx pm-harness install --all
```

These commands install `CLAUDE.md`, `agents.py`, or `PM_HARNESS_AGENTS.md` alongside the OpenCode runtime plugin configuration.

## Template generation

Use generation when you want to inspect templates before installing them:

```bash
bunx pm-harness generate opencode
bunx pm-harness generate claude
bunx pm-harness generate openai
bunx pm-harness generate generic
```

Generated templates are written under `.parkops/generated/{platform}`.

## Validation

```bash
bunx pm-harness validate
```

Validation checks the shape of `.parkops/pm_manifest.json`, lifecycle status, blueprint paths, DAG tasks, verification criteria, blockers, and decisions.

## OpenCode runtime plugin

The generated `opencode.jsonc` uses OpenCode's `plugin` and `agent` fields. The `plugin` entry loads `pm-harness`; the runtime plugin injects the five PM agents through the OpenCode config hook. The `agent` block remains available for project-level model overrides.
