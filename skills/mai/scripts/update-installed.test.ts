import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createUpdatePlan, updateInstalledSkills } from "./update-installed";

async function tempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "mai-update-test-"));
}

async function createSkill(
  sourceRoot: string,
  skill: string,
  marker: string,
): Promise<void> {
  const dir = join(sourceRoot, "skills", skill);
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "SKILL.md"),
    `---\nname: ${skill}\n---\n${marker}\n`,
  );
  await writeFile(join(dir, "VERSION"), "1.1.1\n");
}

async function createSourceRoot(skills = ["mai"]): Promise<string> {
  const root = await tempDir();
  for (const skill of skills) {
    await createSkill(root, skill, `new ${skill}`);
  }
  return root;
}

describe("createUpdatePlan", () => {
  test("defaults to mai when no Mai skills are installed", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();

    const plan = createUpdatePlan({ sourceRoot, codexHome });

    expect(plan.skillsDir).toBe(join(codexHome, "skills"));
    expect(plan.items.map((item) => item.skill)).toEqual(["mai"]);
    expect(plan.items[0].action).toBe("copy");
  });

  test("updates only already installed Mai skills by default", async () => {
    const sourceRoot = await createSourceRoot(["mai", "mai-title", "mai-copy"]);
    const codexHome = await tempDir();
    await mkdir(join(codexHome, "skills", "mai"), { recursive: true });
    await mkdir(join(codexHome, "skills", "mai-copy"), { recursive: true });

    const plan = createUpdatePlan({ sourceRoot, codexHome });

    expect(plan.items.map((item) => item.skill)).toEqual(["mai", "mai-copy"]);
    expect(plan.items.map((item) => item.action)).toEqual([
      "overwrite",
      "overwrite",
    ]);
  });

  test("all mode plans every Mai skill", async () => {
    const skills = [
      "mai",
      "mai-title",
      "mai-copy",
      "mai-rich",
      "mai-product",
      "mai-brief",
    ];
    const sourceRoot = await createSourceRoot(skills);
    const codexHome = await tempDir();

    const plan = createUpdatePlan({ sourceRoot, codexHome, all: true });

    expect(plan.items.map((item) => item.skill)).toEqual(skills);
  });

  test("rejects unsupported skill names", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();

    expect(() =>
      createUpdatePlan({ sourceRoot, codexHome, skills: ["other"] }),
    ).toThrow("Unsupported Mai skill");
  });

  test("requires SKILL.md and VERSION in source skills", async () => {
    const sourceRoot = await tempDir();
    await mkdir(join(sourceRoot, "skills", "mai"), { recursive: true });
    await writeFile(join(sourceRoot, "skills", "mai", "SKILL.md"), "mai\n");
    const codexHome = await tempDir();

    expect(() => createUpdatePlan({ sourceRoot, codexHome })).toThrow(
      "VERSION not found",
    );
  });
});

describe("updateInstalledSkills", () => {
  test("dry-run does not create destination or backup directories", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();

    const plan = await updateInstalledSkills({
      sourceRoot,
      codexHome,
      dryRun: true,
    });

    expect(plan.items[0].action).toBe("copy");
    expect(existsSync(join(codexHome, "skills"))).toBe(false);
  });

  test("copies a fresh skill into the user Codex skills directory", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();

    await updateInstalledSkills({ sourceRoot, codexHome });

    const installed = Bun.file(join(codexHome, "skills", "mai", "SKILL.md"));
    expect(await installed.exists()).toBe(true);
    expect(await installed.text()).toContain("new mai");
  });

  test("moves existing skill to backup before copying the new version", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();
    const oldSkill = join(codexHome, "skills", "mai");
    await mkdir(oldSkill, { recursive: true });
    await writeFile(join(oldSkill, "SKILL.md"), "old mai\n");
    await writeFile(join(oldSkill, "VERSION"), "0.1.0\n");

    const plan = await updateInstalledSkills({
      sourceRoot,
      codexHome,
      now: new Date("2026-05-14T00:00:00.000Z"),
    });

    const installed = await Bun.file(join(oldSkill, "SKILL.md")).text();
    const backupPath = plan.items[0].backup;

    expect(installed).toContain("new mai");
    expect(backupPath).toBe(
      join(
        codexHome,
        "skills",
        ".mai-update-backups",
        "2026-05-14T00-00-00-000Z",
        "mai",
      ),
    );
    expect(backupPath).toBeDefined();
    expect(await Bun.file(join(backupPath as string, "SKILL.md")).text()).toBe(
      "old mai\n",
    );
  });

  test("CLI stages itself before updating the launched skill directory", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();
    const oldSkill = join(codexHome, "skills", "mai");
    await mkdir(oldSkill, { recursive: true });
    await writeFile(join(oldSkill, "SKILL.md"), "old mai\n");
    await writeFile(join(oldSkill, "VERSION"), "0.1.0\n");

    const proc = Bun.spawn(
      [
        process.execPath,
        join(import.meta.dir, "update-installed.ts"),
        "--source-root",
        ".",
        "--codex-home",
        codexHome,
      ],
      {
        cwd: sourceRoot,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(`${stdout}\n${stderr}`).toContain("overwrite: mai");
    expect(stdout).toContain("Mai update:");
    expect(stdout).not.toContain("Mai update dry run");
    expect(code).toBe(0);
    expect(await Bun.file(join(oldSkill, "SKILL.md")).text()).toContain(
      "new mai",
    );
    expect(existsSync(join(codexHome, "skills", ".mai-update-backups"))).toBe(
      true,
    );
  });

  test("macOS shell updater runs without Bun or Python for local source updates", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();
    const oldSkill = join(codexHome, "skills", "mai");
    await mkdir(oldSkill, { recursive: true });
    await writeFile(join(oldSkill, "SKILL.md"), "old mai\n");
    await writeFile(join(oldSkill, "VERSION"), "0.1.0\n");

    const proc = Bun.spawn(
      [
        "/bin/sh",
        join(import.meta.dir, "update-installed.sh"),
        "--source-root",
        ".",
        "--codex-home",
        codexHome,
      ],
      {
        cwd: sourceRoot,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(`${stdout}\n${stderr}`).toContain("overwrite: mai");
    expect(code).toBe(0);
    expect(await Bun.file(join(oldSkill, "SKILL.md")).text()).toContain(
      "new mai",
    );
    expect(existsSync(join(codexHome, "skills", ".mai-update-backups"))).toBe(
      true,
    );
  });

  test("macOS shell updater dry-run preserves existing installed skills", async () => {
    const sourceRoot = await createSourceRoot(["mai"]);
    const codexHome = await tempDir();
    const oldSkill = join(codexHome, "skills", "mai");
    await mkdir(oldSkill, { recursive: true });
    await writeFile(join(oldSkill, "SKILL.md"), "old mai\n");
    await writeFile(join(oldSkill, "VERSION"), "0.1.0\n");

    const proc = Bun.spawn(
      [
        "/bin/sh",
        join(import.meta.dir, "update-installed.sh"),
        "--source-root",
        ".",
        "--codex-home",
        codexHome,
        "--dry-run",
      ],
      {
        cwd: sourceRoot,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(`${stdout}\n${stderr}`).toContain("Mai update dry run");
    expect(code).toBe(0);
    expect(await Bun.file(join(oldSkill, "SKILL.md")).text()).toBe("old mai\n");
    expect(existsSync(join(codexHome, "skills", ".mai-update-backups"))).toBe(
      false,
    );
  });

  test("macOS shell updater all mode installs every Mai entry", async () => {
    const skills = [
      "mai",
      "mai-title",
      "mai-copy",
      "mai-rich",
      "mai-product",
      "mai-brief",
    ];
    const sourceRoot = await createSourceRoot(skills);
    const codexHome = await tempDir();

    const proc = Bun.spawn(
      [
        "/bin/sh",
        join(import.meta.dir, "update-installed.sh"),
        "--source-root",
        ".",
        "--codex-home",
        codexHome,
        "--all",
      ],
      {
        cwd: sourceRoot,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(code).toBe(0);
    expect(`${stdout}\n${stderr}`).toContain("copy: mai-brief");
    for (const skill of skills) {
      expect(
        await Bun.file(join(codexHome, "skills", skill, "SKILL.md")).exists(),
      ).toBe(true);
    }
  });
});
