import type { Hooks, Plugin } from "@opencode-ai/plugin";
export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, mergePMAgents } from "./agents.js";
export type { PMAgentName } from "./agents.js";
export { buildDefaultConfig, loadOhMyPmConfig, parseOhMyPmConfig, resolveActivePreset } from "./config.js";
export type { OhMyPmConfig } from "./config.js";
export declare const OH_MY_PM_PLUGIN_NAME = "oh-my-pm";
export declare function createOhMyPmHooks(directory: string): Hooks;
export declare const ohMyPmPlugin: Plugin;
export declare function getRuntimeAgentNames(): readonly string[];
export default ohMyPmPlugin;
//# sourceMappingURL=index.d.ts.map