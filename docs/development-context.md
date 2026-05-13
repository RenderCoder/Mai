# Mai 开发上下文

本文档为 AI 辅助开发和维护提供项目上下文。

## 项目定位

Mai 同时提供 **Codex skills** 和 **Claude Code plugin**。它用于生成亚马逊/速卖通多语言电商文案，面向文员、设计师和运营，而不是工程师。

核心设计目标：

- 短入口：用 `mai` 系列替代难记的长命令。
- 名称含义：`Mai` 取“卖”的拼音，暗示“卖货 AI”。
- 任务拆分：标题、常规文案、复杂图文 brief、产品资料、需求模板分开入口。
- 确认优先：先在对话中展示结果和统计，用户确认后才写文档。
- 文档带上下文：保存的结果必须包含原始需求、场景理解、关键决策、最终文案、数量统计和复核项。
- 长度可控：支持 `minimal`（极简表达）、`medium`（中等）、`full`（完整）三档。
- 引导式参数确认：关键参数缺失时一次只问一个数字选择题，用户回复数字即可。

## 当前入口

| Skill | 用途 |
| --- | --- |
| `mai` | 主入口，自动判断 title/copy/rich 模式 |
| `mai-title` | 标题、副标题、标题 A/B 方案 |
| `mai-copy` | Listing、五点、A+、标语、单图文案 |
| `mai-rich` | 图片、草图、原型图、复杂 brief、二维版式约束 |
| `mai-product` | 产品资料模板 |
| `mai-brief` | 文案需求模板 |

旧的 `ecommerce-multilingual-copy`、`new-product`、`new-requirement` 目录保留作兼容参考，但 `.claude-plugin/plugin.json` 和 Codex installer 只安装 `mai` 系列入口。

## 运行时结构

Claude Code plugin：

- `.claude-plugin/plugin.json` 声明可用 skill。
- `skills/<skill-name>/SKILL.md` 是 prompt。

Codex skill：

- `bun run install:codex` 读取 `.claude-plugin/plugin.json`。
- 安装脚本复制 manifest 中列出的 `skills/<skill-name>/` 到 `$CODEX_HOME/skills` 或 `~/.codex/skills`。
- Codex 所需资源必须放在对应 skill 目录内。

## 关键文件

- `skills/mai/SKILL.md`：主入口说明。
- `skills/mai/references/workflow.md`：确认、统计、写文档的核心规则。
- `skills/mai/references/compliance-rules.md`：合规红线。
- `skills/mai/references/output-format.md`：表格输出格式。
- `skills/mai/references/copy-types.md`：文案类型定义。
- `skills/mai/scripts/save-result.ts`：skill-local 保存工具。
- `scripts/install-codex-skill.ts`：Codex 安装脚本。
- `scripts/validate-skill.ts`：结构校验。

## 工作流规则

每次文案生成必须：

1. 读取产品资料、需求文件、图片/草图上下文。
2. 对缺失的关键参数逐项提问，一次只问一个数字选择题。
3. 确认场景理解。
4. 确认语言。
5. 确认长度档位、数量、字数、行数、版式限制。
6. 在对话中展示结果、统计和风险。
7. 等用户确认。
8. 写入 Markdown 文档。

如果用户只是在创建模板，允许直接写入模板文件；若保存目录不明确，先询问。

## 保存规则

用户确认后才写文档。保存路径优先级：

1. 用户指定输出文件。
2. `--requirement` 同目录：`<需求名>_result_<YYYYMMDD>.md`。
3. `--product` 同目录：`<产品名>_<copy-type>_result_<YYYYMMDD>.md`。
4. 无法判断时询问用户保存目录。

## 开发命令

```bash
bun run validate
bun run test
bun run lint
bun run install:codex -- --dry-run
```

## 维护注意

- 新增 skill 后必须更新 `.claude-plugin/plugin.json`、README、测试或校验逻辑。
- `agents/openai.yaml` 必须跟每个新 skill 的用途一致。
- 不要把 `workflow.md` 的确认后写文档规则改回自动保存。
- 不要只改旧长入口；新用户路径以 `mai` 系列为准。
