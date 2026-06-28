import type { Config } from "@opencode-ai/plugin"
import { describe, expect, it } from "vitest"
import { createPmHarnessHooks, getRuntimeAgentNames } from "../src/index.js"

describe("OpenCode runtime plugin", () => {
  it("injects the PM agent team through the config hook", async () => {
    const hooks = createPmHarnessHooks()
    const config: Config = {}

    if (hooks.config === undefined) throw new Error("config hook is missing")
    await hooks.config(config)

    expect(Object.keys(config.agent ?? {})).toEqual(["jc", "hammurabi", "davinci", "ada", "suntzu"])
    expect(config.agent?.["jc"]?.mode).toBe("all")
    expect(config.agent?.["hammurabi"]?.mode).toBe("subagent")
    expect(config.agent?.["jc"]?.model).toBe("openai/gpt-5.4-ultra")
  })

  it("exposes stable runtime agent names", () => {
    expect(getRuntimeAgentNames()).toEqual(["jc", "hammurabi", "davinci", "ada", "suntzu"])
  })
})
