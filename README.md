# Mai Ecommerce Copy

Mai is a multilingual ecommerce copywriting skill for **Codex** and **Claude Code**.

“Mai” is the Chinese pinyin for “sell”. Regular users only need one entry: `$mai`.

Mai covers:

- Titles, subtitles, and title A/B options.
- Listings, bullets, A+, taglines, and image copy.
- Copy from images, sketches, prototypes, Figma screenshots, and detailed briefs.
- Product folder templates and copy brief templates.
- Version checks and shell-based update guidance.

## Install

In Codex, run:

```text
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai
```

Restart Codex, then use:

```text
Use $mai
```

Installing `$mai` is enough. Do not ask regular users to install additional Mai entries.

## Check Version

In Codex, you can say:

```text
Use $mai to check version
```

Mai should prefer this shell command:

```bash
sh ~/.codex/skills/mai/scripts/check-version.sh
```

Expected version: `1.1.4`. The check should report:

```text
Double-reflection workflow: yes
CLI-friendly preview: yes
Chinese-first copy: yes
Short-word layout: yes
```

If a newer version is available, exit Codex first, then run this in your system terminal:

```bash
sh ~/.codex/skills/mai/scripts/update-installed.sh
```

The updater uses macOS-default shell tools: `sh`, `curl`, `tar`, `cp`, and `mv`. Regular users do not need Bun, Python, npm, or any developer environment.

## Quick Start

Detailed Chinese user manual: [docs/user-manual.zh-CN.md](docs/user-manual.zh-CN.md).

Prepare a product root folder. Put each product in its own subfolder:

```text
~/my-products/
├── WT801/
└── WT802/
```

For beginners, open Codex in the product root folder, such as `~/my-products/`. Do not rely on the current directory alone; always specify the exact product folder with `--product`.

Create a product folder:

```text
Use $mai to create a WT801 product folder in ~/my-products/
```

Generate titles:

```text
Use $mai --product ~/my-products/WT801/ to write 5 Amazon title options.
```

Generate a full listing:

```text
Use $mai --product ~/my-products/WT801/ to write a full listing in Chinese, English, German, and Spanish.
```

Generate copy from a sketch:

```text
Use $mai --product ~/my-products/WT801/ to write Amazon secondary-image copy from this sketch.
English headline max 4 words, subline max 6 words, max 3 labels.
Use very concise copy.
```

## Delivery Rule

Mai must show the result in chat first. It should include:

- Understanding confirmation.
- Current assumptions.
- Step 1: draft.
- Step 2: first reflection and improvement suggestions.
- Step 3: revised version.
- Step 4: second reflection and final adjustment suggestions.
- Step 5: final version.
- Back-translation check for non-Chinese languages.
- Counts.
- Compliance and risk checks.
- Items to confirm.

If important information is missing, Mai asks one numbered question at a time and the user can reply with a number.

Chat previews should avoid Markdown tables because raw table syntax is hard to read in terminals. After the user confirms, the saved Markdown document must use tables for the final copy, back-translation check, and count statistics.

## Chinese First

Mai is designed for Chinese-speaking teams. Copy output must always put Simplified Chinese first, even if the user only asks for other languages.

For example, `languages EN,DE` actually outputs:

```text
Simplified Chinese -> English -> German
```

After the foreign-language final copy, Mai also back-translates each non-Chinese version into Simplified Chinese so the team can confirm the meaning.

## Length Presets

Users can describe length naturally:

- Very concise: main images, labels, buttons, tight layouts.
- Medium: secondary images, detail modules, normal titles, bullets.
- Complete: listings, A+, SEO-rich copy.

Example:

```text
Use $mai --product ~/my-products/WT801/ to write image copy. Make it very concise.
```

## Development

Regular users do not need these commands.

```bash
bun install
bun run validate
bun run test
bun run lint
bun run release:check
```

Install this checkout locally for development:

```bash
bun run install:codex -- --force
```

Legacy long-name and historical shortcut skill files remain in the repository for compatibility. New users should install and use only `$mai`.
