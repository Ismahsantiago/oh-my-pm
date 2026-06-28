# Dev-Harness Bridge

Dev-Harness consumes `.parkops/pm_manifest.json` as an implementation contract. There are no sync meetings or side-channel agreements. The manifest is the agreement.

## Read path

Dev-Harness reads:

- `project_metadata.status` to determine whether work is approved.
- `product_blueprints` to locate PRD, TRD, DB schema, UI flows, and execution plan.
- `execution_dag.tasks` to schedule work by dependencies.
- `feedback_channel.decisions` to preserve product and architecture decisions.

## Write path

Dev-Harness writes:

- task `status` updates as work progresses.
- blockers in `feedback_channel.blockers` when a task cannot proceed.
- status `in_development`, `blocked`, or `completed` according to evidence.

## Blocker format

```json
{
  "id": "blocker_01",
  "raised_by": "dev-harness",
  "description": "The PRD requires offline payments but the TRD only defines Stripe checkout.",
  "proposed_solutions": [
    "Remove offline payments from scope",
    "Add manual invoice flow to TRD and DAG"
  ],
  "status": "open",
  "resolution": ""
}
```

## PM response

PM-Harness resolves blockers by updating the relevant product artifacts, adding decisions, changing verification criteria, and marking the blocker resolved with a rationale.

## Integrity rules

- Dev-Harness must not invent missing product requirements.
- PM-Harness must not mark a blocker resolved without updating the artifact that caused the conflict.
- Both systems must preserve ids so audit history remains stable.
