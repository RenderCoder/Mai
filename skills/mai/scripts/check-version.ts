#!/usr/bin/env bun

/**
 * Print the installed Mai skill version and check for workflow markers.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export interface VersionCheck {
  skillDir: string;
  version: string;
  hasThreeRoundWorkflow: boolean;
  hasCliPreviewRule: boolean;
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
): Promise<VersionCheck> {
  const version = (await readText(join(skillDir, "VERSION"))) || "unknown";
  const workflow = await readText(join(skillDir, "references", "workflow.md"));

  return {
    skillDir,
    version,
    hasThreeRoundWorkflow: workflow.includes("三轮产出硬约束"),
    hasCliPreviewRule: workflow.includes("命令行可读性硬约束"),
  };
}

export function renderVersionCheck(check: VersionCheck): string {
  return [
    `Mai installed version: ${check.version}`,
    `Skill directory: ${check.skillDir}`,
    `Three-round workflow: ${check.hasThreeRoundWorkflow ? "yes" : "no"}`,
    `CLI-friendly preview: ${check.hasCliPreviewRule ? "yes" : "no"}`,
  ].join("\n");
}

export async function runCli(): Promise<number> {
  const check = await checkInstalledVersion();
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
