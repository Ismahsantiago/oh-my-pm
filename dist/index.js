import { applyModelOverrides, mergePMAgents, PM_AGENT_CONFIGS } from "./agents.js";
import { loadOhMyPmConfig, resolveActivePreset } from "./config.js";
export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, mergePMAgents } from "./agents.js";
export { buildDefaultConfig, loadOhMyPmConfig, parseOhMyPmConfig, resolveActivePreset } from "./config.js";
export const OH_MY_PM_PLUGIN_NAME = "oh-my-pm";
export function createOhMyPmHooks(directory) {
    return {
        config: async (opencodeConfig) => {
            const ohMyPmConfig = await loadOhMyPmConfig(directory);
            const mergedAgents = mergePMAgents(opencodeConfig.agent);
            opencodeConfig.agent = applyModelOverrides(mergedAgents, resolveActivePreset(ohMyPmConfig));
        },
    };
}
export const ohMyPmPlugin = async (input) => createOhMyPmHooks(input.directory);
export function getRuntimeAgentNames() {
    return Object.keys(PM_AGENT_CONFIGS);
}
export default ohMyPmPlugin;
//# sourceMappingURL=index.js.map