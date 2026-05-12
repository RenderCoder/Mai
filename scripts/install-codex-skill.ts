#!/usr/bin/env bun

/**
 * Install this repository's skills into a Codex skills directory.
 *
 * The script copies the skill folders declared in .claude-plugin/plugin.json so
 * Claude Code and Codex stay aligned. It refuses to overwrite an existing skill
 * unless --force is supplied.
 */

import { existsSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";

const ROOT = resolve(import.meta.dir, "..");
const CODEX_HOME_ENV = "CODEX_HOME";

export interface InstallOptions {
  sourceRoot?: string;
  codexHome?: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface InstallPlanItem {
  skill: string;
  source: string;
  destination: string;
  exists: boolean;
  action: "copy" | "overwrite" | "skip-existing";
}

export interface InstallPlan {
  skillsDir: string;
  items: InstallPlanItem[];
}

interface PluginManifest {
  skills?: unknown;
}

function defaultCodexHome(): string {
  return process.env[CODEX_HOME_ENV] || join(homedir(), ".codex");
}

function toAbsolute(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return resolve(path);
}

async function readSkillNames(sourceRoot: string): Promise<string[]> {
  const manifestPath = join(sourceRoot, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Claude plugin manifest not found: ${manifestPath}`);
  }

  const manifest = (await Bun.file(manifestPath).json()) as PluginManifest;
  if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    throw new Error(
      "Claude plugin manifest must declare a non-empty skills array.",
    );
  }

  return manifest.skills.map((skill) => {
    if (typeof skill !== "string" || !skill.trim()) {
      throw new Error("Claude plugin manifest contains an invalid skill name.");
    }
    return skill;
  });
}

export async function createInstallPlan(
  options: InstallOptions = {},
): Promise<InstallPlan> {
  const sourceRoot = resolve(options.sourceRoot ?? ROOT);
  const codexHome = toAbsolute(options.codexHome ?? defaultCodexHome());
  const skillsDir = join(codexHome, "skills");
  const skillNames = await readSkillNames(sourceRoot);

  const items = skillNames.map((skill) => {
    const source = join(sourceRoot, "skills", skill);
    if (!existsSync(source)) {
      throw new Error(`Skill source directory not found: ${source}`);
    }

    const destination = join(skillsDir, basename(skill));
    const exists = existsSync(destination);
    return {
      skill,
      source,
      destination,
      exists,
      action: exists ? (options.force ? "overwrite" : "skip-existing") : "copy",
    } satisfies InstallPlanItem;
  });

  return { skillsDir, items };
}

export async function installCodexSkills(
  options: InstallOptions = {},
): Promise<InstallPlan> {
  const plan = await createInstallPlan(options);
  if (options.dryRun) return plan;

  await mkdir(plan.skillsDir, { recursive: true });

  for (const item of plan.items) {
    if (item.action === "skip-existing") continue;
    await cp(item.source, item.destination, {
      recursive: true,
      force: item.action === "overwrite",
    });
  }

  return plan;
}

function printPlan(plan: InstallPlan, dryRun: boolean): void {
  console.log(`${dryRun ? "Codex install dry run" : "Codex install"}:`);
  console.log(`Target skills directory: ${plan.skillsDir}`);

  for (const item of plan.items) {
    const label =
      item.action === "copy"
        ? "copy"
        : item.action === "overwrite"
          ? "overwrite"
          : "skip";
    console.log(`- ${label}: ${item.skill} -> ${item.destination}`);
  }
}

export async function runCli(args = Bun.argv.slice(2)): Promise<number> {
  const { values } = parseArgs({
    args,
    options: {
      "codex-home": { type: "string" },
      force: { type: "boolean", short: "f", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(`
Usage:
  bun run install:codex
  bun run install:codex -- --codex-home ~/.codex
  bun run install:codex -- --force

Options:
      --codex-home <path>  Codex home directory (default: $CODEX_HOME or ~/.codex)
  -f, --force              Overwrite files in existing installed skill folders
      --dry-run            Show what would be copied
  -h, --help               Show this help
`);
    return 0;
  }

  const plan = await installCodexSkills({
    codexHome:
      typeof values["codex-home"] === "string"
        ? values["codex-home"]
        : undefined,
    force: values.force === true,
    dryRun: values["dry-run"] === true,
  });

  printPlan(plan, values["dry-run"] === true);
  const skipped = plan.items.filter((item) => item.action === "skip-existing");
  if (skipped.length > 0) {
    console.log(
      "\nSome skills already exist. Re-run with --force if you want to replace them.",
    );
    return 2;
  }

  if (!values["dry-run"]) {
    console.log("\nRestart Codex to pick up the installed skills.");
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
