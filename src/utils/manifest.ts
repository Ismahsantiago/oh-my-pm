import fs from "fs-extra"
import path from "node:path"

export const MANIFEST_RELATIVE_PATH = ".pm/pm_manifest.json"
export const MANIFEST_SCHEMA_RELATIVE_PATH = ".pm/schemas/pm-manifest-schema.json"

export const MANIFEST_STATUSES = [
  "discovery",
  "designed",
  "approved",
  "in_development",
  "blocked",
  "completed",
] as const

export const TASK_STATUSES = ["pending", "in_progress", "blocked", "completed"] as const

export type ManifestStatus = (typeof MANIFEST_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type ManifestTask = {
  readonly id: string
  readonly depends_on: readonly string[]
  readonly spec_reference: string
  readonly description: string
  readonly status: TaskStatus
  readonly verification_criteria: readonly string[]
  readonly assigned_to: string
}

export type Manifest = {
  readonly $schema: string
  readonly project_metadata: {
    readonly name: string
    readonly blueprint_version: string
    readonly status: ManifestStatus
    readonly generated_by: string
    readonly generated_at: string
  }
  readonly product_blueprints: {
    readonly prd: string
    readonly trd: string
    readonly db_schema: string
    readonly ui_flows: readonly string[]
    readonly execution_plan: string
  }
  readonly execution_dag: {
    readonly version: string
    readonly tasks: readonly ManifestTask[]
  }
  readonly feedback_channel: {
    readonly blockers: readonly Blocker[]
    readonly decisions: readonly Decision[]
  }
}

export type Blocker = {
  readonly id: string
  readonly raised_by: "dev-harness" | "oh-my-pm"
  readonly description: string
  readonly proposed_solutions: readonly string[]
  readonly status: "open" | "resolved"
  readonly resolution: string
}

export type Decision = {
  readonly id: string
  readonly description: string
  readonly rationale: string
  readonly alternatives_considered: readonly string[]
}

export function buildInitialManifest(projectName: string, generatedAt: string): Manifest {
  return {
    $schema: "./schemas/pm-manifest-schema.json",
    project_metadata: {
      name: projectName,
      blueprint_version: "1.0.0",
      status: "discovery",
      generated_by: "oh-my-pm v1.0.0",
      generated_at: generatedAt,
    },
    product_blueprints: {
      prd: "docs/prd.md",
      trd: "docs/trd.md",
      db_schema: "docs/db-schema.md",
      ui_flows: ["docs/flows/main-flow.md"],
      execution_plan: "docs/execution-plan.md",
    },
    execution_dag: { version: "1.0.0", tasks: [] },
    feedback_channel: { blockers: [], decisions: [] },
  }
}

export async function writeManifest(projectRoot: string, manifest: Manifest): Promise<string> {
  const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH)
  await fs.ensureDir(path.dirname(manifestPath))
  await fs.writeJson(manifestPath, manifest, { spaces: 2 })
  return manifestPath
}

export async function readManifest(projectRoot: string): Promise<unknown> {
  const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH)
  const raw = await fs.readFile(manifestPath, "utf8")
  const parsed: unknown = JSON.parse(raw)
  return parsed
}

export async function manifestExists(projectRoot: string): Promise<boolean> {
  return fs.pathExists(path.join(projectRoot, MANIFEST_RELATIVE_PATH))
}

export function withStatus(manifest: Manifest, status: ManifestStatus): Manifest {
  return {
    $schema: manifest.$schema,
    project_metadata: {
      name: manifest.project_metadata.name,
      blueprint_version: manifest.project_metadata.blueprint_version,
      status,
      generated_by: manifest.project_metadata.generated_by,
      generated_at: manifest.project_metadata.generated_at,
    },
    product_blueprints: manifest.product_blueprints,
    execution_dag: manifest.execution_dag,
    feedback_channel: manifest.feedback_channel,
  }
}
