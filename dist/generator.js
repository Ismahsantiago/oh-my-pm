import fs from "fs-extra";
import path from "node:path";
import { buildInitialManifest, writeManifest } from "./utils/manifest.js";
export const PLATFORMS = ["opencode", "cursor", "claude", "openai", "generic"];
export class UnsupportedPlatformError extends Error {
    platform;
    name = "UnsupportedPlatformError";
    constructor(platform) {
        super(`Unsupported platform: ${platform}`);
        this.platform = platform;
    }
}
export function parsePlatform(value) {
    switch (value) {
        case "opencode":
            return "opencode";
        case "cursor":
            return "cursor";
        case "claude":
            return "claude";
        case "openai":
            return "openai";
        case "generic":
            return "generic";
        default:
            throw new UnsupportedPlatformError(value);
    }
}
function normalizeIdea(conversation) {
    const trimmed = conversation.trim();
    return trimmed.length > 0 ? trimmed : "Product concept pending discovery.";
}
function productTasks() {
    return [
        {
            id: "task_01_setup_project",
            depends_on: [],
            spec_reference: "PRD §3.1",
            description: "Create the project foundation and configuration required by the product blueprint.",
            status: "pending",
            verification_criteria: ["test -f package.json"],
            assigned_to: "dev-harness",
        },
        {
            id: "task_02_build_core_flow",
            depends_on: ["task_01_setup_project"],
            spec_reference: "Flows §2.1",
            description: "Implement the primary user journey from entry point to successful completion.",
            status: "pending",
            verification_criteria: ["npm test"],
            assigned_to: "dev-harness",
        },
        {
            id: "task_03_verify_release",
            depends_on: ["task_02_build_core_flow"],
            spec_reference: "TRD §6.1",
            description: "Run build, tests, and user-surface verification before marking the delivery complete.",
            status: "pending",
            verification_criteria: ["npm run build"],
            assigned_to: "dev-harness",
        },
    ];
}
function buildManifest(input) {
    const base = buildInitialManifest(input.projectName, input.generatedAt);
    return {
        $schema: base.$schema,
        project_metadata: {
            name: base.project_metadata.name,
            blueprint_version: base.project_metadata.blueprint_version,
            status: "designed",
            generated_by: base.project_metadata.generated_by,
            generated_at: base.project_metadata.generated_at,
        },
        product_blueprints: base.product_blueprints,
        execution_dag: { version: "1.0.0", tasks: productTasks() },
        feedback_channel: {
            blockers: [],
            decisions: [
                {
                    id: "decision_01",
                    description: "The manifest is the PM and Dev contract.",
                    rationale: "A file-based contract keeps orchestration auditable and asynchronous.",
                    alternatives_considered: ["Chat-only handoff", "Issue tracker handoff"],
                },
            ],
        },
    };
}
function artifactContent(title, idea) {
    return `# ${title}

## Source idea

${idea}

## Oh My PM contract

This artifact is generated from discovery context and must be cross-referenced from .pm/pm_manifest.json. Any ambiguity must be moved into feedback_channel.blockers before Dev-Harness starts implementation.
`;
}
export async function generateProductArtifacts(input) {
    const idea = normalizeIdea(input.conversation);
    const docsRoot = path.join(input.projectRoot, "docs");
    const dirs = ["flows", "architecture", "decisions", "ux/screens", "images", "features"];
    for (const dir of dirs) {
        await fs.ensureDir(path.join(docsRoot, dir));
    }
    const artifacts = [
        { path: "docs/prd.md", title: "Product Requirements Document" },
        { path: "docs/trd.md", title: "Technical Requirements Document" },
        { path: "docs/db-schema.md", title: "Database Schema" },
        { path: "docs/flows/main-flow.md", title: "Main UX Flow" },
        { path: "docs/architecture/system-context.md", title: "System Context & Architecture" },
        { path: "docs/execution-plan.md", title: "Execution Plan" },
    ];
    for (const artifact of artifacts) {
        const target = path.join(input.projectRoot, artifact.path);
        await fs.outputFile(target, artifactContent(artifact.title, idea), "utf8");
    }
    await writeManifest(input.projectRoot, buildManifest(input));
    return artifacts;
}
//# sourceMappingURL=generator.js.map