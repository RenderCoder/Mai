#!/usr/bin/env bun

/**
 * Update installed Mai skills from GitHub with backup-based overwrite.
 *
 * This script is self-staging: the first process copies itself to a temporary
 * directory, then runs that copy. That avoids replacing the installed script
 * while it is executing from ~/.codex/skills/mai.
 */

import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, rename } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { parseArgs } from "node:util";

const REPO_URL = "https://github.com/RenderCoder/Mai";
const DEFAULT_REF = "main";
const CODEX_HOME_ENV = "CODEX_HOME";
const MAI_SKILLS = [
  "mai",
  "mai-title",
  "mai-copy",
  "mai-rich",
  "mai-product",
  "mai-brief",
];

export interface UpdateOptions {
  sourceRoot?: string;
  codexHome?: string;
  skills?: string[];
  all?: boolean;
  dryRun?: boolean;
  ref?: string;
  repoUrl?: string;
  now?: Date;
}

export interface UpdatePlanItem {
  skill: string;
  source: string;
  destination: string;
  exists: boolean;
  backup?: string;
  action: "copy" | "overwrite";
}

export interface UpdatePlan {
  skillsDir: string;
  backupRoot: string;
  items: UpdatePlanItem[];
}

function defaultCodexHome(): string {
  return process.env[CODEX_HOME_ENV] || join(homedir(), ".codex");
}

function toAbsolute(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return resolve(path);
}

function toAbsoluteFrom(path: string, baseDir: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return isAbsolute(path) ? path : resolve(baseDir, path);
}

function timestamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function parseSkillList(value?: string): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateSkillName(skill: string): void {
  if (!MAI_SKILLS.includes(skill)) {
    throw new Error(`Unsupported Mai skill: ${skill}`);
  }
}

function selectSkills(skillsDir: string, opts: UpdateOptions): string[] {
  if (opts.all) return [...MAI_SKILLS];
  if (opts.skills && opts.skills.length > 0) {
    for (const skill of opts.skills) validateSkillName(skill);
    return opts.skills;
  }

  const installed = MAI_SKILLS.filter((skill) =>
    existsSync(join(skillsDir, skill)),
  );
  return installed.length > 0 ? installed : ["mai"];
}

function validateSourceSkill(source: string): void {
  if (!existsSync(source)) {
    throw new Error(`Skill source not found: ${source}`);
  }
  if (!existsSync(join(source, "SKILL.md"))) {
    throw new Error(`SKILL.md not found in source: ${source}`);
  }
  if (!existsSync(join(source, "VERSION"))) {
    throw new Error(`VERSION not found in source: ${source}`);
  }
}

export function createUpdatePlan(opts: UpdateOptions): UpdatePlan {
  const sourceRoot = resolve(opts.sourceRoot ?? ".");
  const codexHome = toAbsolute(opts.codexHome ?? defaultCodexHome());
  const skillsDir = join(codexHome, "skills");
  const backupRoot = join(
    skillsDir,
    ".mai-update-backups",
    timestamp(opts.now),
  );
  const skills = selectSkills(skillsDir, opts);

  const items = skills.map((skill) => {
    const source = join(sourceRoot, "skills", skill);
    validateSourceSkill(source);
    const destination = join(skillsDir, basename(skill));
    const exists = existsSync(destination);
    return {
      skill,
      source,
      destination,
      exists,
      backup: exists ? join(backupRoot, basename(skill)) : undefined,
      action: exists ? "overwrite" : "copy",
    } satisfies UpdatePlanItem;
  });

  return { skillsDir, backupRoot, items };
}

async function moveAside(path: string, target: string): Promise<void> {
  await mkdir(dirname(target), { recursive: true });
  await rename(path, target);
}

export async function updateInstalledSkills(
  opts: UpdateOptions,
): Promise<UpdatePlan> {
  const plan = createUpdatePlan(opts);
  if (opts.dryRun) return plan;

  await mkdir(plan.skillsDir, { recursive: true });

  for (const item of plan.items) {
    if (item.exists) {
      if (!item.backup)
        throw new Error(`Missing backup path for ${item.skill}`);
      await moveAside(item.destination, item.backup);
    }

    try {
      await cp(item.source, item.destination, {
        recursive: true,
        force: false,
        errorOnExist: true,
      });
    } catch (err) {
      if (
        item.backup &&
        existsSync(item.backup) &&
        !existsSync(item.destination)
      ) {
        await rename(item.backup, item.destination);
      }
      throw err;
    }
  }

  return plan;
}

function printPlan(plan: UpdatePlan, dryRun: boolean): void {
  console.log(`${dryRun ? "Mai update dry run" : "Mai update"}:`);
  console.log(`Target skills directory: ${plan.skillsDir}`);

  for (const item of plan.items) {
    console.log(`- ${item.action}: ${item.skill} -> ${item.destination}`);
    if (item.backup) console.log(`  backup: ${item.backup}`);
  }
}

async function runCommand(args: string[], cwd?: string): Promise<void> {
  const proc = Bun.spawn(args, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Command failed (${code}): ${args.join(" ")}`);
  }
}

async function cloneSource(repoUrl: string, ref: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "mai-update-source-"));
  const repoDir = join(root, "repo");
  await runCommand([
    "git",
    "clone",
    "--depth",
    "1",
    "--branch",
    ref,
    repoUrl,
    repoDir,
  ]);
  return repoDir;
}

async function stageAndRun(args: string[]): Promise<number> {
  const root = await mkdtemp(join(tmpdir(), "mai-update-run-"));
  const staged = join(root, "update-installed.ts");
  await cp(import.meta.path, staged);

  const proc = Bun.spawn([process.execPath, staged, "--stage2", ...args], {
    cwd: homedir(),
    env: {
      ...process.env,
      MAI_UPDATE_ORIGINAL_CWD: process.cwd(),
    },
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return await proc.exited;
}

function helpText(): string {
  return `
Usage:
  bun ~/.codex/skills/mai/scripts/update-installed.ts
  bun ~/.codex/skills/mai/scripts/update-installed.ts --dry-run
  bun ~/.codex/skills/mai/scripts/update-installed.ts --all

Options:
      --codex-home <path>   Codex home directory (default: $CODEX_HOME or ~/.codex)
      --skills <list>       Comma-separated Mai skills to update (default: installed Mai skills, or mai)
      --all                 Update/install all Mai skill entries
      --repo-url <url>      Git repository URL (default: ${REPO_URL})
      --ref <ref>           Git ref/branch/tag (default: ${DEFAULT_REF})
      --source-root <path>  Use a local repository checkout instead of cloning
      --dry-run             Show what would be overwritten
  -h, --help                Show this help
`;
}

export async function runCli(args = Bun.argv.slice(2)): Promise<number> {
  const { values } = parseArgs({
    args,
    options: {
      "codex-home": { type: "string" },
      skills: { type: "string" },
      all: { type: "boolean", default: false },
      "repo-url": { type: "string", default: REPO_URL },
      ref: { type: "string", default: DEFAULT_REF },
      "source-root": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      stage2: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(helpText());
    return 0;
  }

  if (!values.stage2) {
    return await stageAndRun(args);
  }

  const originalCwd = process.env.MAI_UPDATE_ORIGINAL_CWD || process.cwd();
  const sourceRoot =
    typeof values["source-root"] === "string"
      ? toAbsoluteFrom(values["source-root"], originalCwd)
      : await cloneSource(
          String(values["repo-url"] || REPO_URL),
          String(values.ref || DEFAULT_REF),
        );
  const codexHome =
    typeof values["codex-home"] === "string"
      ? toAbsoluteFrom(values["codex-home"], originalCwd)
      : undefined;

  const plan = await updateInstalledSkills({
    sourceRoot,
    codexHome,
    skills: parseSkillList(
      typeof values.skills === "string" ? values.skills : undefined,
    ),
    all: values.all === true,
    dryRun: values["dry-run"] === true,
  });

  printPlan(plan, values["dry-run"] === true);
  if (!values["dry-run"]) {
    console.log("\nRestart Codex to pick up the updated skills.");
  }
  return 0;
}

if (import.meta.main) {
  runCli().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    },
  );
}
