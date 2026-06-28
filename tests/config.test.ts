import { describe, expect, it } from "vitest"
import { buildDefaultConfig, parseOhMyPmConfig, resolveActivePreset } from "../src/config.js"

describe("Oh My PM config", () => {
  it("builds a default config with unpkg schema and openai preset", () => {
    const config = buildDefaultConfig()

    expect(config.$schema).toBe("https://unpkg.com/oh-my-pm@latest/oh-my-pm.schema.json")
    expect(config.preset).toBe("openai")
    expect(config.presets["openai"]?.["jc"]?.model).toBe("openai/gpt-5.4-ultra")
  })

  it("parses config and resolves active preset model overrides", () => {
    const config = parseOhMyPmConfig({
      $schema: "https://unpkg.com/oh-my-pm@latest/oh-my-pm.schema.json",
      preset: "opencode",
      presets: {
        opencode: {
          jc: { model: "opencode/big-pickle", variant: "high" },
          ada: { model: "opencode/mimo-v2.5-free" },
        },
      },
    })

    const overrides = resolveActivePreset(config)

    expect(overrides["jc"]).toEqual({ model: "opencode/big-pickle", variant: "high" })
    expect(overrides["ada"]).toEqual({ model: "opencode/mimo-v2.5-free" })
  })
})
