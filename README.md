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
| `$mai-product` | Create a product info template |
| `$mai-brief` | Create a copy brief template |

## Install

### From GitHub with `$skill-installer`

After publishing this repository to GitHub, install the active Mai entries from Codex:

```text
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai-title
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai-copy
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai-rich
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai-product
Use $skill-installer to install https://github.com/RenderCoder/ecommerce-multilingual-copy/tree/main/skills/mai-brief
```

Restart Codex after installing, then use:

```text
Use $mai
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

Create a product file:

```text
Use $mai-product to create WT801 in ~/my-products/
```

Fill in `~/my-products/WT801.md`.

Generate titles:

```text
Use $mai-title --product ~/my-products/WT801.md
```

Natural-language version:

```text
Use $mai-title to write titles for my new product
```

Mai will ask for missing product info, platform, languages, length, and number of options.

Generate full copy:

```text
Use $mai-copy --product ~/my-products/WT801.md
```

Generate copy from a sketch or image:

```text
Use $mai-rich --product ~/my-products/WT801.md
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
- Copy table
- Character, word, and line-count statistics
- Layout risk
- Compliance risk

Only after you confirm should it write the Markdown result document.

The saved document should include the original brief, reasoning context, decisions, final copy, counts, compliance checks, and manual review notes.

## Common Prompts

Typical complete prompt:

```text
Use $mai-rich --product ~/my-products/WT801.md --length minimal --languages CN,EN,DE,ES
Write Amazon secondary-image copy from my uploaded sketch.
The image shows a smart watering timer connected to two hoses: flower bed on the left, lawn on the right.
Target audience: home gardening users.
English headline max 4 words, subline max 6 words, max 3 labels.
Show copy and character counts first. Do not write the document yet.
```

Mai should first show its understanding, copy table, character/word/line counts, and layout risk. After you confirm, it writes the Markdown document.

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
Use $mai-title --product ~/my-products/WT801.md --count 5 --length medium
```

Bullets only:

```text
Use $mai-copy --product ~/my-products/WT801.md bullets --length medium
```

Amazon A+:

```text
Use $mai-copy --product ~/my-products/WT801.md a-plus --length full
```

Create an image-copy brief:

```text
Use $mai-brief to create wt801-image2 in ~/tasks/ with type image-copy
```

Use a brief:

```text
Use $mai-rich --product ~/my-products/WT801.md --requirement ~/tasks/wt801-image2.md
```

## Development

```bash
bun run validate
bun run test
bun run lint
```

The old `ecommerce-multilingual-copy` skill remains in the repository for compatibility reference. New users should use the `mai` entries.
