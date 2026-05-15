import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  checkInstalledVersion,
  compareVersions,
  renderVersionCheck,
} from "./check-version";

async function tempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "mai-version-test-"));
}

describe("check installed version", () => {
  test("compares semantic versions without treating local-ahead as stale", () => {
    expect(compareVersions("1.1.4", "1.1.3")).toBe(1);
    expect(compareVersions("1.1.4", "1.1.4")).toBe(0);
    expect(compareVersions("1.1.3", "1.1.4")).toBe(-1);
    expect(compareVersions("1.2", "1.1.9")).toBe(1);
  });

  test("reports version and workflow markers", async () => {
    const root = await tempDir();
    await mkdir(join(root, "references"), { recursive: true });
    await writeFile(join(root, "VERSION"), "1.1.4\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );
    await writeFile(join(root, "LATEST_VERSION"), "1.1.4\n");

    const check = await checkInstalledVersion(root, { latestVersion: "1.1.4" });

    expect(check.version).toBe("1.1.4");
    expect(check.latestVersion).toBe("1.1.4");
    expect(check.updateAvailable).toBe(false);
    expect(check.hasDoubleReflectionWorkflow).toBe(true);
    expect(check.hasCliPreviewRule).toBe(true);
    expect(check.hasChineseFirstCopyRule).toBe(true);
    expect(check.hasShortWordLayoutRule).toBe(true);
    expect(renderVersionCheck(check)).toContain("Mai installed version: 1.1.4");
    expect(renderVersionCheck(check)).toContain("Latest GitHub version: 1.1.4");
    expect(renderVersionCheck(check)).toContain("Update available: no");
    expect(renderVersionCheck(check)).toContain(
      "Double-reflection workflow: yes",
    );
    expect(renderVersionCheck(check)).toContain("Chinese-first copy: yes");
    expect(renderVersionCheck(check)).toContain("Short-word layout: yes");
  });

  test("shell version check runs without Bun or Python", async () => {
    const root = await tempDir();
    const scriptDir = join(root, "scripts");
    await mkdir(join(root, "references"), { recursive: true });
    await mkdir(scriptDir, { recursive: true });
    await writeFile(join(root, "VERSION"), "1.1.4\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );

    await Bun.write(
      join(scriptDir, "check-version.sh"),
      await Bun.file(join(import.meta.dir, "check-version.sh")).text(),
    );

    const proc = Bun.spawn(["/bin/sh", join(scriptDir, "check-version.sh")], {
      env: {
        ...process.env,
        MAI_LATEST_VERSION: "1.1.4",
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(code).toBe(0);
    expect(`${stdout}\n${stderr}`).toContain("Mai installed version: 1.1.4");
    expect(stdout).toContain("Latest GitHub version:");
    expect(stdout).toContain("Latest GitHub version: 1.1.4");
    expect(stdout).toContain("Update available: no");
    expect(stdout).toContain("Double-reflection workflow: yes");
    expect(stdout).toContain("CLI-friendly preview: yes");
    expect(stdout).toContain("Chinese-first copy: yes");
    expect(stdout).toContain("Short-word layout: yes");
  });

  test("prompts a shell updater command when a newer version exists", async () => {
    const root = await tempDir();
    await mkdir(join(root, "references"), { recursive: true });
    await writeFile(join(root, "VERSION"), "1.1.2\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );

    const check = await checkInstalledVersion(root, { latestVersion: "1.1.4" });
    const rendered = renderVersionCheck(check);

    expect(check.updateAvailable).toBe(true);
    expect(rendered).toContain("Update available: yes");
    expect(rendered).toContain(
      "sh ~/.codex/skills/mai/scripts/update-installed.sh",
    );
    expect(rendered).not.toContain("bun ");
    expect(rendered).not.toContain("python");
  });

  test("does not prompt an update when the installed version is newer than GitHub", async () => {
    const root = await tempDir();
    await mkdir(join(root, "references"), { recursive: true });
    await writeFile(join(root, "VERSION"), "1.1.4\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );

    const check = await checkInstalledVersion(root, { latestVersion: "1.1.3" });
    const rendered = renderVersionCheck(check);

    expect(check.updateAvailable).toBe(false);
    expect(rendered).toContain("Update available: no");
    expect(rendered).not.toContain("update-installed.sh");
  });
});
