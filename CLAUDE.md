# CLAUDE.md

## Repository Overview

This repository contains **Codex skills and a Claude Code plugin** that generate multilingual e-commerce copy (CN/EN/DE/ES) using a 4-step reflective translation pipeline. It targets Amazon and AliExpress product listings.

## Project Structure

```
├── .claude-plugin/plugin.json          # Plugin manifest (required by Claude Code)
├── skills/
│   ├── ecommerce-multilingual-copy/
│   │   ├── SKILL.md                    # Main skill — the 4-step pipeline prompt
│   │   ├── agents/openai.yaml          # Codex UI metadata
│   │   ├── scripts/save-result.ts      # Skill-local result save helper
│   │   └── references/
│   │       ├── compliance-rules.md     # Forbidden words, platform rules, overrides
│   │       ├── output-format.md        # Table format specs for output
│   │       └── copy-types.md          # 6 copy type definitions
│   ├── new-product/
│   │   └── SKILL.md                    # Utility: create product knowledge base template
│   └── new-requirement/
│       └── SKILL.md                    # Utility: create requirement template (6 types)
├── docs/
│   ├── development-context.md          # Full dev context for AI-assisted maintenance
│   └── examples/
│       ├── WT702.md                    # Example product knowledge base
│       ├── _TEMPLATE.md               # Product template for users
│       └── sample-requirement.md       # Example requirement file
├── bin/save-result.ts                  # Wrapper for the skill-local save helper
├── scripts/install-codex-skill.ts      # One-command Codex installer
├── scripts/validate-skill.ts           # Plugin/skill structure validator
├── package.json                        # Bun project config
└── README.md / README.zh-CN.md         # Bilingual documentation
```

## Key Concepts

- **SKILL.md is a prompt, not code.** It gets loaded into Claude Code or Codex as instructions. Changes to SKILL.md change how the agent behaves when the skill is invoked.
- **Reference files are lazy-loaded.** SKILL.md links to them via relative Markdown links. The agent reads them only when needed per pipeline step.
- **Product files are external.** Users pass their own product knowledge base via `--product <path>`. The plugin ships no product data — only a template in `docs/examples/`.
- **Claude Code:** `$ARGUMENTS` contains the user's input after `/ecommerce-multilingual-copy`.
- **Codex:** users invoke the skill as `$ecommerce-multilingual-copy`, `$new-product`, or `$new-requirement`.
- **`$CLAUDE_SKILL_DIR`** resolves to `skills/ecommerce-multilingual-copy/` at runtime.

## Development Workflow

```bash
bun install                    # Install dev dependencies
bun run validate               # Check plugin structure integrity
bun test                       # Run helper-script tests
bun run install:codex          # Install skills into ~/.codex/skills
bun run dev                    # Launch Claude Code with this plugin loaded
# Then in Claude Code: /ecommerce-multilingual-copy --product docs/examples/WT702.md title
# After edits: /reload-plugins
```

## Editing Guidelines

### When modifying SKILL.md

- The 4-step pipeline (Step 1-4) is the core logic. Each step has a distinct role persona with forced perspective switches between steps.
- **Do not inline reference files** into SKILL.md. They are separate for token efficiency and user customizability.
- **Do not remove anti-sycophancy instructions** (the "forget your previous role" sections between steps). These are critical for output quality.
- Test changes with: `bun run validate`, `bun test`, and optionally `claude --plugin-dir .` then `/ecommerce-multilingual-copy --product docs/examples/WT702.md title`

### When modifying utility skills (new-product, new-requirement)

- `skills/new-product/SKILL.md` — Contains an inline product template. Keep it aligned with `docs/examples/_TEMPLATE.md`. If one changes, update the other.
- `skills/new-requirement/SKILL.md` — Contains 6 type-specific templates (image-copy, full-listing, title, bullets, a-plus, tagline). Adding a new copy type in `copy-types.md` requires adding a matching template here.
- Both skills support Claude Code `$ARGUMENTS` and Codex natural-language invocation. They create files with the current environment's write capability. They do not reference compliance-rules or output-format.
- Test with: `claude --plugin-dir .` then `/ecommerce-multilingual-copy:new-product TestProduct /tmp/` or `/ecommerce-multilingual-copy:new-requirement test-image /tmp/`

### When modifying reference files

- `compliance-rules.md` — Extreme caution: incorrect compliance rules could lead to policy violations on Amazon/AliExpress.
- `output-format.md` — Table format changes affect all copy types. Verify with multiple types after changes.
- `copy-types.md` — Adding a new copy type also requires updating SKILL.md's "simplified mode" section if the new type needs non-default pipeline behavior.

### When modifying TypeScript files

- Only `bin/` and `scripts/` contain TypeScript. These are dev utilities, not part of the core skill.
- Lint with `bun run lint`, format with `bun run format`.
- The skill-local `skills/ecommerce-multilingual-copy/scripts/save-result.ts` helper must stay usable after copying only the skill directory into Codex. `bin/save-result.ts` is only a repo-level wrapper.

## Commit Convention

```
<type>: <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`

## Testing

There is no automated test suite for the generated copy quality (it requires human judgment). Automated coverage protects structure, installer behavior, and save-path generation:

```bash
bun run validate    # Checks plugin.json, SKILL.md frontmatter, reference links, Codex metadata, file existence
bun test            # Checks installer and result-save helpers
```

For functional testing, invoke the skill manually and review the generated copy.
