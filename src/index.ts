import type { Config, Hooks, Plugin } from "@opencode-ai/plugin"
import { mergePMAgents, PM_AGENT_CONFIGS } from "./agents.js"

export { PM_AGENT_CONFIGS, PM_AGENT_NAMES, mergePMAgents } from "./agents.js"
export type { PMAgentName } from "./agents.js"

export const PM_HARNESS_PLUGIN_NAME = "pm-harness"

export function createPmHarnessHooks(): Hooks {
  return {
    config: async (opencodeConfig: Config) => {
      opencodeConfig.agent = mergePMAgents(opencodeConfig.agent)
    },
  }
}

export const pmHarnessPlugin: Plugin = async () => createPmHarnessHooks()

export function getRuntimeAgentNames(): readonly string[] {
  return Object.keys(PM_AGENT_CONFIGS)
}

export default pmHarnessPlugin
