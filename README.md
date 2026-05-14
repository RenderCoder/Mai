# Mai Ecommerce Copy

Mai is a short-name ecommerce copywriting skill set for **Codex** and **Claude Code**.

“Mai” comes from the Chinese pinyin for “sell” (`mai`). Think of it as a small “selling AI” for product copy.

Use the short entries instead of remembering a long command. Users can also describe the task in natural language; when important information is missing, Mai asks one numbered question at a time and the user can reply with a number.

| Entry | Use |
| --- | --- |
| `$mai` | General entry when you are unsure |
| `$mai-title` | Titles, subtitles, title A/B options |
| `$mai-copy` | Listings, bullets, A+, taglines, image copy |
| `$mai-rich` | Copy from images, sketches, prototypes, or detailed briefs |
| `$mai-product` | Create a product info folder template |
| `$mai-brief` | Create a copy brief template |

## Install

### From GitHub with `$skill-installer`

Most users should install the main entry first:

```text
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai
```

Restart Codex after installing, then use:

```text
Use $mai
```

Installing only `$mai` keeps the core capability: titles, listings, bullets, A+, image copy, multilingual output, chat-first review, and confirmed saving.

Check the installed version:

```bash
cat ~/.codex/skills/mai/VERSION
bun ~/.codex/skills/mai/scripts/check-version.ts
```

Expected version: `1.1.0`. The check script should also report `Three-round workflow: yes` and `CLI-friendly preview: yes`.

If an older `mai` skill is already installed, `$skill-installer` stops when the destination exists and does not overwrite it. To update, clone the repo and run the local installer with `--force`:

```bash
git clone https://github.com/RenderCoder/Mai.git
cd Mai
bun install
bun run install:codex -- --force
```

Restart Codex after updating.

Install the optional shortcuts later if you want more explicit entries:

```text
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai-title
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai-copy
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai-rich
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai-product
Use $skill-installer to install https://github.com/RenderCoder/Mai/tree/main/skills/mai-brief
```

Install `mai` before the `mai-*` subskills because the subskills read shared workflow references from `mai`.

### Local one-command install

From this project directory:

```bash
bun install
bun run install:codex
```

Restart Codex after installing.

Claude Code local use:

```bash
bun run dev
```

### Distribution note

For local setup and experiments, `$skill-installer` works well. For reusable distribution of the full Mai family, package it as a Codex plugin so the six skill entries can be installed together.

## Quick Start

Detailed Chinese user manual: [docs/user-manual.zh-CN.md](docs/user-manual.zh-CN.md).

Create a product folder:

```text
Use $mai-product to create WT801 in ~/my-products/
```

Fill in `~/my-products/WT801/product.md`. You can also drop more product docs into the same folder, such as specs, FAQ, SEO keywords, image briefs, competitor notes, or old listings. Mai reads the folder recursively when you pass it to `--product`.

Generate titles:

```text
Use $mai-title --product ~/my-products/WT801/
```

Natural-language version:

```text
Use $mai-title to write titles for my new product
```

Mai will ask for missing product info, platform, languages, length, and number of options.

`--product` accepts a product folder or a single Markdown file. Folders are recommended because they let you import all docs for one product into one source directory.

Generate full copy:

```text
Use $mai-copy --product ~/my-products/WT801/
```

Generate copy from a sketch or image:

```text
Use $mai-rich --product ~/my-products/WT801/
Write main-image copy from this sketch. English headline max 4 words, subline max 6 words.
```

## Delivery Rule

Mai must show the result in chat first. It should include:

If information is missing, it asks one question at a time:

```text
Which type of copy do you want?
1. Title/subtitle
2. Bullet points
3. Full listing
4. A+ content
5. Image/sketch copy
Reply with a number.
```

- Scene understanding
- Output languages
- Assumptions and missing information
- First round: draft
- Second round: reflection and improvement suggestions
- Third round: final rewrite
- Copy preview
- Character, word, and line-count statistics
- Layout risk
- Compliance risk

If product context, platform, language, placement, quantity limits, or compliance evidence is unclear, Mai should ask a blocking confirmation question before generating copy.

Only after you confirm should it write the Markdown result document.

The saved document should include the original brief, reasoning context, decisions, final copy, counts, compliance checks, and manual review notes.

## Common Prompts

Typical complete prompt:

```text
Use $mai-rich --product ~/my-products/WT801/ --length minimal --languages CN,EN,DE,ES
Write Amazon secondary-image copy from my uploaded sketch.
The image shows a smart watering timer connected to two hoses: flower bed on the left, lawn on the right.
Target audience: home gardening users.
English headline max 4 words, subline max 6 words, max 3 labels.
Show copy and character counts first. Do not write the document yet.
```

Mai should first show its understanding, three-round copy flow, character/word/line counts, and layout risk. After you confirm, it writes the Markdown document.

Natural-language version:

```text
Use $mai-rich to write Amazon secondary-image copy from this sketch.
```

If language, length, platform, or product details are missing, Mai asks for them with numbered options.

## Length Presets

Use `--length` to choose how concise the copy should be:

| Parameter | Meaning | Best for |
| --- | --- | --- |
| `--length minimal` | Very concise | Main images, labels, buttons, tight layouts |
| `--length medium` | Balanced | Secondary images, detail modules, normal titles |
| `--length full` | Complete | Listings, A+, SEO-rich copy |

You can also say it naturally, for example: “make it very concise.”

Five title options:

```text
Use $mai-title --product ~/my-products/WT801/ --count 5 --length medium
```

Bullets only:

```text
Use $mai-copy --product ~/my-products/WT801/ bullets --length medium
```

Amazon A+:

```text
Use $mai-copy --product ~/my-products/WT801/ a-plus --length full
```

Create an image-copy brief:

```text
Use $mai-brief to create wt801-image2 in ~/tasks/ with type image-copy
```

Use a brief:

```text
Use $mai-rich --product ~/my-products/WT801/ --requirement ~/tasks/wt801-image2.md
```

## Development

```bash
bun run validate
bun run test
bun run lint
bun run release:check
```

Before publishing or reinstalling for real use, run:

```bash
bun run release:check
bun run install:codex -- --force
```

Restart Codex after reinstalling.

The old `ecommerce-multilingual-copy` skill remains in the repository for compatibility reference. New users should use the `mai` entries.
