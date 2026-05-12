# ecommerce-multilingual-copy

Multilingual e-commerce copywriting skills for **Codex** and **Claude Code**.

It turns a product file into Amazon/AliExpress-ready copy in Chinese, English, German, and Spanish, then saves the result as a Markdown document.

## For New Users

You only need three things:

1. Install the skill.
2. Make one product file.
3. Ask Codex or Claude Code to generate copy from that file.

### One-Click Codex Install

If you already downloaded this project:

```bash
bun install
bun run install:codex
```

Restart Codex after installation.

To install into a different Codex home:

```bash
bun run install:codex -- --codex-home ~/.codex
```

If Codex says the skill already exists:

```bash
bun run install:codex -- --force
```

### Claude Code Install

From GitHub:

```bash
npx skills add RenderCoder/ecommerce-multilingual-copy@ecommerce-multilingual-copy
```

Local development:

```bash
git clone https://github.com/RenderCoder/ecommerce-multilingual-copy.git
cd ecommerce-multilingual-copy
bun install
bun run dev
```

## Simple Start

### 1. Create a Product File

In Codex:

```text
Use $new-product to create WT801 in ~/my-products/
```

In Claude Code:

```text
/ecommerce-multilingual-copy:new-product WT801 ~/my-products/
```

Open `~/my-products/WT801.md` and fill in the blanks: brand, specs, selling points, SEO keywords, and compliance notes.

### 2. Generate Copy

In Codex:

```text
Use $ecommerce-multilingual-copy --product ~/my-products/WT801.md title
```

In Claude Code:

```text
/ecommerce-multilingual-copy --product ~/my-products/WT801.md title
```

### 3. Find the Result

The result is saved beside the product or requirement file, for example:

```text
~/my-products/WT801_title_result_20260512.md
```

If the AI cannot tell where to save the file, it should ask you for a folder path.

## Common Tasks

Create a full listing:

```text
Use $ecommerce-multilingual-copy --product ~/my-products/WT801.md
```

Create only bullet points:

```text
Use $ecommerce-multilingual-copy --product ~/my-products/WT801.md bullets
```

Create image copy from a brief:

```text
Use $new-requirement to create wt801-image2 in ~/tasks/ with type image-copy
Use $ecommerce-multilingual-copy --product ~/my-products/WT801.md --requirement ~/tasks/wt801-image2.md
```

Change languages:

```text
Use $ecommerce-multilingual-copy --product ~/my-products/WT801.md --languages CN,EN,DE,ES
```

## What It Produces

- Final multilingual copy table
- German and Spanish back-translation check
- Short execution summary
- Change log
- Saved Markdown result document

## Copy Types

| Type | Best for |
| --- | --- |
| `full-listing` | Title, subtitle, 5 bullets, short description |
| `title` | Product title and subtitle |
| `bullets` | Five product bullet points |
| `a-plus` | Amazon A+ modules |
| `tagline` | Short slogans |
| `image-copy` | Main image or feature image text |

## Parameters

| Parameter | Required | Meaning |
| --- | --- | --- |
| `--product <path>` | Yes | Product knowledge file |
| `--requirement <path>` | No | Copy brief file |
| `copy-type` | No | `full-listing`, `title`, `bullets`, `a-plus`, `tagline`, `image-copy` |
| `--languages XX,XX` | No | Default: `CN,EN,DE,ES` |
| `--platform` | No | Default: `amazon`; also supports `aliexpress` |

## Development

```bash
bun install
bun run validate
bun test
bun run lint
```

Useful scripts:

- `bun run install:codex` installs the skills into `$CODEX_HOME/skills` or `~/.codex/skills`.
- `bun run validate` checks plugin and skill structure.
- `bun run bin/save-result.ts --help` shows the result-saving helper.

## License

MIT
