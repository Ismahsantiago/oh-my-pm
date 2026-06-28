# Manifest Lifecycle

Oh My PM and Dev-Harness coordinate through lifecycle status in `.parkops/pm_manifest.json`.

## States

| Status | Owner | Meaning | Exit condition |
| --- | --- | --- | --- |
| discovery | Oh My PM | JC is gathering product intent and constraints. | Product scope is clear enough to design. |
| designed | Oh My PM | PRD, TRD, flows, DB schema, and execution DAG are drafted and validated. | User explicitly approves the design. |
| approved | User and Oh My PM | The manifest is accepted as the development contract. | Dev-Harness starts implementation. |
| in_development | Dev-Harness | Implementation is in progress against pending DAG tasks. | All tasks complete or a blocker appears. |
| blocked | Dev-Harness or Oh My PM | A contradiction, missing dependency, or infeasible criterion halted progress. | Oh My PM resolves the blocker. |
| completed | Dev-Harness | Every DAG task is completed and verification evidence exists. | Release or archive. |

## Transition rules

- `discovery` can move to `designed` only after every required artifact path is known.
- `designed` can move to `approved` only after explicit user approval.
- `approved` can move to `in_development` when Dev-Harness begins execution.
- Any active state can move to `blocked` if an open blocker prevents honest execution.
- `blocked` can move back to `designed`, `approved`, or `in_development` depending on the resolved scope.
- `completed` requires every DAG task status to be `completed`.

## Blocker discipline

A blocker must include an id, raiser, description, proposed solutions, status, and resolution. Do not delete blockers. Mark them resolved and write the resolution.
