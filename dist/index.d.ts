import type { Hooks, Plugin } from "@opencode-ai/plugin";
export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, mergePMAgents } from "./agents.js";
export type { PMAgentName } from "./agents.js";
export declare const PM_HARNESS_PLUGIN_NAME = "pm-harness";
export declare function createPmHarnessHooks(): Hooks;
export declare const pmHarnessPlugin: Plugin;
export declare function getRuntimeAgentNames(): readonly string[];
export default pmHarnessPlugin;
//# sourceMappingURL=index.d.ts.map