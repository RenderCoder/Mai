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
  pass("skills/mai/references/workflow.md");
}

// 4. Check example files
console.log("\n4. Skill-local scripts");
const skillScriptFiles = [
  "scripts/save-result.ts",
  "scripts/collect-product-source.ts",
  "scripts/check-version.ts",
  "scripts/update-installed.ts",
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

// Summary
console.log(`\n${"─".repeat(50)}`);
if (errors === 0 && warnings === 0) {
  console.log("✅ All checks passed!");
} else {
  if (errors > 0) console.log(`❌ ${errors} error(s) found`);
  if (warnings > 0) console.log(`⚠️  ${warnings} warning(s) found`);
}
process.exit(errors > 0 ? 1 : 0);
