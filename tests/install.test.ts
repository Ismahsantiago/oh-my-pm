import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { installProject, validateCurrentProject } from "../src/install.js"

type TempProject = {
  readonly root: string
}

let tempProject: TempProject | null = null
let previousConfigDir: string | undefined

async function createTempProject(): Promise<TempProject> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "oh-my-pm-test-"))
  await fs.writeJson(path.join(root, "package.json"), { name: "oh-my-pm-test-app" })
  return { root }
}

async function readText(project: TempProject, relativePath: string): Promise<string> {
  return fs.readFile(path.join(project.root, relativePath), "utf8")
}

describe("project installer", () => {
  beforeEach(async () => {
    previousConfigDir = process.env["OH_MY_PM_OPENCODE_CONFIG_DIR"]
    tempProject = await createTempProject()
  })

  afterEach(async () => {
    if (previousConfigDir === undefined) delete process.env["OH_MY_PM_OPENCODE_CONFIG_DIR"]
    else process.env["OH_MY_PM_OPENCODE_CONFIG_DIR"] = previousConfigDir
    if (tempProject !== null) await fs.remove(tempProject.root)
    tempProject = null
  })

  it("installs OpenCode runtime plugin config and project skill files", async () => {
    if (tempProject === null) throw new Error("temp project was not created")

    const result = await installProject(tempProject.root, { all: true })
    const opencodeConfig = await readText(tempProject, "opencode.jsonc")
    const pluginConfig = await readText(tempProject, "oh-my-pm.json")
    const configSkill = await readText(tempProject, ".opencode/skills/oh-my-pm/SKILL.md")
    const jcSkill = await readText(tempProject, ".opencode/skills/jc/SKILL.md")

    expect(result.paths.some((item) => item.endsWith("opencode.jsonc"))).toBe(true)
    expect(opencodeConfig).toContain('"plugin"')
    expect(opencodeConfig).toContain('"oh-my-pm@latest"')
    expect(opencodeConfig).toContain('"agent"')
    expect(opencodeConfig).not.toContain('"skills"')
    expect(pluginConfig).toContain('"$schema": "https://unpkg.com/oh-my-pm@latest/oh-my-pm.schema.json"')
    expect(configSkill.startsWith("---\nname: oh-my-pm\ndescription: Configure")).toBe(true)
    expect(jcSkill.startsWith('---\nname: jc\ndescription: "Discovery orchestrator')).toBe(true)
    await expect(validateCurrentProject(tempProject.root)).resolves.toMatchObject({ message: expect.stringContaining("valid") })
  })

  it("merges global OpenCode plugin registration without removing existing plugins", async () => {
    if (tempProject === null) throw new Error("temp project was not created")
    process.env["OH_MY_PM_OPENCODE_CONFIG_DIR"] = tempProject.root
    await fs.writeFile(
      path.join(tempProject.root, "opencode.jsonc"),
      '{\n  "plugin": [\n    "oh-my-opencode-slim@latest"\n  ],\n  "lsp": true\n}\n',
      "utf8",
    )

    const result = await installProject(tempProject.root, { global: true })
    const opencodeConfig = await readText(tempProject, "opencode.jsonc")

    expect(result.paths.some((item) => item.endsWith("skills/oh-my-pm/SKILL.md"))).toBe(true)
    expect(opencodeConfig).toContain('"oh-my-opencode-slim@latest"')
    expect(opencodeConfig).toContain('"oh-my-pm@latest"')
    expect(opencodeConfig).toContain('"lsp": true')
    expect(await fs.pathExists(path.join(tempProject.root, "oh-my-pm.json"))).toBe(true)
    expect(await fs.pathExists(path.join(tempProject.root, ".parkops"))).toBe(false)
  })
})
