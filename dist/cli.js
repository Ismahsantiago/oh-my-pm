#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { generateTemplate, initProject, installProject, validateCurrentProject } from "./install.js";
const program = new Command();
function printResult(result) {
    console.log(result.message);
    for (const writtenPath of result.paths)
        console.log(chalk.dim(`- ${writtenPath}`));
}
export async function runCli(argv) {
    program
        .name("oh-my-pm")
        .description("Install a Product Management agent team for PRD, TRD, flows, DB design, and execution DAGs.")
        .version("1.0.0");
    program
        .command("init")
        .description("Scaffold Oh My PM state in the current project.")
        .action(async () => {
        printResult(await initProject(process.cwd()));
    });
    program
        .command("install")
        .description("Install the OpenCode Oh My PM plugin team into the current project.")
        .option("--cursor", "Also install Cursor native template.")
        .option("--claude", "Also install CLAUDE.md instructions.")
        .option("--openai", "Also install OpenAI Agents SDK template.")
        .option("--generic", "Also install generic Markdown instructions.")
        .option("--all", "Install all platform equivalents.")
        .option("--global", "Install Oh My PM into ~/.config/opencode like oh-my-opencode-slim.")
        .action(async (options) => {
        printResult(await installProject(process.cwd(), options));
    });
    program
        .command("generate")
        .argument("<type>", "Template type: opencode, cursor, claude, openai, or generic.")
        .description("Generate a platform template under .pm/generated without installing it.")
        .action(async (type) => {
        printResult(await generateTemplate(process.cwd(), type));
    });
    program
        .command("validate")
        .description("Validate .pm/pm_manifest.json in the current project.")
        .action(async () => {
        printResult(await validateCurrentProject(process.cwd()));
    });
    await program.parseAsync(argv);
}
runCli(process.argv).catch((error) => {
    if (error instanceof Error) {
        console.error(chalk.red(error.message));
        process.exitCode = 1;
        return;
    }
    console.error(chalk.red("Unknown failure."));
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map