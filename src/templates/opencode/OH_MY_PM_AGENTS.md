# Oh My PM — Product Management Agent Team

This file is referenced by `AGENTS.md`. It contains the full agent routing table,
protocol, and workspace conventions for the Oh My PM agent team.

## Routing Table

| Trigger | Agent | Output |
| --- | --- | --- |
| idea, discovery, scope, goals, approval | JC | Orchestration and `.pm/pm_manifest.json` |
| PRD, requirements, product rules, user stories, acceptance criteria | Hammurabi | `docs/prd.md` |
| UX, UI, flows, screens, Mermaid, journey, architecture, decisions, wireframes | DaVinci | `docs/flows/*.md`, `docs/architecture/*.md`, `docs/decisions/*.md`, `docs/ux/screens/*.md` |
| TRD, architecture, API, database, schema | Ada | `docs/trd.md`, `docs/db-schema.md` |
| DAG, execution plan, Dev-Harness, blockers | SunTzu | `docs/execution-plan.md`, final manifest |
| docs rendering, diagram validation, wireframe generation | docs-engineer | Documentation pipeline automation |

## Protocol

1. JC receives the product intent and runs discovery.
2. JC delegates with complete context when a specialist lane is needed.
3. Each specialist writes its artifact and validates it.
4. Blockers are written to `_workspace/{agent}/feedback/latest.md` and `.pm/pm_manifest.json`.
5. SunTzu consolidates the execution DAG.
6. JC validates JSON, cross-references, and lifecycle status before asking for approval.
7. DaVinci runs `node scripts/render-mermaid.mjs` after creating or updating diagrams.
8. docs-engineer validates diagram coverage in `docs/architecture/` and `docs/features/`.

## Contract Rules

- `.pm/pm_manifest.json` is the only contract with Dev-Harness.
- No agent duplicates work delegated to another lane.
- Every handoff includes file paths, prior decisions, constraints, expected artifacts, and verification commands.
- If there is contradiction, do not invent an answer. Write an open blocker.
- Completion requires evidence: existing artifact, passed validation, and linked references.

## Workspace Conventions

- Durable artifacts: `_workspace/{agent}/artifacts/`
- Working memory: `_workspace/{agent}/working/`
- Feedback: `_workspace/{agent}/feedback/`
- Product docs: `docs/`
- Rendered diagrams: `docs/images/`
- Contract: `.pm/pm_manifest.json`

## Agent Presets

Oh My PM supports runtime model presets via `oh-my-pm.json`:

| Preset | Provider | Best for |
| --- | --- | --- |
| `openai` | OpenAI GPT models | Maximum quality, highest cost |
| `opencode` | OpenCode native models | Free tier, openrouter-based |
| `opencode-go` | Chinese providers via OpenCode Go | Cost-effective, good quality |
| `azure` | Azure OpenAI | Enterprise, data residency |
| `google` | Google Gemini/Vertex | Image gen, multimodal |
| `cursor` | Cursor native provider | Best for Cursor IDE users |
