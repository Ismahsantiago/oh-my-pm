import { mergePMAgents, PM_AGENT_CONFIGS } from "./agents.js";
export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, mergePMAgents } from "./agents.js";
export const PM_HARNESS_PLUGIN_NAME = "pm-harness";
export function createPmHarnessHooks() {
    return {
        config: async (opencodeConfig) => {
            opencodeConfig.agent = mergePMAgents(opencodeConfig.agent);
        },
    };
}
export const pmHarnessPlugin = async () => createPmHarnessHooks();
export function getRuntimeAgentNames() {
    return Object.keys(PM_AGENT_CONFIGS);
}
export default pmHarnessPlugin;
//# sourceMappingURL=index.js.map