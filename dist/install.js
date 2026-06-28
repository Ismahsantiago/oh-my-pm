import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePlatform } from "./generator.js";
import { buildInitialManifest, MANIFEST_SCHEMA_RELATIVE_PATH, manifestExists, writeManifest } from "./utils/manifest.js";
import { validateManifestFile } from "./utils/validation.js";
const AGENTS = ["jc", "hammurabi", "davinci", "ada", "suntzu"];
async function packageRoot() {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [path.join(here, ".."), path.join(here, "..", "..")];
    for (const candidate of candidates) {
        if (await fs.pathExists(path.join(candidate, "package.json")))
            return candidate;
    }
    return process.cwd();
}
async function templateRoot() {
    return path.join(await packageRoot(), "src", "templates");
}
async function copySchema(projectRoot) {
    const source = path.join(await packageRoot(), "pm-harness.schema.json");
    const target = path.join(projectRoot, MANIFEST_SCHEMA_RELATIVE_PATH);
    await fs.ensureDir(path.dirname(target));
    await fs.copyFile(source, target);
    return target;
}
async function backupIfExists(target) {
    if (await fs.pathExists(target)) {
        await fs.copyFile(target, `${target}.pm-harness.backup`);
    }
}
export async function initProject(projectRoot) {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = (await fs.pathExists(packageJsonPath)) ? await fs.readJson(packageJsonPath) : null;
    const name = typeof packageJson?.name === "string" ? packageJson.name : path.basename(projectRoot);
    const paths = [];
    paths.push(await copySchema(projectRoot));
    if (!(await manifestExists(projectRoot))) {
        paths.push(await writeManifest(projectRoot, buildInitialManifest(name, new Date().toISOString())));
    }
    await fs.ensureDir(path.join(projectRoot, ".parkops", "feedback"));
    await fs.ensureDir(path.join(projectRoot, ".parkops", "artifacts"));
    return { message: chalk.green("PM-Harness project initialized."), paths };
}
async function installOpenCode(projectRoot) {
    const root = await templateRoot();
    const written = [];
    for (const agent of AGENTS) {
        const source = path.join(root, "opencode", "skills", agent, "SKILL.md");
        const target = path.join(projectRoot, ".opencode", "skills", agent, "SKILL.md");
        await fs.ensureDir(path.dirname(target));
        await fs.copyFile(source, target);
        written.push(target);
    }
    const opencodeConfig = path.join(projectRoot, "opencode.jsonc");
    await backupIfExists(opencodeConfig);
    await fs.copyFile(path.join(root, "opencode", "opencode.jsonc"), opencodeConfig);
    written.push(opencodeConfig);
    const agentsFile = path.join(projectRoot, "AGENTS.md");
    await backupIfExists(agentsFile);
    await fs.copyFile(path.join(root, "opencode", "AGENTS.md"), agentsFile);
    written.push(agentsFile);
    return written;
}
async function installSinglePlatform(projectRoot, platform) {
    const root = await templateRoot();
    switch (platform) {
        case "opencode":
            return installOpenCode(projectRoot);
        case "claude": {
            const target = path.join(projectRoot, "CLAUDE.md");
            await backupIfExists(target);
            await fs.copyFile(path.join(root, "claude", "CLAUDE.md"), target);
            return [target];
        }
        case "openai": {
            const target = path.join(projectRoot, "agents.py");
            await backupIfExists(target);
            await fs.copyFile(path.join(root, "openai", "agents.py"), target);
            return [target];
        }
        case "generic": {
            const target = path.join(projectRoot, "PM_HARNESS_AGENTS.md");
            await backupIfExists(target);
            await fs.copyFile(path.join(root, "generic", "AGENTS.md"), target);
            return [target];
        }
        default:
            return platform;
    }
}
function selectedOptionalPlatforms(options) {
    if (options.all === true)
        return ["claude", "openai", "generic"];
    const selected = [];
    if (options.claude === true)
        selected.push("claude");
    if (options.openai === true)
        selected.push("openai");
    if (options.generic === true)
        selected.push("generic");
    return selected;
}
export async function installProject(projectRoot, options) {
    const initialized = await initProject(projectRoot);
    const paths = [];
    for (const initializedPath of initialized.paths)
        paths.push(initializedPath);
    for (const installedPath of await installSinglePlatform(projectRoot, "opencode"))
        paths.push(installedPath);
    for (const platform of selectedOptionalPlatforms(options)) {
        for (const installedPath of await installSinglePlatform(projectRoot, platform))
            paths.push(installedPath);
    }
    return { message: chalk.green("PM-Harness agent team installed."), paths };
}
export async function generateTemplate(projectRoot, platformInput) {
    const platform = parsePlatform(platformInput);
    const source = path.join(await templateRoot(), platform);
    const target = path.join(projectRoot, ".parkops", "generated", platform);
    await fs.remove(target);
    await fs.copy(source, target);
    return { message: chalk.green(`Generated ${platform} template.`), paths: [target] };
}
export async function validateCurrentProject(projectRoot) {
    const manifestPath = path.join(projectRoot, ".parkops", "pm_manifest.json");
    const report = await validateManifestFile(manifestPath);
    if (!report.ok) {
        const details = report.issues.map((item) => `${item.path}: ${item.message}`).join("\n");
        throw new Error(`Manifest validation failed:\n${details}`);
    }
    return { message: chalk.green("Manifest is valid."), paths: [manifestPath] };
}
//# sourceMappingURL=install.js.map