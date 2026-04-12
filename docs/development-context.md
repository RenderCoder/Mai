# ecommerce-multilingual-copy 开发上下文

本文档为 AI 辅助开发和维护提供完整的项目上下文。

## 项目定位

本项目是一个 **Claude Code Plugin**（插件），封装了一套 4 步反思翻译管线，用于生成可直接发布到亚马逊/速卖通的多语言电商文案。

**核心价值**：将原本需要人工在 4 个 AI 提示之间手动复制粘贴的工作流，压缩为一条命令自动完成。

## 技术架构

### Claude Code Plugin 机制

Claude Code Plugin 是一个目录结构，包含：
- `.claude-plugin/plugin.json` — 插件清单，声明插件名称、版本、包含的 skills
- `skills/<skill-name>/SKILL.md` — 技能定义文件（Markdown 格式的 prompt）
- `skills/<skill-name>/references/` — 参考文件（被 SKILL.md 通过相对链接引用）

**关键变量**：
- `$ARGUMENTS` — 用户在调用技能时传入的参数字符串
- `$CLAUDE_SKILL_DIR` — 技能文件所在目录的运行时路径（用于相对链接解析）

**安装方式**：
- 本地开发：`claude --plugin-dir /path/to/this/repo`
- GitHub 安装：`npx skills add owner/repo@skill-name`
- 重载：在 Claude Code 中运行 `/reload-plugins`

### SKILL.md 不是代码，是 Prompt

SKILL.md 是一个 Markdown 文件，内容会被加载到 Claude 的上下文中作为 system-level instructions。它不是可执行代码。其中的指令（如"使用 Read 工具读取文件"）是对 Claude 的行为指导。

### 4 步管线设计原理

1. **初稿生成**（角色：文案撰写专家）— 基于产品知识库生成多语言初稿
2. **极限审查**（角色：排雷官）— 强制视角切换，以完全不同的角色审查初稿
3. **终审重写 + 回译**（角色：母语级文案大师）— 吸收审查反馈重写，并通过回译验证语义保真
4. **人工核对呈现**（角色：交付专家）— 格式化输出 + 自动保存

**核心机制**：
- **视角强制切换**：在步骤之间插入角色重置指令，防止 AI 对自己的输出过于宽容（anti-sycophancy）
- **回译核对**（Back-Translation）：将德语/西语翻译逐字直译回中文，让非母语者判断语义是否保留
- **防畸形妥协**：允许德语/西语适度超长，而非生成不地道的压缩句子

### 参考文件职责

| 文件 | 职责 | 被哪个步骤读取 |
|------|------|---------------|
| `compliance-rules.md` | 极限词禁止表、平台字符限制、合规替代语 | Step 1 (自检)、Step 2 (审查) |
| `output-format.md` | 表格列定义、格式硬性规则 | Step 1 (输出)、Step 3 (输出) |
| `copy-types.md` | 6 种文案类型的字段和管线模式定义 | 输入解析阶段 |

### 产品知识库结构

产品文件由用户在自己的目录中维护，通过 `--product <path>` 传入。必须包含：
- 基础信息（品牌、型号、品类）
- 核心技术规格
- 关键卖点（按优先级排序）— 这是文案生成的核心输入
- SEO 关键词（按语言分组）— 决定各语言的搜索词嵌入
- 合规覆写规则 — 产品级规则覆盖通用合规规则
- 强制术语 — 必须出现在文案中的特定术语
- 计量单位本地化 — 北美用加仑，欧洲用升

### 需求文件与自动保存

需求文件通过 `--requirement <path>` 传入，包含具体的文案任务描述（画面描述、用户草稿、特殊约束等）。

结果自动保存在需求文件同目录下，命名规则：`${需求文件名}_result_${YYYYMMDD}.md`

## 开发工作流

### 本地测试

```bash
# 1. 启动 Claude Code，加载本插件
bun run dev
# 或手动：claude --plugin-dir /path/to/this/repo

# 2. 在 Claude Code 中测试技能
/ecommerce-multilingual-copy --product docs/examples/WT702.md title

# 3. 修改 SKILL.md 后重载
/reload-plugins
```

### 验证插件结构

```bash
bun run validate
```

### 代码规范（仅 TypeScript 文件）

```bash
bun run lint      # 检查
bun run lint:fix  # 自动修复
bun run format    # 格式化
```

## 扩展指南

### 添加新的文案类型

1. 在 `references/copy-types.md` 中添加新类型定义
2. 在 `references/output-format.md` 中添加对应的表格格式（如有特殊格式）
3. 在 SKILL.md 的"简化模式"章节中定义该类型的管线模式（完整/简化）

### 添加新的合规规则

1. 在 `references/compliance-rules.md` 中添加规则
2. 若为产品级可覆写规则，在模板中说明覆写方式

### 添加新的语言支持

1. 在产品知识库模板中增加该语言的 SEO 关键词段
2. 在 `references/compliance-rules.md` 中增加该语言的极限词翻译
3. 在 `references/output-format.md` 中增加表格列示例
4. 默认语言列表不变（CN/EN/DE/ES），用户通过 `--languages` 按需添加

### 支持新的电商平台

1. 在 `references/compliance-rules.md` 中添加平台特定规则
2. 在 SKILL.md 的输入解析中增加 `--platform` 选项值
3. 在 Step 2（审查）中增加该平台的审查维度

## 关键设计约束

1. **SKILL.md 必须自包含**：所有管线逻辑写在���个文件中，不拆分为多个步骤文件。原因：Skill 内容一次性加载为单条消息。
2. **参考文件按需读取**：合规规则等文件通过 Markdown 链接引用，Claude 在需要时才 Read，节省 token。
3. **不依赖外部运行时**：SKILL.md 的核心功能不依赖 Bun/Node.js。TypeScript 工具仅用于开发辅助。
4. **产品文件外部化**：插件不包含用户的产品数据，仅提供格式模板。
