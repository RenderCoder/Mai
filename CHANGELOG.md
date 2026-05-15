# Changelog

## [1.1.5] - 2026-05-15

### Added
- User documentation now includes a shell uninstall command for removing the user-level `$mai` skill directory.

## [1.1.4] - 2026-05-15

### Added
- Product-directory onboarding now tells new users to open Codex from a product root folder and explicitly pass the target product subdirectory with `$mai --product ...`
- Foreign-language final copy now requires a Simplified Chinese back-translation check for every non-Chinese target language
- Saved Markdown result documents now require tables for final copy, back-translation checks, and count statistics
- Single user-facing `$mai` install and usage path; title, listing, rich image copy, templates, version checks, and update guidance are now covered by the main skill
- Version checks now compare the installed skill with the latest GitHub `VERSION` and tell users to exit Codex before running the shell updater when an update is available
- Skill version files and a `check-version.ts` helper for installed-version checks
- macOS-friendly version checker: `sh ~/.codex/skills/mai/scripts/check-version.sh`
- Historical Mai shortcut skill files remain for compatibility, but new users are guided to `$mai` only
- Length presets for copy generation: `minimal`, `medium`, `full`
- Guided parameter confirmation with one numbered question at a time
- Codex skill support with `agents/openai.yaml` metadata for all skills
- One-command Codex installer: `bun run install:codex`
- macOS-friendly installed-skill updater: `sh ~/.codex/skills/mai/scripts/update-installed.sh`
- GitHub `$skill-installer` installation guidance for the main `$mai` skill
- Skill-local result save helper so Codex installs keep save support
- Beginner-focused setup guides in English and Chinese
- Automated tests for Codex install planning and result path generation
- Automated tests for forced installed-skill update planning, dry-run behavior, copying, and backup overwrite flow
- Product-folder source support: `--product` can point to a folder and read all supported text subfiles recursively
- Release check command: `bun run release:check`
- Detailed Simplified Chinese user manual at `docs/user-manual.zh-CN.md`

### Changed
- Workflow validation now checks product-directory ambiguity handling, back-translation, and saved-table hard rules
- Plugin manifest now installs only the main `mai` skill for normal Codex setup
- User docs now prioritize shell-only version/update commands and avoid requiring Bun, Python, npm, or a developer environment
- Copy generation now uses a five-step double-reflection flow: draft, first reflection, revised version, second reflection, final version
- Layout-sensitive multilingual copy now requires longest-word checks and short-word alternatives for languages such as German
- Copy output now always includes Simplified Chinese first as the internal review baseline, even when users request only other target languages
- Ambiguous key requirements now block generation and trigger one-at-a-time confirmation
- Chat previews now avoid Markdown tables; saved documents may still use tables
- New users are guided to the single `$mai` entry instead of the old long `ecommerce-multilingual-copy` entry or historical shortcut entries
- Docs now explain that Mai means “卖” / selling-copy AI
- Copy generation now shows results, understanding, language choices, count statistics, and risks in chat before saving
- Skill prompts now support both Claude Code slash commands and Codex `$skill` invocation
- Result documents are written only after user confirmation and include original context, decisions, final copy, counts, and review notes
- `mai-product` now creates a product source folder with `product.md` instead of assuming all product info lives in one Markdown file
- Default communication language is now explicitly constrained to Simplified Chinese for context, explanations, questions, reviews, risks, and save prompts

## [1.0.0] - 2026-04-12

### Added
- Initial release as Claude Code plugin
- 4-step reflective translation pipeline (Draft -> Review -> Rewrite+BackTranslation -> Human Check)
- Support for 6 copy types: full-listing, title, bullets, a-plus, tagline, image-copy
- Folder-based product context (`--product <folder-or-file>`)
- File-path-based requirement input (`--requirement <path>`)
- Auto-save results alongside requirement/product folders
- Default languages: CN, EN, DE, ES (configurable via `--languages`)
- Amazon and AliExpress platform support
- Compliance rules engine with product-level overrides
- Back-translation verification for DE/ES
- Example product knowledge base (WT702 Smart Dual-Valve Watering Timer)
- Product knowledge base template for creating new products
- Development documentation in `docs/`
