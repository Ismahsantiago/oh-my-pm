export type InstallOptions = {
    readonly claude?: boolean;
    readonly cursor?: boolean;
    readonly openai?: boolean;
    readonly generic?: boolean;
    readonly all?: boolean;
    readonly global?: boolean;
};
export type CommandResult = {
    readonly message: string;
    readonly paths: readonly string[];
};
export declare function initProject(projectRoot: string): Promise<CommandResult>;
export declare function installProject(projectRoot: string, options: InstallOptions): Promise<CommandResult>;
export declare function generateTemplate(projectRoot: string, platformInput: string): Promise<CommandResult>;
export declare function validateCurrentProject(projectRoot: string): Promise<CommandResult>;
//# sourceMappingURL=install.d.ts.map