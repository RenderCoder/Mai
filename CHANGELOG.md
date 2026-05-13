# Changelog

## Unreleased

### Added
- Short Mai skill family: `mai`, `mai-title`, `mai-copy`, `mai-rich`, `mai-product`, `mai-brief`
- Length presets for copy generation: `minimal`, `medium`, `full`
- Guided parameter confirmation with one numbered question at a time
- Codex skill support with `agents/openai.yaml` metadata for all skills
- One-command Codex installer: `bun run install:codex`
- GitHub `$skill-installer` installation guidance for all Mai entries
- Skill-local result save helper so Codex installs keep save support
- Beginner-focused setup guides in English and Chinese
- Automated tests for Codex install planning and result path generation

### Changed
- New users are guided to short Mai entries instead of the old long `ecommerce-multilingual-copy` entry
- Docs now explain that Mai means “卖” / selling-copy AI
- Copy generation now shows results, understanding, language choices, count statistics, and risks in chat before saving
- Skill prompts now support both Claude Code slash commands and Codex `$skill` invocation
- Result documents are written only after user confirmation and include original context, decisions, final copy, counts, and review notes

## [1.0.0] - 2026-04-12

### Added
- Initial release as Claude Code plugin
- 4-step reflective translation pipeline (Draft -> Review -> Rewrite+BackTranslation -> Human Check)
- Support for 6 copy types: full-listing, title, bullets, a-plus, tagline, image-copy
- File-path-based product context (`--product <path>`)
- File-path-based requirement input (`--requirement <path>`)
- Auto-save results alongside requirement/product files
- Default languages: CN, EN, DE, ES (configurable via `--languages`)
- Amazon and AliExpress platform support
- Compliance rules engine with product-level overrides
- Back-translation verification for DE/ES
- Example product knowledge base (WT702 Smart Dual-Valve Watering Timer)
- Product knowledge base template for creating new products
- Development documentation in `docs/`
