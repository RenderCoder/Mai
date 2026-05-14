# CLAUDE.md

## Repository Overview

This repository contains **Mai**, a short-name ecommerce copywriting skill family for Codex and Claude Code. `Mai` comes from the Chinese pinyin for “卖” (sell), meaning a compact selling-copy AI. It targets multilingual Amazon/AliExpress copy for clerks, designers, and ecommerce operators.

## Active Skill Family

The active entries are:

- `mai` — general router
- `mai-title` — titles and title A/B options
- `mai-copy` — listings, bullets, A+, taglines, image copy
- `mai-rich` — images, sketches, prototypes, detailed briefs, layout constraints
- `mai-product` — product info folder templates
- `mai-brief` — copy brief templates

Legacy directories `ecommerce-multilingual-copy`, `new-product`, and `new-requirement` remain for compatibility reference. New work should target `mai` unless the user explicitly asks for legacy behavior.

## Project Structure

```text
├── .claude-plugin/plugin.json          # Claude Code manifest; also used by Codex installer
├── skills/
│   ├── mai/
│   │   ├── SKILL.md                    # Main short entry
│   │   ├── agents/openai.yaml          # Codex UI metadata
│   │   ├── references/workflow.md      # Core confirmation-first workflow
│   │   ├── references/compliance-rules.md
│   │   ├── references/output-format.md
│   │   ├── references/copy-types.md
│   │   └── scripts/save-result.ts      # Skill-local save helper
│   ├── mai-title/
│   ├── mai-copy/
│   ├── mai-rich/
│   ├── mai-product/
│   └── mai-brief/
├── scripts/install-codex-skill.ts
├── scripts/validate-skill.ts
├── README.md / README.zh-CN.md
└── docs/development-context.md
```

## Key Rules

- `SKILL.md` is prompt content, not code.
- `skills/mai/references/workflow.md` is the source of truth for the confirmation-first workflow.
- `--product` is a product source, preferably a product folder. Folder sources must be read recursively; single Markdown files remain supported for compatibility.
- Copy generation must show results in chat first and wait for user confirmation before writing a document.
- Saved documents must include original context, scene understanding, decisions, final copy, count statistics, compliance checks, and manual review notes.
- For image/sketch/prototype copy, check character count, word count, line suggestions, and 2D layout risk.
- Support length presets: `minimal` / `medium` / `full`, mapped to 极简表达 / 中等 / 完整.
- If key parameters are missing, ask one numbered question at a time; users may reply with just the number.
- Codex installs copy only manifest-listed skill directories, so any runtime helper needed by a skill must live inside that skill directory.
- Product source folders should ignore generated `*_result_*.md` documents when collecting source context.

## Development

```bash
bun run validate
bun run test
bun run lint
bun run install:codex -- --dry-run
```

## Editing Guidance

- Add or remove active skills through `.claude-plugin/plugin.json`; the installer follows that list.
- Keep `agents/openai.yaml` aligned with each skill purpose.
- Keep README examples short and user-facing; the target audience is not engineering-heavy.
- If changing save behavior, update `skills/mai/references/workflow.md`, tests, and README together.
