# PM-Harness OpenCode Routing

This project uses PM-Harness as a Product Management agent team for PRD, TRD, UX flows, database design, execution DAGs, and Dev-Harness handoff.

## Routing table

| Trigger | Agent | Output |
| --- | --- | --- |
| idea, discovery, scope, goals, approval | JC | Orchestration and `.parkops/pm_manifest.json` |
| PRD, requirements, product rules, user stories, acceptance criteria | Hammurabi | `docs/prd.md` |
| UX, UI, flows, screens, Mermaid, journey | DaVinci | `docs/flows/*.md` |
| TRD, architecture, API, database, schema | Ada | `docs/trd.md`, `docs/db-schema.md` |
| DAG, execution plan, Dev-Harness, blockers | SunTzu | `docs/execution-plan.md`, final manifest |

## Protocol

1. JC receives the product intent and runs discovery.
2. JC delegates with complete context when a specialist lane is needed.
3. Each specialist writes its artifact and validates it.
4. Blockers are written to `_workspace/{agent}/feedback/latest.md` and `.parkops/pm_manifest.json`.
5. SunTzu consolidates the execution DAG.
6. JC validates JSON, cross-references, and lifecycle status before asking for approval.

## Contract rules

- `.parkops/pm_manifest.json` is the only contract with Dev-Harness.
- No agent duplicates work delegated to another lane.
- Every handoff includes file paths, prior decisions, constraints, expected artifacts, and verification commands.
- If there is contradiction, do not invent an answer. Write an open blocker.
- Completion requires evidence: existing artifact, passed validation, and linked references.

## Workspace conventions

- Durable artifacts: `_workspace/{agent}/artifacts/`
- Working memory: `_workspace/{agent}/working/`
- Feedback: `_workspace/{agent}/feedback/`
- Product docs: `docs/`
- Contract: `.parkops/pm_manifest.json`
