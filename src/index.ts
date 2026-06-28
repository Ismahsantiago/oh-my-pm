import type { Config, Hooks, Plugin } from "@opencode-ai/plugin"
import { applyModelOverrides, mergePMAgents, mergePMSubAgents, PM_AGENT_CONFIGS, PM_SUB_AGENT_CONFIGS } from "./agents.js"
import { loadOhMyPmConfig, resolveActivePreset } from "./config.js"

export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, PM_SUB_AGENT_CONFIGS, PM_SUB_AGENT_NAMES, mergePMAgents, mergePMSubAgents } from "./agents.js"
export type { PMAgentName, PMSubAgentName } from "./agents.js"
export { buildDefaultConfig, loadOhMyPmConfig, parseOhMyPmConfig, resolveActivePreset } from "./config.js"
export type { OhMyPmConfig } from "./config.js"

export const OH_MY_PM_PLUGIN_NAME = "oh-my-pm"

export function createOhMyPmHooks(directory: string): Hooks {
  return {
    config: async (opencodeConfig: Config) => {
      const ohMyPmConfig = await loadOhMyPmConfig(directory)
      const mergedAgents = mergePMSubAgents(opencodeConfig.agent, mergePMAgents(opencodeConfig.agent))
      opencodeConfig.agent = applyModelOverrides(mergedAgents, resolveActivePreset(ohMyPmConfig))
    },
  }
}

export const ohMyPmPlugin: Plugin = async (input) => createOhMyPmHooks(input.directory)

export function getRuntimeAgentNames(): readonly string[] {
  return [...Object.keys(PM_AGENT_CONFIGS), ...Object.keys(PM_SUB_AGENT_CONFIGS)]
}

export default ohMyPmPlugin
