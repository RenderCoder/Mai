#!/usr/bin/env bun

/**
 * validate-skill.ts — 验证 Claude Code 插件和 Codex skill 结构完整性
 *
 * 检查项：
 * 1. plugin.json 存在且包含必要字段
 * 2. 声明的 skill 目录和 SKILL.md 存在
 * 3. SKILL.md 有有效的 frontmatter
 * 4. 所有 Markdown 引用的 reference 文件存在
 * 5. Codex agents/openai.yaml 和 skill-local scripts 存在
 * 6. docs/examples 示例文件存在
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
let errors = 0;
let warnings = 0;

interface PluginManifest {
  name?: unknown;
  version?: unknown;
  description?: unknown;
  skills?: unknown;
}

async function readPluginManifest(
  pluginJsonPath: string,
): Promise<PluginManifest | null> {
  if (!existsSync(pluginJsonPath)) return null;
  return (await Bun.file(pluginJsonPath).json()) as PluginManifest;
}

function pass(msg: string) {
  console.log(`  ✅ ${msg}`);
}

function fail(msg: string) {
  console.log(`  ❌ ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.log(`  ⚠️  ${msg}`);
  warnings++;
}

console.log("🔍 Validating Mai skills...\n");

// 1. Check plugin.json
console.log("1. Plugin manifest");
const pluginJsonPath = join(ROOT, ".claude-plugin", "plugin.json");
const pluginJson = await readPluginManifest(pluginJsonPath);
if (!pluginJson) {
  fail(".claude-plugin/plugin.json not found");
} else {
  if (!pluginJson.name) fail("plugin.json: missing 'name'");
  else pass(`plugin.json: name = "${pluginJson.name}"`);

  if (!pluginJson.version) fail("plugin.json: missing 'version'");
  else pass(`plugin.json: version = "${pluginJson.version}"`);

  if (!pluginJson.description) fail("plugin.json: missing 'description'");
  else pass("plugin.json: description present");

  if (
    !pluginJson.skills ||
    !Array.isArray(pluginJson.skills) ||
    pluginJson.skills.length === 0
  ) {
    fail("plugin.json: missing or empty 'skills' array");
  } else {
    pass(`plugin.json: skills = [${pluginJson.skills.join(", ")}]`);
  }
}

// 2. Check all skill directories and SKILL.md files
console.log("\n2. Skill files");
const pluginSkills = Array.isArray(pluginJson?.skills)
  ? pluginJson.skills.filter(
      (skill): skill is string => typeof skill === "string",
    )
  : ["mai"];

for (const skillName of pluginSkills) {
  const sDir = join(ROOT, "skills", skillName);
  if (!existsSync(sDir)) {
    fail(`skills/${skillName}/ directory not found`);
    continue;
  }
  pass(`skills/${skillName}/ directory exists`);

  const versionPath = join(sDir, "VERSION");
  if (!existsSync(versionPath)) {
    fail(`skills/${skillName}/VERSION not found`);
  } else {
    const version = (await Bun.file(versionPath).text()).trim();
    if (!version) fail(`skills/${skillName}/VERSION is empty`);
    else pass(`skills/${skillName}/VERSION = ${version}`);
  }

  const sMdPath = join(sDir, "SKILL.md");
  if (!existsSync(sMdPath)) {
    fail(`skills/${skillName}/SKILL.md not found`);
    continue;
  }

  const content = await Bun.file(sMdPath).text();

  // Check frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    fail(`skills/${skillName}/SKILL.md: no valid frontmatter found`);
  } else {
    const fm = fmMatch[1];
    if (!fm.includes("name:"))
      fail(`skills/${skillName}/SKILL.md: frontmatter missing 'name'`);
    else pass(`skills/${skillName}/SKILL.md: frontmatter has 'name'`);

    if (!fm.includes("description:"))
      fail(`skills/${skillName}/SKILL.md: frontmatter missing 'description'`);
    else pass(`skills/${skillName}/SKILL.md: frontmatter has 'description'`);

    if (!fm.includes("argument-hint:"))
      warn(`skills/${skillName}/SKILL.md: frontmatter missing 'argument-hint'`);
    else pass(`skills/${skillName}/SKILL.md: frontmatter has 'argument-hint'`);
  }

  // Check reference links (only for skills that have them)
  const linkPattern = /\[.*?\]\((references\/[^)]+)\)/g;
  let match: RegExpExecArray | null = linkPattern.exec(content);
  while (match !== null) {
    const refPath = join(sDir, match[1]);
    if (!existsSync(refPath)) {
      fail(
        `skills/${skillName}/SKILL.md references ${match[1]} but file not found`,
      );
    } else {
      pass(`Reference link resolves: ${match[1]}`);
    }
    match = linkPattern.exec(content);
  }

  const openAiYamlPath = join(sDir, "agents", "openai.yaml");
  if (!existsSync(openAiYamlPath)) {
    warn(`skills/${skillName}/agents/openai.yaml not found`);
  } else {
    const openAiYaml = await Bun.file(openAiYamlPath).text();
    if (!openAiYaml.includes("display_name:")) {
      fail(`skills/${skillName}/agents/openai.yaml: missing display_name`);
    } else if (!openAiYaml.includes("default_prompt:")) {
      fail(`skills/${skillName}/agents/openai.yaml: missing default_prompt`);
    } else {
      pass(`skills/${skillName}/agents/openai.yaml`);
    }
  }
}

// 3. Check reference files
console.log("\n3. Reference files");
const refFiles = ["compliance-rules.md", "output-format.md", "copy-types.md"];
for (const file of refFiles) {
  const path = join(ROOT, "skills", "mai", "references", file);
  if (!existsSync(path)) {
    fail(`skills/mai/references/${file} not found`);
  } else {
    const stat = Bun.file(path);
    pass(`skills/mai/references/${file} (${stat.size} bytes)`);
  }
}
const workflowPath = join(ROOT, "skills", "mai", "references", "workflow.md");
if (!existsSync(workflowPath)) {
  fail("skills/mai/references/workflow.md not found");
} else {
  const workflow = await Bun.file(workflowPath).text();
  pass("skills/mai/references/workflow.md");
  if (!workflow.includes("双反思产出硬约束")) {
    fail("skills/mai/references/workflow.md: missing 双反思产出硬约束");
  } else {
    pass("workflow marker: 双反思产出硬约束");
  }
  if (!workflow.includes("命令行可读性硬约束")) {
    fail("skills/mai/references/workflow.md: missing 命令行可读性硬约束");
  } else {
    pass("workflow marker: 命令行可读性硬约束");
  }
  if (!workflow.includes("中文优先硬约束")) {
    fail("skills/mai/references/workflow.md: missing 中文优先硬约束");
  } else {
    pass("workflow marker: 中文优先硬约束");
  }
  if (!workflow.includes("长单词排版硬约束")) {
    fail("skills/mai/references/workflow.md: missing 长单词排版硬约束");
  } else {
    pass("workflow marker: 长单词排版硬约束");
  }
  if (!workflow.includes("版本检查与更新引导")) {
    fail("skills/mai/references/workflow.md: missing 版本检查与更新引导");
  } else {
    pass("workflow marker: 版本检查与更新引导");
  }
  if (!workflow.includes("外语回译核对硬约束")) {
    fail("skills/mai/references/workflow.md: missing 外语回译核对硬约束");
  } else {
    pass("workflow marker: 外语回译核对硬约束");
  }
  if (!workflow.includes("产品目录层级不清楚")) {
    fail(
      "skills/mai/references/workflow.md: missing product directory ambiguity gate",
    );
  } else {
    pass("workflow marker: product directory ambiguity gate");
  }
  if (!workflow.includes("写入文件时禁止把最终文案只写成项目符号列表")) {
    fail("skills/mai/references/workflow.md: missing saved table hard rule");
  } else {
    pass("workflow marker: saved table hard rule");
  }
}

const outputFormatPath = join(
  ROOT,
  "skills",
  "mai",
  "references",
  "output-format.md",
);
if (existsSync(outputFormatPath)) {
  const outputFormat = await Bun.file(outputFormatPath).text();
  if (!outputFormat.includes("最终文案必须用 Markdown 表格")) {
    fail(
      "skills/mai/references/output-format.md: missing final-copy table rule",
    );
  } else {
    pass("output-format marker: final-copy table rule");
  }
  if (!outputFormat.includes("外语回译核对必须用 Markdown 表格")) {
    fail(
      "skills/mai/references/output-format.md: missing back-translation table rule",
    );
  } else {
    pass("output-format marker: back-translation table rule");
  }
  if (!outputFormat.includes("数量统计必须用 Markdown 表格")) {
    fail("skills/mai/references/output-format.md: missing count table rule");
  } else {
    pass("output-format marker: count table rule");
  }
}

// 4. Check example files
console.log("\n4. Skill-local scripts");
const skillScriptFiles = [
  "scripts/save-result.ts",
  "scripts/collect-product-source.ts",
  "scripts/check-version.ts",
  "scripts/check-version.sh",
  "scripts/update-installed.ts",
  "scripts/update-installed.sh",
];
for (const file of skillScriptFiles) {
  const path = join(ROOT, "skills", "mai", file);
  if (!existsSync(path)) {
    fail(`skills/mai/${file} not found`);
  } else {
    pass(`skills/mai/${file}`);
  }
}

// 5. Check example files
console.log("\n5. Example files");
const exampleFiles = ["WT702.md", "_TEMPLATE.md", "sample-requirement.md"];
for (const file of exampleFiles) {
  const path = join(ROOT, "docs", "examples", file);
  if (!existsSync(path)) {
    fail(`docs/examples/${file} not found`);
  } else {
    pass(`docs/examples/${file}`);
  }
}

// 6. Check other project files
console.log("\n6. Project files");
const projectFiles = [
  "package.json",
  "tsconfig.json",
  "biome.json",
  "LICENSE",
  "README.md",
  ".gitignore",
];
for (const file of projectFiles) {
  const path = join(ROOT, file);
  if (!existsSync(path)) {
    warn(`${file} not found`);
  } else {
    pass(file);
  }
}

// 7. Check user-facing docs keep the single-entry path.
console.log("\n7. User-facing single-entry guidance");
const userFacingFiles = [
  "README.md",
  "README.zh-CN.md",
  "docs/user-manual.zh-CN.md",
  "skills/mai/SKILL.md",
];
const legacyEntryPattern =
  /\$(mai-title|mai-copy|mai-rich|mai-product|mai-brief)|\/(mai-title|mai-copy|mai-rich|mai-product|mai-brief)|tree\/main\/skills\/(mai-title|mai-copy|mai-rich|mai-product|mai-brief)/;
for (const file of userFacingFiles) {
  const path = join(ROOT, file);
  if (!existsSync(path)) {
    fail(`${file} not found for single-entry check`);
    continue;
  }

  const content = await Bun.file(path).text();
  if (legacyEntryPattern.test(content)) {
    fail(`${file}: contains user-facing legacy Mai subskill entry`);
  } else {
    pass(`${file}: uses only $mai as the user-facing entry`);
  }
}

const manualPath = join(ROOT, "docs", "user-manual.zh-CN.md");
if (existsSync(manualPath)) {
  const manual = await Bun.file(manualPath).text();
  if (!manual.includes("在产品资料根目录打开 Codex")) {
    fail("docs/user-manual.zh-CN.md: missing product-root startup guidance");
  } else {
    pass("user manual marker: product-root startup guidance");
  }
  if (!manual.includes("每次都明确写出产品目录")) {
    fail(
      "docs/user-manual.zh-CN.md: missing explicit product directory guidance",
    );
  } else {
    pass("user manual marker: explicit product directory guidance");
  }
  if (!manual.includes("外语回译核对")) {
    fail("docs/user-manual.zh-CN.md: missing back-translation guidance");
  } else {
    pass("user manual marker: back-translation guidance");
  }
}

// Summary
console.log(`\n${"─".repeat(50)}`);
if (errors === 0 && warnings === 0) {
  console.log("✅ All checks passed!");
} else {
  if (errors > 0) console.log(`❌ ${errors} error(s) found`);
  if (warnings > 0) console.log(`⚠️  ${warnings} warning(s) found`);
}
process.exit(errors > 0 ? 1 : 0);
