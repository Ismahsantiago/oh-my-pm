export type ValidationIssue = {
    readonly code: string;
    readonly message: string;
    readonly path: string;
};
export type ValidationReport = {
    readonly ok: boolean;
    readonly issues: readonly ValidationIssue[];
};
export declare function validateManifestData(data: unknown): ValidationReport;
export declare function validateManifestFile(manifestPath: string): Promise<ValidationReport>;
export declare function checkMermaidSyntax(source: string): ValidationReport;
export declare function checkReferencedFiles(projectRoot: string, references: readonly string[]): Promise<ValidationReport>;
//# sourceMappingURL=validation.d.ts.map