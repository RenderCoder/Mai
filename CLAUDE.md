# CLAUDE.md

## Repository Overview

This is a **Claude Code Plugin** that generates multilingual e-commerce copy (CN/EN/DE/ES) using a 4-step reflective translation pipeline. It targets Amazon and AliExpress product listings.

## Project Structure

```
├── .claude-plugin/plugin.json          # Plugin manifest (required by Claude Code)
├── skills/ecommerce-multilingual-copy/
│   ├── SKILL.md                        # Main skill — the 4-step pipeline prompt
│   └── references/
│       ├── compliance-rules.md         # Forbidden words, platform rules, overrides
│       ├── output-format.md            # Table format specs for output
│       └── copy-types.md              # 6 copy type definitions
├── docs/
│   ├── development-context.md          # Full dev context for AI-assisted maintenance
│   └── examples/
│       ├── WT702.md                    # Example product knowledge base
│       ├── _TEMPLATE.md               # Product template for users
│       └── sample-requirement.md       # Example requirement file
├── bin/save-result.ts                  # Bun utility for saving results
├── scripts/validate-skill.ts           # Plugin structure validator
├── package.json                        # Bun project config
└── README.md / README.zh-CN.md         # Bilingual documentation
```

## Key Concepts

- **SKILL.md is a prompt, not code.** It gets loaded into Claude's context as instructions. Changes to SKILL.md change how Claude behaves when the skill is invoked.
- **Reference files are lazy-loaded.** SKILL.md links to them via relative Markdown links. Claude reads them only when needed per pipeline step.
- **Product files are external.** Users pass their own product knowledge base via `--product <path>`. The plugin ships no product data — only a template in `docs/examples/`.
- **`$ARGUMENTS`** contains the user's input after `/ecommerce-multilingual-copy`.
- **`$CLAUDE_SKILL_DIR`** resolves to `skills/ecommerce-multilingual-copy/` at runtime.

## Development Workflow

```bash
bun install                    # Install dev dependencies
bun run validate               # Check plugin structure integrity
bun run dev                    # Launch Claude Code with this plugin loaded
# Then in Claude Code: /ecommerce-multilingual-copy --product docs/examples/WT702.md title
# After edits: /reload-plugins
```

## Editing Guidelines

### When modifying SKILL.md

- The 4-step pipeline (Step 1-4) is the core logic. Each step has a distinct role persona with forced perspective switches between steps.
- **Do not inline reference files** into SKILL.md. They are separate for token efficiency and user customizability.
- **Do not remove anti-sycophancy instructions** (the "forget your previous role" sections between steps). These are critical for output quality.
- Test changes with: `claude --plugin-dir .` then `/ecommerce-multilingual-copy --product docs/examples/WT702.md title`

### When modifying reference files

- `compliance-rules.md` — Extreme caution: incorrect compliance rules could lead to policy violations on Amazon/AliExpress.
- `output-format.md` — Table format changes affect all copy types. Verify with multiple types after changes.
- `copy-types.md` — Adding a new copy type also requires updating SKILL.md's "simplified mode" section if the new type needs non-default pipeline behavior.

### When modifying TypeScript files

- Only `bin/` and `scripts/` contain TypeScript. These are dev utilities, not part of the core skill.
- Lint with `bun run lint`, format with `bun run format`.
- The `save-result.ts` script is a secondary mechanism — the primary auto-save is prompt-based in SKILL.md Step 4.5.

## Commit Convention

```
<type>: <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`

## Testing

There is no automated test suite for the skill output quality (it requires human judgment). Validation is structural:

```bash
bun run validate    # Checks plugin.json, SKILL.md frontmatter, reference links, file existence
```

For functional testing, invoke the skill manually and review the generated copy.
