import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { installProject, validateCurrentProject } from "../src/install.js"

type TempProject = {
  readonly root: string
}

let tempProject: TempProject | null = null

async function createTempProject(): Promise<TempProject> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "pm-harness-test-"))
  await fs.writeJson(path.join(root, "package.json"), { name: "pm-harness-test-app" })
  return { root }
}

async function readText(project: TempProject, relativePath: string): Promise<string> {
  return fs.readFile(path.join(project.root, relativePath), "utf8")
}

describe("project installer", () => {
  beforeEach(async () => {
    tempProject = await createTempProject()
  })

  afterEach(async () => {
    if (tempProject !== null) await fs.remove(tempProject.root)
    tempProject = null
  })

  it("installs OpenCode runtime plugin config and project skill files", async () => {
    if (tempProject === null) throw new Error("temp project was not created")

    const result = await installProject(tempProject.root, { all: true })
    const opencodeConfig = await readText(tempProject, "opencode.jsonc")
    const skill = await readText(tempProject, ".opencode/skills/jc/SKILL.md")

    expect(result.paths.some((item) => item.endsWith("opencode.jsonc"))).toBe(true)
    expect(opencodeConfig).toContain('"plugin"')
    expect(opencodeConfig).toContain('"pm-harness"')
    expect(opencodeConfig).toContain('"agent"')
    expect(opencodeConfig).not.toContain('"skills"')
    expect(skill.startsWith('---\nname: jc\ndescription: "Discovery orchestrator')).toBe(true)
    await expect(validateCurrentProject(tempProject.root)).resolves.toMatchObject({ message: expect.stringContaining("valid") })
  })
})
