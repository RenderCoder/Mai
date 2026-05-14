---
name: mai-copy
description: >
  生成常规电商文案的短入口。适用于完整 Listing、五点描述、A+ 内容、标语、单图文案和多语言改写。
  必须先在对话中展示结果、语言确认、数量统计、合规检查和待确认事项，用户确认后才写入文档。
argument-hint: "--product <folder-or-file> [full-listing|bullets|a-plus|tagline|image-copy] [--length minimal|medium|full]"
---

# Mai Copy

这是 `mai` 的常规文案模式。执行时读取 `../mai/references/workflow.md`，并按其中规则执行。

默认使用简体中文和用户沟通：上下文理解、提问、讲解、审查、风险说明、保存提示都用简体中文；只有最终文案按用户指定目标语言输出。

用户可以只用自然语言说“帮我写五点”或“帮我写完整 Listing”。`--product` 优先使用产品资料文件夹，并递归读取其中所有可用文本资料；也兼容单个 Markdown 文件。缺少产品资料、文案类型、平台、语言、长度或数量时，按 `workflow.md` 的引导式参数确认一次问一个数字选择题。

## 默认任务

- 未指定文案类型时：`full-listing`
- 支持：`full-listing`、`bullets`、`a-plus`、`tagline`、`image-copy`
- 默认语言：`CN,EN,DE,ES`
- 默认平台：`amazon`
- 默认长度：`medium`；`full-listing` 和 `a-plus` 默认 `full`；`tagline` 和 `image-copy` 默认 `minimal`。

## 必须确认

1. 文案类型和字段数量。
2. 目标平台。
3. 语言列表。
4. 重点卖点顺序。
5. 长度档位：极简表达 / 中等 / 完整。
6. 字数、字符数、行数或模块数量限制。
7. 是否有草稿要优化，还是从产品资料新写。

## 输出前置规则

若任务类型、平台、语言、产品资料、长度或数量存在关键模糊点，先按 `workflow.md` 的阻断规则确认，不能直接生成。生成时必须经过三轮：初步版本 -> 反思自查与优化建议 -> 最终版本。对话预览必须使用编号方案、分组列表和短块，避免 Markdown 表格。用户确认后，再写入带上下文和决策说明的 Markdown 文档；写入文档时可以使用表格做对照。
