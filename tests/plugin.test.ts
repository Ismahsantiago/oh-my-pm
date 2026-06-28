import type { Config } from "@opencode-ai/plugin"
import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { createOhMyPmHooks, getRuntimeAgentNames } from "../src/index.js"

const tempRoots: string[] = []

async function createRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "oh-my-pm-plugin-"))
  tempRoots.push(root)
  return root
}

afterEach(async () => {
  for (const root of tempRoots.splice(0)) await fs.remove(root)
})

describe("OpenCode runtime plugin", () => {
  it("injects the PM agent team through the config hook", async () => {
    const root = await createRoot()
    const hooks = createOhMyPmHooks(root)
    const config: Config = {}

    if (hooks.config === undefined) throw new Error("config hook is missing")
    await hooks.config(config)

    expect(Object.keys(config.agent ?? {})).toEqual(["jc", "hammurabi", "davinci", "ada", "suntzu", "jc-validator", "davinci-renderer"])
    expect(config.agent?.["jc"]?.mode).toBe("all")
    expect(config.agent?.["hammurabi"]?.mode).toBe("subagent")
    expect(config.agent?.["jc"]?.model).toBe("openai/gpt-5.4-ultra")
  })

  it("loads model presets from oh-my-pm.json", async () => {
    const root = await createRoot()
    await fs.ensureDir(path.join(root, ".opencode"))
    await fs.writeJson(path.join(root, ".opencode/oh-my-pm.json"), {
      preset: "opencode",
      presets: {
        opencode: {
          jc: { model: "opencode/big-pickle", variant: "high" },
          hammurabi: { model: "opencode/mimo-v2.5-free" },
        },
      },
    })
    const hooks = createOhMyPmHooks(root)
    const config: Config = {}

    if (hooks.config === undefined) throw new Error("config hook is missing")
    await hooks.config(config)

    expect(config.agent?.["jc"]?.model).toBe("opencode/big-pickle")
    expect(config.agent?.["jc"]?.variant).toBe("high")
    expect(config.agent?.["hammurabi"]?.model).toBe("opencode/mimo-v2.5-free")
    expect(config.agent?.["ada"]?.model).toBe("openai/gpt-4.1")
  })

  it("exposes stable runtime agent names", () => {
    expect(getRuntimeAgentNames()).toEqual(["jc", "hammurabi", "davinci", "ada", "suntzu", "jc-validator", "davinci-renderer"])
  })
})
