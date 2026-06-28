import type { AgentConfig } from "@opencode-ai/sdk";
export declare const PM_AGENT_NAMES: readonly ["jc", "hammurabi", "davinci", "ada", "suntzu"];
export type PMAgentName = (typeof PM_AGENT_NAMES)[number];
export declare const PM_SUB_AGENT_NAMES: readonly ["jc-validator", "davinci-renderer"];
export type PMSubAgentName = (typeof PM_SUB_AGENT_NAMES)[number];
export declare const PM_AGENT_CONFIGS: Record<PMAgentName, AgentConfig>;
export declare const PM_SUB_AGENT_CONFIGS: Record<PMSubAgentName, AgentConfig>;
export declare function mergePMAgents(existing: Record<string, AgentConfig | undefined> | undefined): Record<string, AgentConfig>;
export type AgentModelOverride = {
    readonly model: string;
    readonly variant?: string;
};
export declare function mergePMSubAgents(existing: Record<string, AgentConfig | undefined> | undefined, merged: Record<string, AgentConfig>): Record<string, AgentConfig>;
export declare function applyModelOverrides(base: Record<string, AgentConfig>, overrides: Record<string, AgentModelOverride>): Record<string, AgentConfig>;
//# sourceMappingURL=agents.d.ts.map