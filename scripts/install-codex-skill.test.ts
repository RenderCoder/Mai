import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createInstallPlan, installCodexSkills } from "./install-codex-skill";

async function tempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "emc-install-test-"));
}

async function createFixture(): Promise<string> {
  const root = await tempDir();
  await mkdir(join(root, ".claude-plugin"), { recursive: true });
  await mkdir(join(root, "skills", "alpha"), { recursive: true });
  await mkdir(join(root, "skills", "beta"), { recursive: true });

  await writeFile(
    join(root, ".claude-plugin", "plugin.json"),
    JSON.stringify({ skills: ["alpha", "beta"] }),
  );
  await writeFile(
    join(root, "skills", "alpha", "SKILL.md"),
    "---\nname: alpha\n---\n",
  );
  await writeFile(
    join(root, "skills", "beta", "SKILL.md"),
    "---\nname: beta\n---\n",
  );
  return root;
}

async function readRealManifestSkills(): Promise<string[]> {
  const manifest = await Bun.file(".claude-plugin/plugin.json").json();
  return manifest.skills as string[];
}

describe("createInstallPlan", () => {
  test("plans each manifest skill under CODEX_HOME/skills", async () => {
    const sourceRoot = await createFixture();
    const codexHome = await tempDir();

    const plan = await createInstallPlan({ sourceRoot, codexHome });

    expect(plan.skillsDir).toBe(join(codexHome, "skills"));
    expect(plan.items.map((item) => item.skill)).toEqual(["alpha", "beta"]);
    expect(plan.items.map((item) => item.action)).toEqual(["copy", "copy"]);
  });

  test("skips existing skills unless force is true", async () => {
    const sourceRoot = await createFixture();
    const codexHome = await tempDir();
    await mkdir(join(codexHome, "skills", "alpha"), { recursive: true });

    const defaultPlan = await createInstallPlan({ sourceRoot, codexHome });
    const forcePlan = await createInstallPlan({
      sourceRoot,
      codexHome,
      force: true,
    });

    expect(
      defaultPlan.items.find((item) => item.skill === "alpha")?.action,
    ).toBe("skip-existing");
    expect(forcePlan.items.find((item) => item.skill === "alpha")?.action).toBe(
      "overwrite",
    );
  });

  test("real manifest installs only the main Mai entry", async () => {
    const codexHome = await tempDir();
    const plan = await createInstallPlan({ codexHome });
    const manifestSkills = await readRealManifestSkills();

    expect(plan.items.map((item) => item.skill)).toEqual(manifestSkills);
    expect(manifestSkills).toEqual(["mai"]);
    expect(manifestSkills).not.toContain("ecommerce-multilingual-copy");
    expect(manifestSkills).not.toContain("new-product");
    expect(manifestSkills).not.toContain("new-requirement");
  });
});

describe("installCodexSkills", () => {
  test("copies skill directories", async () => {
    const sourceRoot = await createFixture();
    const codexHome = await tempDir();

    await installCodexSkills({ sourceRoot, codexHome });

    const installed = Bun.file(join(codexHome, "skills", "alpha", "SKILL.md"));
    expect(await installed.exists()).toBe(true);
    expect(await installed.text()).toContain("name: alpha");
  });

  test("dry-run does not create the destination directory", async () => {
    const sourceRoot = await createFixture();
    const codexHome = await tempDir();
    const destination = join(codexHome, "skills");

    await installCodexSkills({ sourceRoot, codexHome, dryRun: true });

    expect(existsSync(destination)).toBe(false);
  });
});
