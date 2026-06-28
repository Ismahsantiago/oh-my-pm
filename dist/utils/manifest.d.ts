export declare const MANIFEST_RELATIVE_PATH = ".parkops/pm_manifest.json";
export declare const MANIFEST_SCHEMA_RELATIVE_PATH = ".parkops/schemas/pm-manifest-schema.json";
export declare const MANIFEST_STATUSES: readonly ["discovery", "designed", "approved", "in_development", "blocked", "completed"];
export declare const TASK_STATUSES: readonly ["pending", "in_progress", "blocked", "completed"];
export type ManifestStatus = (typeof MANIFEST_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type ManifestTask = {
    readonly id: string;
    readonly depends_on: readonly string[];
    readonly spec_reference: string;
    readonly description: string;
    readonly status: TaskStatus;
    readonly verification_criteria: readonly string[];
    readonly assigned_to: string;
};
export type Manifest = {
    readonly $schema: string;
    readonly project_metadata: {
        readonly name: string;
        readonly blueprint_version: string;
        readonly status: ManifestStatus;
        readonly generated_by: string;
        readonly generated_at: string;
    };
    readonly product_blueprints: {
        readonly prd: string;
        readonly trd: string;
        readonly db_schema: string;
        readonly ui_flows: readonly string[];
        readonly execution_plan: string;
    };
    readonly execution_dag: {
        readonly version: string;
        readonly tasks: readonly ManifestTask[];
    };
    readonly feedback_channel: {
        readonly blockers: readonly Blocker[];
        readonly decisions: readonly Decision[];
    };
};
export type Blocker = {
    readonly id: string;
    readonly raised_by: "dev-harness" | "oh-my-pm";
    readonly description: string;
    readonly proposed_solutions: readonly string[];
    readonly status: "open" | "resolved";
    readonly resolution: string;
};
export type Decision = {
    readonly id: string;
    readonly description: string;
    readonly rationale: string;
    readonly alternatives_considered: readonly string[];
};
export declare function buildInitialManifest(projectName: string, generatedAt: string): Manifest;
export declare function writeManifest(projectRoot: string, manifest: Manifest): Promise<string>;
export declare function readManifest(projectRoot: string): Promise<unknown>;
export declare function manifestExists(projectRoot: string): Promise<boolean>;
export declare function withStatus(manifest: Manifest, status: ManifestStatus): Manifest;
//# sourceMappingURL=manifest.d.ts.map