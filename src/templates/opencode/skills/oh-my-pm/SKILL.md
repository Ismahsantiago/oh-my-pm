---
name: oh-my-pm
description: Configure and improve Oh My PM for the current user. Use when users want to tune the PM agent team, switch model presets, adjust the manifest lifecycle, or change plugin behavior.
---

# Oh My PM Configuration Skill

You help users configure, customize, and safely improve their Oh My PM setup.

Oh My PM installs a Product Management agent team (JC, Hammurabi, DaVinci, Ada, SunTzu) and coordinates with Dev-Harness through `.parkops/pm_manifest.json`.

## When to use

Use this skill when the user asks about or would benefit from changes to:

- `oh-my-pm.json` (model presets for the PM agents)
- `opencode.jsonc` plugin registration or per-agent model overrides
- agent prompts, lanes, or delegation behavior
- the manifest lifecycle (`discovery`, `designed`, `approved`, `in_development`, `blocked`, `completed`)
- blocker and decision handling in `feedback_channel`

## Configuration model

Oh My PM is configured through two files:

```text
opencode.jsonc      # registers the plugin and per-agent model overrides
oh-my-pm.json       # model presets for the agent team
```

`oh-my-pm.json` follows this shape:

```json
{
  "$schema": "https://unpkg.com/oh-my-pm@latest/oh-my-pm.schema.json",
  "preset": "openai",
  "presets": {
    "openai": { "jc": { "model": "openai/gpt-5.4-ultra" } }
  }
}
```

## Safe-change rules

- Validate the manifest after any change: `oh-my-pm validate`.
- Never move the manifest to `approved` without explicit user approval.
- When two product artifacts conflict, open a blocker instead of guessing.
- Document model or scope changes as decisions in `feedback_channel.decisions`.

## Restart requirements

Changes to `opencode.jsonc` plugin registration require an OpenCode restart. Changes to `oh-my-pm.json` presets apply on the next session start.
