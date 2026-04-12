# ecommerce-multilingual-copy

A Claude Code plugin that generates multilingual e-commerce copy (CN/EN/DE/ES) using a 4-step reflective translation pipeline.

> **一键生成亚马逊/速卖通多语言电商文案的 Claude Code 插件。**

## Features

- **4-Step Reflective Pipeline**: Draft -> Ruthless Review -> Final Rewrite + Back-Translation -> Human Verification
- **6 Copy Types**: Full Listing, Title, Bullets, A+ Content, Tagline, Image Copy
- **4 Languages by Default**: Chinese, English, German, Spanish (configurable)
- **File-Based Workflow**: Product knowledge and requirements as file paths — easy to manage and version
- **Auto-Save Results**: Output automatically saved alongside your requirement/product files
- **Compliance Engine**: Built-in forbidden words, platform rules, and product-level overrides
- **Back-Translation QA**: German/Spanish translated back to Chinese for semantic verification

## Installation

### From GitHub

```bash
npx skills add RenderCoder/ecommerce-multilingual-copy@ecommerce-multilingual-copy
```

### Local Development

```bash
git clone https://github.com/RenderCoder/ecommerce-multilingual-copy.git
cd ecommerce-multilingual-copy
bun install
bun run dev  # or: claude --plugin-dir .
```

## Quick Start

### 1. Create a Product Knowledge Base

Copy the template from `docs/examples/_TEMPLATE.md` and fill in your product details:

```bash
cp docs/examples/_TEMPLATE.md ~/my-products/MyProduct.md
# Edit the file with your product specs, selling points, SEO keywords, etc.
```

### 2. Run the Skill

```bash
# Full listing (all 8 fields)
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md

# Title only (simplified mode)
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md title

# With a requirement file (e.g., image copy brief)
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md --requirement ~/tasks/image-brief.md

# Custom languages
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md --languages CN,EN,FR
```

### 3. Get Results

The skill outputs a Markdown table you can directly paste into Excel, Google Sheets, or Figma. If you used `--requirement` or `--product`, results are also auto-saved as:

```
~/tasks/image-brief_result_20260412.md
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--product <path>` | Yes | Path to product knowledge base file |
| `--requirement <path>` | No | Path to requirement/brief file |
| `copy-type` | No | `full-listing` (default), `title`, `bullets`, `a-plus`, `tagline`, `image-copy` |
| `--languages XX,XX` | No | Override languages (default: `CN,EN,DE,ES`) |
| `--platform` | No | `amazon` (default) or `aliexpress` |

## Copy Types

| Type | Output Fields | Pipeline |
|------|--------------|----------|
| `full-listing` | Title + Subtitle + 5 Bullets + Short Description | Full 4-step |
| `title` | Title + Subtitle | Simplified |
| `bullets` | 5 Bullet Points | Full (condensed back-translation) |
| `a-plus` | Banner + 4 Feature Modules | Full 4-step |
| `tagline` | 1-2 line creative copy | Simplified |
| `image-copy` | Headline + Subline + Tag Copy | Full 4-step |

## Product Knowledge Base Format

See `docs/examples/_TEMPLATE.md` for the full template. Key sections:

- **Basic Info**: Brand, model, category, target markets
- **Core Specs**: Technical specifications table
- **Selling Points**: Prioritized list of differentiators
- **SEO Keywords**: Per-language keyword groups (EN/DE/ES)
- **Compliance Overrides**: Product-specific allowed/forbidden claims
- **Mandatory Terms**: Terms that must appear in all copy
- **Unit Localization**: GAL for North America, L for Europe

## How the Pipeline Works

1. **Draft Generation** — Expert copywriter role creates initial multilingual table
2. **Ruthless Review** — Forced perspective switch to a harsh editor role that finds every flaw
3. **Final Rewrite + Back-Translation** — Master copywriter absorbs feedback; DE/ES back-translated to CN for verification
4. **Human Handoff** — Clean tables, back-translation check, execution summary, changelog

## Development

```bash
bun install                # Install dev dependencies
bun run dev                # Launch Claude Code with this plugin
bun run validate           # Check plugin structure integrity
bun run lint               # Lint TypeScript files
bun run format             # Format TypeScript files
```

See `docs/development-context.md` for full development documentation.

## License

MIT
