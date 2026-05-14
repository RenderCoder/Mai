import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { checkInstalledVersion, renderVersionCheck } from "./check-version";

async function tempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "mai-version-test-"));
}

describe("check installed version", () => {
  test("reports version and workflow markers", async () => {
    const root = await tempDir();
    await mkdir(join(root, "references"), { recursive: true });
    await writeFile(join(root, "VERSION"), "1.1.2\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );

    const check = await checkInstalledVersion(root);

    expect(check.version).toBe("1.1.2");
    expect(check.hasDoubleReflectionWorkflow).toBe(true);
    expect(check.hasCliPreviewRule).toBe(true);
    expect(check.hasChineseFirstCopyRule).toBe(true);
    expect(check.hasShortWordLayoutRule).toBe(true);
    expect(renderVersionCheck(check)).toContain("Mai installed version: 1.1.2");
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
    await writeFile(join(root, "VERSION"), "1.1.2\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "双反思产出硬约束\n命令行可读性硬约束\n中文优先硬约束\n长单词排版硬约束\n",
    );

    await Bun.write(
      join(scriptDir, "check-version.sh"),
      await Bun.file(join(import.meta.dir, "check-version.sh")).text(),
    );

    const proc = Bun.spawn(["/bin/sh", join(scriptDir, "check-version.sh")], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(code).toBe(0);
    expect(`${stdout}\n${stderr}`).toContain("Mai installed version: 1.1.2");
    expect(stdout).toContain("Double-reflection workflow: yes");
    expect(stdout).toContain("CLI-friendly preview: yes");
    expect(stdout).toContain("Chinese-first copy: yes");
    expect(stdout).toContain("Short-word layout: yes");
  });
});
