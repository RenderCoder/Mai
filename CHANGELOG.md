# Changelog

## Unreleased

### Added
- Skill version files and a `check-version.ts` helper for installed-version checks
- macOS-friendly version checker: `sh ~/.codex/skills/mai/scripts/check-version.sh`
- Short Mai skill family: `mai`, `mai-title`, `mai-copy`, `mai-rich`, `mai-product`, `mai-brief`
- Length presets for copy generation: `minimal`, `medium`, `full`
- Guided parameter confirmation with one numbered question at a time
- Codex skill support with `agents/openai.yaml` metadata for all skills
- One-command Codex installer: `bun run install:codex`
- macOS-friendly installed-skill updater: `sh ~/.codex/skills/mai/scripts/update-installed.sh`
- GitHub `$skill-installer` installation guidance for all Mai entries
- Skill-local result save helper so Codex installs keep save support
- Beginner-focused setup guides in English and Chinese
- Automated tests for Codex install planning and result path generation
- Automated tests for forced installed-skill update planning, dry-run behavior, copying, and backup overwrite flow
- Product-folder source support: `--product` can point to a folder and read all supported text subfiles recursively
- Release check command: `bun run release:check`
- Detailed Simplified Chinese user manual at `docs/user-manual.zh-CN.md`

### Changed
- Copy output now always includes Simplified Chinese first as the internal review baseline, even when users request only other target languages
- Copy generation now requires a three-round draft, reflection, and final rewrite flow before user confirmation
- Ambiguous key requirements now block generation and trigger one-at-a-time confirmation
- Chat previews now avoid Markdown tables; saved documents may still use tables
- New users are guided to short Mai entries instead of the old long `ecommerce-multilingual-copy` entry
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
