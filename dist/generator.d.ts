export declare const PLATFORMS: readonly ["opencode", "claude", "openai", "generic"];
export type Platform = (typeof PLATFORMS)[number];
export type GeneratedArtifact = {
    readonly path: string;
    readonly title: string;
};
export type GenerationInput = {
    readonly projectRoot: string;
    readonly projectName: string;
    readonly conversation: string;
    readonly generatedAt: string;
};
export declare class UnsupportedPlatformError extends Error {
    readonly platform: string;
    readonly name = "UnsupportedPlatformError";
    constructor(platform: string);
}
export declare function parsePlatform(value: string): Platform;
export declare function generateProductArtifacts(input: GenerationInput): Promise<readonly GeneratedArtifact[]>;
//# sourceMappingURL=generator.d.ts.map