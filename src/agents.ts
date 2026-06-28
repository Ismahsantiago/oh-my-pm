import type { AgentConfig } from "@opencode-ai/sdk"

export const PM_AGENT_NAMES = ["jc", "hammurabi", "davinci", "ada", "suntzu"] as const
export type PMAgentName = (typeof PM_AGENT_NAMES)[number]

const MANIFEST_PROTOCOL = `Oh My PM protocol:
- Oh My PM and Dev-Harness communicate only through .pm/pm_manifest.json.
- Keep strict lane specialization and never duplicate delegated work.
- Pass complete context in handoffs: paths, prior decisions, constraints, expected artifacts, and verification commands.
- Do not mark work complete without concrete evidence.
- If requirements conflict or context is missing, write a blocker in feedback_channel.blockers instead of guessing.`

const JC_PROMPT = `You are JC, the Oh My PM Product Management orchestrator.

Role:
- Run product discovery.
- Decompose PM work into specialist lanes.
- Delegate PRD to Hammurabi, UX flows to DaVinci, TRD and data design to Ada, and execution DAG to SunTzu.
- Validate .pm/pm_manifest.json before asking for explicit user approval.

${MANIFEST_PROTOCOL}`

const HAMMURABI_PROMPT = `You are Hammurabi, the Oh My PM PRD specialist.

Role:
- Write docs/prd.md with problem, users, scope, user stories, requirements, metrics, and acceptance criteria.
- Convert product contradictions into manifest blockers.
- Ensure every requirement can be cross-referenced by UX flows, TRD, and execution DAG tasks.

${MANIFEST_PROTOCOL}`

const DAVINCI_PROMPT = `You are DaVinci, the Oh My PM UX flow specialist.

Role:
- Write docs/flows/*.md with journeys, screen states, edge states, and Mermaid diagrams.
- Connect every flow to PRD user stories and acceptance criteria.
- Validate Mermaid syntax and document unresolved UX ambiguity as blockers.

${MANIFEST_PROTOCOL}`

const ADA_PROMPT = `You are Ada, the Oh My PM technical design specialist.

Role:
- Write docs/trd.md and docs/db-schema.md.
- Define architecture, APIs, data model, integrations, security, observability, and constraints.
- Verify that technical design supports the PRD and DaVinci UX flows.

${MANIFEST_PROTOCOL}`

const SUNTZU_PROMPT = `You are SunTzu, the Oh My PM execution strategist.

Role:
- Write docs/execution-plan.md.
- Build execution_dag.tasks inside .pm/pm_manifest.json.
- Sequence tasks by dependency, attach spec references, and define executable verification criteria.
- Halt the pipeline with blockers when Dev-Harness cannot execute honestly.

${MANIFEST_PROTOCOL}`


const WRITABLE_TOOLS = {
  read: true,
  glob: true,
  grep: true,
  bash: true,
  write: true,
  edit: true,
} as const

const DELEGATING_TOOLS = {
  read: true,
  glob: true,
  grep: true,
  bash: true,
  write: true,
  edit: true,
  task: true,
} as const

export const PM_AGENT_CONFIGS: Record<PMAgentName, AgentConfig> = {
  jc: {
    model: "openai/gpt-5.4-ultra",
    mode: "all",
    description: "Oh My PM orchestrator for discovery, delegation, manifest validation, and approval.",
    prompt: JC_PROMPT,
    tools: DELEGATING_TOOLS,
    color: "primary",
  },
  hammurabi: {
    model: "openai/gpt-4.1",
    mode: "subagent",
    description: "PRD specialist for requirements, scope, business rules, and acceptance criteria.",
    prompt: HAMMURABI_PROMPT,
    tools: WRITABLE_TOOLS,
    color: "warning",
  },
  davinci: {
    model: "openai/gpt-4.1",
    mode: "subagent",
    description: "UX flow specialist for journeys, screens, Mermaid diagrams, and interaction maps.",
    prompt: DAVINCI_PROMPT,
    tools: DELEGATING_TOOLS,
    color: "accent",
  },
  ada: {
    model: "openai/gpt-4.1",
    mode: "subagent",
    description: "Technical design specialist for TRD, APIs, database schemas, integrations, and constraints.",
    prompt: ADA_PROMPT,
    tools: WRITABLE_TOOLS,
    color: "success",
  },
  suntzu: {
    model: "openai/gpt-5.4-ultra",
    mode: "subagent",
    description: "Execution DAG strategist for sequencing, verification criteria, blockers, and Dev-Harness handoff.",
    prompt: SUNTZU_PROMPT,
    tools: WRITABLE_TOOLS,
    color: "info",
  },
}

export function mergePMAgents(existing: Record<string, AgentConfig | undefined> | undefined): Record<string, AgentConfig> {
  const merged: Record<string, AgentConfig> = {}
  if (existing !== undefined) {
    for (const [name, config] of Object.entries(existing)) {
      if (config !== undefined) merged[name] = config
    }
  }
  for (const name of PM_AGENT_NAMES) {
    const existingConfig = merged[name]
    merged[name] = existingConfig === undefined ? PM_AGENT_CONFIGS[name] : Object.assign({}, PM_AGENT_CONFIGS[name], existingConfig)
  }
  return merged
}

export type AgentModelOverride = {
  readonly model: string
  readonly variant?: string
}

export function applyModelOverrides(
  base: Record<string, AgentConfig>,
  overrides: Record<string, AgentModelOverride>,
): Record<string, AgentConfig> {
  const result: Record<string, AgentConfig> = {}
  for (const [name, config] of Object.entries(base)) {
    const override = overrides[name]
    if (override === undefined) {
      result[name] = config
      continue
    }
    const next: AgentConfig = Object.assign({}, config, { model: override.model })
    if (override.variant !== undefined) next["variant"] = override.variant
    result[name] = next
  }
  return result
}
