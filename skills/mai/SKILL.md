---
name: mai
description: >
  电商多语言文案短入口。用于生成亚马逊/速卖通标题、五点、Listing、A+、标语、图片文案，
  也可根据图片、草图、原型图和复杂 brief 生成排版友好的文案。必须先在对话中给出结果、
  理解确认、语言确认、数量统计和风险检查，用户确认后才写入文档。适合文员、设计师和运营使用。
argument-hint: "[title|copy|rich] --product <folder-or-file> [--requirement <path>] [--languages CN,EN,DE,ES]"
---

# Mai 电商文案

Mai 取“卖”的拼音 `mai`，意思是帮用户把商品卖点写成能卖货的多语言文案。它也是短入口，优先让用户用简单自然语言表达需求，而不是记长命令。

## 快速判断

- 用户要标题、副标题、标题 A/B：按 `mai-title` 模式执行。
- 用户要 Listing、五点、A+、标语、常规文案：按 `mai-copy` 模式执行。
- 用户给了图片、草图、原型图、Figma 截图、版面限制、复杂 brief：按 `mai-rich` 模式执行。
- 用户要创建产品资料文件夹模板：建议使用 `mai-product`。
- 用户要创建文案需求模板：建议使用 `mai-brief`。

## 必读工作流

读取 [workflow.md](references/workflow.md)，并严格遵守：

1. 默认使用简体中文和用户沟通：上下文理解、提问、讲解、审查、风险说明、保存提示都用简体中文；文案本身按用户指定目标语言输出。
2. 用户可完全使用自然语言；不要要求普通用户记参数名。
3. 缺少关键参数时，一次只问一个数字选择题，用户回复数字即可。
4. 若需求边界模糊或上下文冲突，必须先确认，不能直接生成。
5. 每次文案生成必须经过三轮：初步版本 -> 反思自查与优化建议 -> 最终版本。
6. 先理解和确认场景、语言、数量/版式约束。
7. 先在对话中用分组列表列出文案预览和统计，不直接写文档，不使用 Markdown 表格。
8. 用户确认后，才把带上下文、决策过程、最终结论和统计的 Markdown 文档写入文件。

## 输入

支持 Claude Code 和 Codex 两种调用方式：

- Codex：`使用 $mai 给 ~/products/WT801/ 生成标题`
- Codex：`使用 $mai-rich，根据这张草图和产品资料文件夹生成主图文案`
- Claude Code：`/mai title --product ~/products/WT801/`
- Claude Code：`/mai rich --product ~/products/WT801/ --requirement ~/tasks/image2.md`

参数：

- `title | copy | rich`：可选模式。
- `--product <path>`：产品资料源。优先传入产品资料文件夹；也兼容单个 Markdown 文件。
- `--requirement <path>`：文案需求文件。
- `--languages <list>`：语言列表，默认 `CN,EN,DE,ES`。
- `--platform <amazon|aliexpress>`：默认 `amazon`。
- `--length minimal|medium|full`：长度档位，对应“极简表达 / 中等 / 完整”。
- `--limit`、`--count`、`--layout`：用户给出的字数、数量、版式限制。

用户没有输入这些参数时，不要报错；按 [workflow.md](references/workflow.md) 的引导式确认逐项询问。

## 执行

1. 读取产品资料源、需求文件和用户附加上下文。若 `--product` 是文件夹，递归读取其中所有可用文本资料作为同一个产品上下文。
2. 按 [workflow.md](references/workflow.md) 先补齐缺失参数，再做理解确认、语言确认和数量/版式确认。
3. 按需读取：
   - [copy-types.md](references/copy-types.md)
   - [output-format.md](references/output-format.md)
   - [compliance-rules.md](references/compliance-rules.md)
4. 在对话中输出最终候选文案预览、数量统计、合规检查和待确认事项；对话中避免 Markdown 表格。
5. 等用户确认后，再写入文档。

## 保存

确认后优先使用当前环境的文件写入能力。也可以调用内置脚本：

```bash
bun run <skill-dir>/scripts/save-result.ts --product <产品资料文件夹或文件> --copy-type <类型> --content <临时结果文件>
```

保存后告知完整路径。

## 安装更新

当用户询问 Codex 里的 Mai 如何更新、覆盖旧版或检查版本时：

1. 检查版本：`bun ~/.codex/skills/mai/scripts/check-version.ts`
2. 覆盖更新已安装的 Mai 入口：`bun ~/.codex/skills/mai/scripts/update-installed.ts`
3. 一次安装或更新全部 Mai 入口：`bun ~/.codex/skills/mai/scripts/update-installed.ts --all`

更新脚本默认从 `https://github.com/RenderCoder/Mai` 拉取 `main`，目标是 `$CODEX_HOME/skills` 或 `~/.codex/skills`。它会先把自己复制到临时目录再执行，避免覆盖正在运行的安装脚本；旧技能目录会备份到 `.mai-update-backups/`。

更新后提醒用户重启 Codex。
