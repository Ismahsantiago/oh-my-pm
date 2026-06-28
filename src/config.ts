import { z } from "zod"
import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { PM_AGENT_NAMES } from "./agents.js"

export const PRESET_NAMES = ["openai", "opencode"] as const
export type PresetName = (typeof PRESET_NAMES)[number]

const AgentPresetSchema = z
  .object({
    model: z.string().min(1),
    variant: z.string().min(1).optional(),
  })
  .strict()

export type AgentPreset = z.infer<typeof AgentPresetSchema>

const PresetSchema = z.record(z.string(), AgentPresetSchema)

export const OhMyPmConfigSchema = z
  .object({
    $schema: z.string().optional(),
    preset: z.string().min(1),
    presets: z.record(z.string(), PresetSchema),
  })
  .strict()

export type OhMyPmConfig = z.infer<typeof OhMyPmConfigSchema>

export const OH_MY_PM_CONFIG_FILENAME = "oh-my-pm.json"

export function buildDefaultConfig(): OhMyPmConfig {
  return {
    $schema: "https://unpkg.com/oh-my-pm@latest/oh-my-pm.schema.json",
    preset: "openai",
    presets: {
      openai: {
        jc: { model: "openai/gpt-5.4-ultra" },
        hammurabi: { model: "openai/gpt-4.1" },
        davinci: { model: "openai/gpt-4.1" },
        ada: { model: "openai/gpt-4.1" },
        suntzu: { model: "openai/gpt-5.4-ultra" },
      },
      opencode: {
        jc: { model: "opencode/big-pickle" },
        hammurabi: { model: "opencode/mimo-v2.5-free" },
        davinci: { model: "opencode/mimo-v2.5-free" },
        ada: { model: "opencode/mimo-v2.5-free" },
        suntzu: { model: "opencode/big-pickle" },
      },
    },
  }
}

export type AgentModelOverride = {
  readonly model: string
  readonly variant?: string
}

export function resolveActivePreset(config: OhMyPmConfig): Record<string, AgentModelOverride> {
  const active = config.presets[config.preset]
  if (active === undefined) return {}
  const overrides: Record<string, AgentModelOverride> = {}
  for (const name of PM_AGENT_NAMES) {
    const entry = active[name]
    if (entry !== undefined) {
      overrides[name] = entry.variant === undefined ? { model: entry.model } : { model: entry.model, variant: entry.variant }
    }
  }
  return overrides
}

export function parseOhMyPmConfig(data: unknown): OhMyPmConfig {
  return OhMyPmConfigSchema.parse(data)
}

function candidateConfigPaths(directory: string): readonly string[] {
  return [
    path.join(directory, OH_MY_PM_CONFIG_FILENAME),
    path.join(os.homedir(), ".config", "opencode", OH_MY_PM_CONFIG_FILENAME),
  ]
}

export async function loadOhMyPmConfig(directory: string): Promise<OhMyPmConfig> {
  for (const candidate of candidateConfigPaths(directory)) {
    if (await fs.pathExists(candidate)) {
      const raw: unknown = await fs.readJson(candidate)
      return parseOhMyPmConfig(raw)
    }
  }
  return buildDefaultConfig()
}
