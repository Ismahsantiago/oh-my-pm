# Oh My PM — OpenCode Agent Team

This project includes the **Oh My PM** agent team for Product Management.
For the full agent routing table, protocol, and workspace conventions, see:

> **[OH_MY_PM_AGENTS.md](./OH_MY_PM_AGENTS.md)**

## Quick Reference

| Agent | Role |
| --- | --- |
| JC | Product orchestrator — discovery, delegation, manifest validation |
| Hammurabi | PRD specialist — requirements, scope, acceptance criteria |
| DaVinci | UX/UI flow specialist — journeys, diagrams, wireframes |
| Ada | Technical design specialist — TRD, APIs, database schemas |
| SunTzu | Execution strategist — DAG, sequencing, Dev-Harness handoff |
| docs-engineer | Documentation pipeline — render diagrams, validate coverage |

The agent **prompts, tools, and models** are injected at runtime by the
Oh My PM plugin (`oh-my-pm@latest`). Model presets are configured in
`oh-my-pm.json`. See `OH_MY_PM_AGENTS.md` for the full routing table.
