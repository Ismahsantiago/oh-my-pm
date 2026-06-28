import fs from "fs-extra";
import path from "node:path";
export const MANIFEST_RELATIVE_PATH = ".parkops/pm_manifest.json";
export const MANIFEST_SCHEMA_RELATIVE_PATH = ".parkops/schemas/pm-manifest-schema.json";
export const MANIFEST_STATUSES = [
    "discovery",
    "designed",
    "approved",
    "in_development",
    "blocked",
    "completed",
];
export const TASK_STATUSES = ["pending", "in_progress", "blocked", "completed"];
export function buildInitialManifest(projectName, generatedAt) {
    return {
        $schema: "./schemas/pm-manifest-schema.json",
        project_metadata: {
            name: projectName,
            blueprint_version: "1.0.0",
            status: "discovery",
            generated_by: "pm-harness v1.0.0",
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
    };
}
export async function writeManifest(projectRoot, manifest) {
    const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH);
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    return manifestPath;
}
export async function readManifest(projectRoot) {
    const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH);
    const raw = await fs.readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed;
}
export async function manifestExists(projectRoot) {
    return fs.pathExists(path.join(projectRoot, MANIFEST_RELATIVE_PATH));
}
export function withStatus(manifest, status) {
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
    };
}
//# sourceMappingURL=manifest.js.map