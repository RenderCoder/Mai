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
    await writeFile(join(root, "VERSION"), "1.1.0\n");
    await writeFile(
      join(root, "references", "workflow.md"),
      "三轮产出硬约束\n命令行可读性硬约束\n",
    );

    const check = await checkInstalledVersion(root);

    expect(check.version).toBe("1.1.0");
    expect(check.hasThreeRoundWorkflow).toBe(true);
    expect(check.hasCliPreviewRule).toBe(true);
    expect(renderVersionCheck(check)).toContain("Mai installed version: 1.1.0");
  });
});
