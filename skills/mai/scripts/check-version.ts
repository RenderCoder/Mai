#!/usr/bin/env bun

/**
 * Print the installed Mai skill version and check for workflow markers.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export interface VersionCheck {
  skillDir: string;
  version: string;
  latestVersion: string;
  updateAvailable: boolean | null;
  hasDoubleReflectionWorkflow: boolean;
  hasCliPreviewRule: boolean;
  hasChineseFirstCopyRule: boolean;
  hasShortWordLayoutRule: boolean;
}

export interface VersionCheckOptions {
  latestVersion?: string;
  skipRemote?: boolean;
}

function findSkillDir(): string {
  return resolve(dirname(import.meta.dir));
}

async function readText(path: string): Promise<string> {
  if (!existsSync(path)) return "";
  return (await Bun.file(path).text()).trim();
}

export async function checkInstalledVersion(
  skillDir = findSkillDir(),
  opts: VersionCheckOptions = {},
): Promise<VersionCheck> {
  const version = (await readText(join(skillDir, "VERSION"))) || "unknown";
  const workflow = await readText(join(skillDir, "references", "workflow.md"));
  const latestVersion = opts.skipRemote
    ? "unknown"
    : opts.latestVersion || (await fetchLatestVersion());

  return {
    skillDir,
    version,
    latestVersion,
    updateAvailable:
      version === "unknown" || latestVersion === "unknown"
        ? null
        : compareVersions(latestVersion, version) > 0,
    hasDoubleReflectionWorkflow: workflow.includes("双反思产出硬约束"),
    hasCliPreviewRule: workflow.includes("命令行可读性硬约束"),
    hasChineseFirstCopyRule: workflow.includes("中文优先硬约束"),
    hasShortWordLayoutRule: workflow.includes("长单词排版硬约束"),
  };
}

export function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index++) {
    const leftValue = Number.isFinite(leftParts[index]) ? leftParts[index] : 0;
    const rightValue = Number.isFinite(rightParts[index])
      ? rightParts[index]
      : 0;
    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
}

async function fetchLatestVersion(): Promise<string> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/RenderCoder/Mai/main/skills/mai/VERSION",
    );
    if (!response.ok) return "unknown";
    return (await response.text()).trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export function renderVersionCheck(check: VersionCheck): string {
  const lines = [
    `Mai installed version: ${check.version}`,
    `Latest GitHub version: ${check.latestVersion}`,
    `Update available: ${
      check.updateAvailable === null
        ? "unknown"
        : check.updateAvailable
          ? "yes"
          : "no"
    }`,
    `Skill directory: ${check.skillDir}`,
    `Double-reflection workflow: ${check.hasDoubleReflectionWorkflow ? "yes" : "no"}`,
    `CLI-friendly preview: ${check.hasCliPreviewRule ? "yes" : "no"}`,
    `Chinese-first copy: ${check.hasChineseFirstCopyRule ? "yes" : "no"}`,
    `Short-word layout: ${check.hasShortWordLayoutRule ? "yes" : "no"}`,
  ];

  if (check.updateAvailable === true) {
    lines.push(
      "",
      "A newer Mai version is available.",
      "Exit Codex first, then run this in your system terminal:",
      "sh ~/.codex/skills/mai/scripts/update-installed.sh",
    );
  } else if (check.updateAvailable === null) {
    lines.push(
      "",
      "Could not confirm the latest GitHub version.",
      "To force an update, exit Codex first, then run:",
      "sh ~/.codex/skills/mai/scripts/update-installed.sh",
    );
  }

  return lines.join("\n");
}

export async function runCli(): Promise<number> {
  const skipRemote = Bun.argv.includes("--skip-remote");
  const check = await checkInstalledVersion(undefined, { skipRemote });
  console.log(renderVersionCheck(check));
  return check.version === "unknown" ? 1 : 0;
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
