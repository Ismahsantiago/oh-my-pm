#!/usr/bin/env node
import chalk from "chalk"
import { Command } from "commander"
import { generateTemplate, initProject, installProject, validateCurrentProject, type InstallOptions } from "./install.js"

const program = new Command()

function printResult(result: { readonly message: string; readonly paths: readonly string[] }): void {
  console.log(result.message)
  for (const writtenPath of result.paths) console.log(chalk.dim(`- ${writtenPath}`))
}

export async function runCli(argv: readonly string[]): Promise<void> {
  program
    .name("pm-harness")
    .description("Install a Product Management agent team for PRD, TRD, flows, DB design, and execution DAGs.")
    .version("1.0.0")

  program
    .command("init")
    .description("Scaffold PM-Harness state in the current project.")
    .action(async () => {
      printResult(await initProject(process.cwd()))
    })

  program
    .command("install")
    .description("Install the OpenCode PM-Harness plugin team into the current project.")
    .option("--claude", "Also install CLAUDE.md instructions.")
    .option("--openai", "Also install OpenAI Agents SDK template.")
    .option("--generic", "Also install generic Markdown instructions.")
    .option("--all", "Install all platform equivalents.")
    .action(async (options: InstallOptions) => {
      printResult(await installProject(process.cwd(), options))
    })

  program
    .command("generate")
    .argument("<type>", "Template type: opencode, claude, openai, or generic.")
    .description("Generate a platform template under .parkops/generated without installing it.")
    .action(async (type: string) => {
      printResult(await generateTemplate(process.cwd(), type))
    })

  program
    .command("validate")
    .description("Validate .parkops/pm_manifest.json in the current project.")
    .action(async () => {
      printResult(await validateCurrentProject(process.cwd()))
    })

  await program.parseAsync(argv)
}

runCli(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(chalk.red(error.message))
    process.exitCode = 1
    return
  }
  console.error(chalk.red("Unknown failure."))
  process.exitCode = 1
})
