# Changelog

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
