import fs from "fs-extra";
import path from "node:path";
const VALID_PROJECT_STATUSES = new Set([
    "discovery",
    "designed",
    "approved",
    "in_development",
    "blocked",
    "completed",
]);
const VALID_TASK_STATUSES = new Set(["pending", "in_progress", "blocked", "completed"]);
function issue(code, pathValue, message) {
    return { code, path: pathValue, message };
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function stringAt(record, key) {
    const value = record[key];
    return typeof value === "string" ? value : null;
}
function arrayAt(record, key) {
    const value = record[key];
    return Array.isArray(value) ? value : null;
}
function requireObject(record, key, issues, parent) {
    const value = record[key];
    if (isRecord(value))
        return value;
    issues.push(issue("required_object", `${parent}.${key}`, "Expected an object."));
    return null;
}
function requireString(record, key, issues, parent) {
    if (stringAt(record, key) === null) {
        issues.push(issue("required_string", `${parent}.${key}`, "Expected a string."));
    }
}
function validateMetadata(root, issues) {
    const metadata = requireObject(root, "project_metadata", issues, "$");
    if (metadata === null)
        return;
    for (const key of ["name", "blueprint_version", "generated_by", "generated_at"]) {
        requireString(metadata, key, issues, "$.project_metadata");
    }
    const status = stringAt(metadata, "status");
    if (status === null || !VALID_PROJECT_STATUSES.has(status)) {
        issues.push(issue("invalid_status", "$.project_metadata.status", "Status is not part of the PM-Harness lifecycle."));
    }
}
function validateBlueprints(root, issues) {
    const blueprints = requireObject(root, "product_blueprints", issues, "$");
    if (blueprints === null)
        return;
    for (const key of ["prd", "trd", "db_schema", "execution_plan"]) {
        requireString(blueprints, key, issues, "$.product_blueprints");
    }
    const flows = arrayAt(blueprints, "ui_flows");
    if (flows === null || flows.length === 0 || flows.some((entry) => typeof entry !== "string")) {
        issues.push(issue("invalid_flows", "$.product_blueprints.ui_flows", "Expected at least one flow path string."));
    }
}
function validateTask(task, index, issues) {
    if (!isRecord(task)) {
        issues.push(issue("invalid_task", `$.execution_dag.tasks[${index}]`, "Task must be an object."));
        return;
    }
    for (const key of ["id", "spec_reference", "description", "assigned_to"]) {
        requireString(task, key, issues, `$.execution_dag.tasks[${index}]`);
    }
    const status = stringAt(task, "status");
    if (status === null || !VALID_TASK_STATUSES.has(status)) {
        issues.push(issue("invalid_task_status", `$.execution_dag.tasks[${index}].status`, "Task status is invalid."));
    }
    const dependsOn = arrayAt(task, "depends_on");
    if (dependsOn === null || dependsOn.some((entry) => typeof entry !== "string")) {
        issues.push(issue("invalid_dependencies", `$.execution_dag.tasks[${index}].depends_on`, "Dependencies must be strings."));
    }
    const criteria = arrayAt(task, "verification_criteria");
    if (criteria === null || criteria.length === 0 || criteria.some((entry) => typeof entry !== "string")) {
        issues.push(issue("invalid_verification", `$.execution_dag.tasks[${index}].verification_criteria`, "Verification criteria must be non-empty strings."));
    }
}
function validateDag(root, issues) {
    const dag = requireObject(root, "execution_dag", issues, "$");
    if (dag === null)
        return;
    requireString(dag, "version", issues, "$.execution_dag");
    const tasks = arrayAt(dag, "tasks");
    if (tasks === null) {
        issues.push(issue("invalid_tasks", "$.execution_dag.tasks", "Expected a task array."));
        return;
    }
    tasks.forEach((task, index) => validateTask(task, index, issues));
}
function validateFeedback(root, issues) {
    const feedback = requireObject(root, "feedback_channel", issues, "$");
    if (feedback === null)
        return;
    for (const key of ["blockers", "decisions"]) {
        const value = arrayAt(feedback, key);
        if (value === null)
            issues.push(issue("invalid_feedback", `$.feedback_channel.${key}`, "Expected an array."));
    }
}
export function validateManifestData(data) {
    const issues = [];
    if (!isRecord(data)) {
        return { ok: false, issues: [issue("invalid_root", "$", "Manifest root must be an object.")] };
    }
    requireString(data, "$schema", issues, "$");
    validateMetadata(data, issues);
    validateBlueprints(data, issues);
    validateDag(data, issues);
    validateFeedback(data, issues);
    return { ok: issues.length === 0, issues };
}
export async function validateManifestFile(manifestPath) {
    const raw = await fs.readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return validateManifestData(parsed);
}
export function checkMermaidSyntax(source) {
    const firstLine = source.split(/\r?\n/).find((line) => line.trim().length > 0);
    const validPrefixes = ["flowchart", "graph", "sequenceDiagram", "stateDiagram", "erDiagram", "journey", "gantt", "classDiagram"];
    const ok = firstLine !== undefined && validPrefixes.some((prefix) => firstLine.trim().startsWith(prefix));
    return ok ? { ok: true, issues: [] } : { ok: false, issues: [issue("invalid_mermaid", "$", "Mermaid source must start with a supported diagram keyword.")] };
}
export async function checkReferencedFiles(projectRoot, references) {
    const issues = [];
    for (const reference of references) {
        const exists = await fs.pathExists(path.join(projectRoot, reference));
        if (!exists)
            issues.push(issue("missing_reference", reference, "Referenced file does not exist."));
    }
    return { ok: issues.length === 0, issues };
}
//# sourceMappingURL=validation.js.map