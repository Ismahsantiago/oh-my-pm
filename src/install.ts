import chalk from "chalk"
import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parsePlatform, type Platform } from "./generator.js"
import { buildInitialManifest, MANIFEST_SCHEMA_RELATIVE_PATH, manifestExists, writeManifest } from "./utils/manifest.js"
import { validateManifestFile } from "./utils/validation.js"

export type InstallOptions = {
  readonly claude?: boolean
  readonly openai?: boolean
  readonly generic?: boolean
  readonly all?: boolean
  readonly global?: boolean
}

export type CommandResult = {
  readonly message: string
  readonly paths: readonly string[]
}

const AGENTS = ["jc", "hammurabi", "davinci", "ada", "suntzu", "oh-my-pm"] as const
const OPENCODE_PLUGIN_ENTRY = "oh-my-pm@latest"
const OPENCODE_CONFIG_TEMPLATE = `{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "${OPENCODE_PLUGIN_ENTRY}"
  ]
}
`

async function packageRoot(): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [path.join(here, ".."), path.join(here, "..", "..")]
  for (const candidate of candidates) {
    if (await fs.pathExists(path.join(candidate, "package.json"))) return candidate
  }
  return process.cwd()
}

async function templateRoot(): Promise<string> {
  return path.join(await packageRoot(), "src", "templates")
}

async function copySchema(projectRoot: string): Promise<string> {
  const source = path.join(await packageRoot(), "pm-manifest.schema.json")
  const target = path.join(projectRoot, MANIFEST_SCHEMA_RELATIVE_PATH)
  await fs.ensureDir(path.dirname(target))
  await fs.copyFile(source, target)
  return target
}

async function backupIfExists(target: string): Promise<void> {
  if (await fs.pathExists(target)) {
    await fs.copyFile(target, `${target}.oh-my-pm.backup`)
  }
}

function addPluginEntryToConfig(source: string): string {
  if (source.includes(`"${OPENCODE_PLUGIN_ENTRY}"`) || source.includes("\"oh-my-pm\"")) return source
  const pluginKeyIndex = source.indexOf("\"plugin\"")
  if (pluginKeyIndex === -1) {
    const openingBrace = source.indexOf("{")
    if (openingBrace === -1) return OPENCODE_CONFIG_TEMPLATE
    return `${source.slice(0, openingBrace + 1)}\n  "plugin": [\n    "${OPENCODE_PLUGIN_ENTRY}"\n  ],${source.slice(openingBrace + 1)}`
  }
  const arrayStart = source.indexOf("[", pluginKeyIndex)
  if (arrayStart === -1) return source
  return `${source.slice(0, arrayStart + 1)}\n    "${OPENCODE_PLUGIN_ENTRY}",${source.slice(arrayStart + 1)}`
}

async function writeOpenCodeConfig(target: string): Promise<void> {
  await fs.ensureDir(path.dirname(target))
  if (await fs.pathExists(target)) {
    await backupIfExists(target)
    const current = await fs.readFile(target, "utf8")
    await fs.writeFile(target, addPluginEntryToConfig(current), "utf8")
    return
  }
  await fs.writeFile(target, OPENCODE_CONFIG_TEMPLATE, "utf8")
}

async function copyPluginConfig(targetRoot: string): Promise<string> {
  const source = path.join(await templateRoot(), "opencode", "oh-my-pm.json")
  const target = path.join(targetRoot, "oh-my-pm.json")
  await backupIfExists(target)
  await fs.copyFile(source, target)
  return target
}

function openCodeConfigRoot(): string {
  return process.env["OH_MY_PM_OPENCODE_CONFIG_DIR"] ?? path.join(os.homedir(), ".config", "opencode")
}

export async function initProject(projectRoot: string): Promise<CommandResult> {
  const packageJsonPath = path.join(projectRoot, "package.json")
  const packageJson = (await fs.pathExists(packageJsonPath)) ? await fs.readJson(packageJsonPath) : null
  const name = typeof packageJson?.name === "string" ? packageJson.name : path.basename(projectRoot)
  const paths: string[] = []
  paths.push(await copySchema(projectRoot))
  if (!(await manifestExists(projectRoot))) {
    paths.push(await writeManifest(projectRoot, buildInitialManifest(name, new Date().toISOString())))
  }
  await fs.ensureDir(path.join(projectRoot, ".parkops", "feedback"))
  await fs.ensureDir(path.join(projectRoot, ".parkops", "artifacts"))
  return { message: chalk.green("Oh My PM project initialized."), paths }
}

async function installOpenCode(projectRoot: string): Promise<readonly string[]> {
  const root = await templateRoot()
  const written: string[] = []
  for (const agent of AGENTS) {
    const source = path.join(root, "opencode", "skills", agent, "SKILL.md")
    const target = path.join(projectRoot, ".opencode", "skills", agent, "SKILL.md")
    await fs.ensureDir(path.dirname(target))
    await fs.copyFile(source, target)
    written.push(target)
  }
  const opencodeConfig = path.join(projectRoot, "opencode.jsonc")
  if (await fs.pathExists(opencodeConfig)) {
    await writeOpenCodeConfig(opencodeConfig)
  } else {
    await fs.copyFile(path.join(root, "opencode", "opencode.jsonc"), opencodeConfig)
  }
  written.push(opencodeConfig)
  written.push(await copyPluginConfig(projectRoot))
  const agentsFile = path.join(projectRoot, "AGENTS.md")
  await backupIfExists(agentsFile)
  await fs.copyFile(path.join(root, "opencode", "AGENTS.md"), agentsFile)
  written.push(agentsFile)
  return written
}

async function installGlobalOpenCode(): Promise<readonly string[]> {
  const root = await templateRoot()
  const configRoot = openCodeConfigRoot()
  const written: string[] = []
  for (const agent of AGENTS) {
    const source = path.join(root, "opencode", "skills", agent, "SKILL.md")
    const target = path.join(configRoot, "skills", agent, "SKILL.md")
    await fs.ensureDir(path.dirname(target))
    await fs.copyFile(source, target)
    written.push(target)
  }
  const opencodeConfig = path.join(configRoot, "opencode.jsonc")
  await writeOpenCodeConfig(opencodeConfig)
  written.push(opencodeConfig)
  written.push(await copyPluginConfig(configRoot))
  return written
}

async function installSinglePlatform(projectRoot: string, platform: Platform): Promise<readonly string[]> {
  const root = await templateRoot()
  switch (platform) {
    case "opencode":
      return installOpenCode(projectRoot)
    case "claude": {
      const target = path.join(projectRoot, "CLAUDE.md")
      await backupIfExists(target)
      await fs.copyFile(path.join(root, "claude", "CLAUDE.md"), target)
      return [target]
    }
    case "openai": {
      const target = path.join(projectRoot, "agents.py")
      await backupIfExists(target)
      await fs.copyFile(path.join(root, "openai", "agents.py"), target)
      return [target]
    }
    case "generic": {
      const target = path.join(projectRoot, "OH_MY_PM_AGENTS.md")
      await backupIfExists(target)
      await fs.copyFile(path.join(root, "generic", "AGENTS.md"), target)
      return [target]
    }
    default:
      return platform
  }
}

function selectedOptionalPlatforms(options: InstallOptions): readonly Platform[] {
  if (options.all === true) return ["claude", "openai", "generic"]
  const selected: Platform[] = []
  if (options.claude === true) selected.push("claude")
  if (options.openai === true) selected.push("openai")
  if (options.generic === true) selected.push("generic")
  return selected
}

export async function installProject(projectRoot: string, options: InstallOptions): Promise<CommandResult> {
  if (options.global === true) {
    const paths: string[] = []
    for (const installedPath of await installGlobalOpenCode()) paths.push(installedPath)
    return { message: chalk.green("Oh My PM global OpenCode configuration installed."), paths }
  }
  const initialized = await initProject(projectRoot)
  const paths: string[] = []
  for (const initializedPath of initialized.paths) paths.push(initializedPath)
  for (const installedPath of await installSinglePlatform(projectRoot, "opencode")) paths.push(installedPath)
  for (const platform of selectedOptionalPlatforms(options)) {
    for (const installedPath of await installSinglePlatform(projectRoot, platform)) paths.push(installedPath)
  }
  return { message: chalk.green("Oh My PM agent team installed."), paths }
}

export async function generateTemplate(projectRoot: string, platformInput: string): Promise<CommandResult> {
  const platform = parsePlatform(platformInput)
  const source = path.join(await templateRoot(), platform)
  const target = path.join(projectRoot, ".parkops", "generated", platform)
  await fs.remove(target)
  await fs.copy(source, target)
  return { message: chalk.green(`Generated ${platform} template.`), paths: [target] }
}

export async function validateCurrentProject(projectRoot: string): Promise<CommandResult> {
  const manifestPath = path.join(projectRoot, ".parkops", "pm_manifest.json")
  const report = await validateManifestFile(manifestPath)
  if (!report.ok) {
    const details = report.issues.map((item) => `${item.path}: ${item.message}`).join("\n")
    throw new Error(`Manifest validation failed:\n${details}`)
  }
  return { message: chalk.green("Manifest is valid."), paths: [manifestPath] }
}
