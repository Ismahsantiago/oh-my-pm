# Product Requirements Document: Team Launch Planner

## 1. Problem

Small teams need a shared launch checklist that connects planning, ownership, dependencies, and release readiness without requiring a heavy project-management rollout.

## 2. Users

- Founder or product lead who defines launch goals.
- Engineer who owns implementation tasks.
- Designer who owns user-facing assets.
- Operations lead who verifies release readiness.

## 3. Scope

### 3.1 In scope

- Create a launch project.
- Add milestones and owners.
- Track dependencies between tasks.
- Display readiness status.
- Export the launch plan to Markdown.

### 3.2 Out of scope

- Real-time chat.
- Billing.
- Native mobile apps.

## 4. User stories

- As a product lead, I can create a launch plan so the team has a shared source of truth.
- As an engineer, I can see blocked tasks so I know what cannot proceed.
- As an operations lead, I can export the plan so stakeholders can review it asynchronously.

## 5. Acceptance Criteria

- A user can create a launch plan with title, date, owner, and milestones.
- A user can mark a task as blocked with a reason.
- The readiness view shows counts for pending, blocked, and completed tasks.
- Markdown export includes milestones, owners, dependencies, and blockers.

## 6. Metrics

- Time from project creation to first exported plan.
- Percentage of launches with zero unresolved blockers by release date.
- Weekly active launch projects.
