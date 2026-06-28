# PM-Harness

PM-Harness installs a Product Management agent team inside a project. The team produces PRD, TRD, UX flows, database design, execution planning, and an interoperable contract named `.parkops/pm_manifest.json`.

The package is designed for `bunx pm-harness` usage and can generate platform-specific outputs for OpenCode, Claude Code, OpenAI Agents SDK, and generic Markdown-based LLM workflows.

## What PM-Harness provides

- A project-level OpenCode runtime plugin that registers five PM agents through `config.agent`.
- OpenCode `SKILL.md` files for agent-level routing and project memory.
- Claude Code instructions in `CLAUDE.md`.
- OpenAI Agents SDK definitions in `agents.py`.
- Generic Markdown instructions for any LLM.
- A manifest schema and lifecycle for PM-to-Dev handoff.

## Principles

- **Lane specialization**: every agent owns a strict domain and JC delegates with complete context.
- **Verification before completion**: no agent reports completion without concrete evidence.
- **Contract-based communication**: PM-Harness and Dev-Harness communicate only through `.parkops/pm_manifest.json`.
- **Full context on delegation**: every handoff includes paths, decisions, constraints, and exit criteria.
- **Technical honesty**: ambiguity and contradiction become blockers instead of guesses.

## Agent team

| Agent | Role | Artifacts |
| --- | --- | --- |
| JC | Discovery and approval orchestrator | `.parkops/pm_manifest.json`, routing, approval notes |
| Hammurabi | PRD and product rules | `docs/prd.md` |
| DaVinci | UX, UI flows, and Mermaid | `docs/flows/*.md` |
| Ada | TRD, API, data, and schemas | `docs/trd.md`, `docs/db-schema.md` |
| SunTzu | Execution DAG and Dev-Harness handoff | `docs/execution-plan.md`, final manifest |

## Quick start

```bash
bunx pm-harness init
bunx pm-harness install
bunx pm-harness validate
```

`install` writes:

```text
opencode.jsonc
AGENTS.md
.opencode/skills/jc/SKILL.md
.opencode/skills/hammurabi/SKILL.md
.opencode/skills/davinci/SKILL.md
.opencode/skills/ada/SKILL.md
.opencode/skills/suntzu/SKILL.md
.parkops/pm_manifest.json
.parkops/schemas/pm-manifest-schema.json
```

The generated `opencode.jsonc` loads the runtime plugin:

```jsonc
{
  "plugin": ["pm-harness"],
  "agent": {
    "jc": { "model": "openai/gpt-5.4-ultra", "mode": "all" }
  }
}
```

## Optional platform outputs

```bash
bunx pm-harness install --claude
bunx pm-harness install --openai
bunx pm-harness install --generic
bunx pm-harness install --all
```

Generate templates without installing them:

```bash
bunx pm-harness generate opencode
bunx pm-harness generate claude
bunx pm-harness generate openai
bunx pm-harness generate generic
```

## Operational flow

1. The user describes a product idea.
2. JC runs discovery and separates work by lane.
3. Hammurabi writes and validates the PRD.
4. DaVinci writes Mermaid flows and validates references.
5. Ada writes TRD, API, and database design.
6. SunTzu builds the execution DAG and updates the manifest.
7. JC validates the contract and asks for approval.
8. Dev-Harness consumes `.parkops/pm_manifest.json` and writes blockers back into that file.

## Dev-Harness contract

The manifest is the sole source of truth between PM and implementation. If Dev-Harness cannot execute a task, it writes a blocker under `feedback_channel.blockers`. PM-Harness resolves the blocker by updating decisions, verification criteria, or DAG dependencies.

See `docs/dev-harness-bridge.md` for details.
