---
name: mai
description: >
  电商多语言文案短入口。用于生成亚马逊/速卖通标题、五点、Listing、A+、标语、图片文案，
  也可根据图片、草图、原型图和复杂 brief 生成排版友好的文案。必须先在对话中给出结果、
  理解确认、语言确认、数量统计和风险检查，用户确认后才写入文档。适合文员、设计师和运营使用。
argument-hint: "[title|copy|rich] --product <path> [--requirement <path>] [--languages CN,EN,DE,ES]"
---

# Mai 电商文案

Mai 取“卖”的拼音 `mai`，意思是帮用户把商品卖点写成能卖货的多语言文案。它也是短入口，优先让用户用简单自然语言表达需求，而不是记长命令。

## 快速判断

- 用户要标题、副标题、标题 A/B：按 `mai-title` 模式执行。
- 用户要 Listing、五点、A+、标语、常规文案：按 `mai-copy` 模式执行。
- 用户给了图片、草图、原型图、Figma 截图、版面限制、复杂 brief：按 `mai-rich` 模式执行。
- 用户要创建产品资料模板：建议使用 `mai-product`。
- 用户要创建文案需求模板：建议使用 `mai-brief`。

## 必读工作流

读取 [workflow.md](references/workflow.md)，并严格遵守：

1. 用户可完全使用自然语言；不要要求普通用户记参数名。
2. 缺少关键参数时，一次只问一个数字选择题，用户回复数字即可。
3. 先理解和确认场景、语言、数量/版式约束。
4. 先在对话中列出文案结果和统计，不直接写文档。
5. 用户确认后，才把带上下文、决策过程、最终结论和统计的 Markdown 文档写入文件。

## 输入

支持 Claude Code 和 Codex 两种调用方式：

- Codex：`使用 $mai 给 ~/products/WT801.md 生成标题`
- Codex：`使用 $mai-rich，根据这张草图和产品文件生成主图文案`
- Claude Code：`/mai title --product ~/products/WT801.md`
- Claude Code：`/mai rich --product ~/products/WT801.md --requirement ~/tasks/image2.md`

参数：

- `title | copy | rich`：可选模式。
- `--product <path>`：产品资料文件。
- `--requirement <path>`：文案需求文件。
- `--languages <list>`：语言列表，默认 `CN,EN,DE,ES`。
- `--platform <amazon|aliexpress>`：默认 `amazon`。
- `--length minimal|medium|full`：长度档位，对应“极简表达 / 中等 / 完整”。
- `--limit`、`--count`、`--layout`：用户给出的字数、数量、版式限制。

用户没有输入这些参数时，不要报错；按 [workflow.md](references/workflow.md) 的引导式确认逐项询问。

## 执行

1. 读取产品文件、需求文件和用户附加上下文。
2. 按 [workflow.md](references/workflow.md) 先补齐缺失参数，再做理解确认、语言确认和数量/版式确认。
3. 按需读取：
   - [copy-types.md](references/copy-types.md)
   - [output-format.md](references/output-format.md)
   - [compliance-rules.md](references/compliance-rules.md)
4. 在对话中输出最终候选文案、数量统计、合规检查和待确认事项。
5. 等用户确认后，再写入文档。

## 保存

确认后优先使用当前环境的文件写入能力。也可以调用内置脚本：

```bash
bun run <skill-dir>/scripts/save-result.ts --product <产品文件> --copy-type <类型> --content <临时结果文件>
```

保存后告知完整路径。
