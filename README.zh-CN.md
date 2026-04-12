# ecommerce-multilingual-copy

一键生成亚马逊/速卖通多语言电商文案的 Claude Code 插件。

## 特性

- **4 步反思翻译管线**：初稿生成 → 极限审查 → 终审重写+回译 → 人工核对
- **6 种文案类型**：完整 Listing、标题、要点、A+ 内容、标语、单图文案
- **4 语言默认输出**：中文、英语、德语、西班牙语（可配置）
- **文件化工作流**：产品知识库和需求文件通过路径参数传入，便于管理和版本控制
- **结果自动保存**：输出自动保存在需求/产品文件同目录下
- **合规引擎**：内置极限词禁止表、平台规则、产品级覆写机制
- **回译质量门**：德语/西语逐字回译为中文，供非母语者核对语义保真度

## 安装

### 从 GitHub 安装

```bash
npx skills add RenderCoder/ecommerce-multilingual-copy@ecommerce-multilingual-copy
```

### 本地开发

```bash
git clone https://github.com/RenderCoder/ecommerce-multilingual-copy.git
cd ecommerce-multilingual-copy
bun install
bun run dev  # 或：claude --plugin-dir .
```

## 快速开始

### 1. 创建产品知识库

复制 `docs/examples/_TEMPLATE.md` 模板，填写你的产品信息：

```bash
cp docs/examples/_TEMPLATE.md ~/my-products/MyProduct.md
# 编辑文件，填写产品规格、卖点、SEO 关键词等
```

### 2. 运行技能

```bash
# 完整 Listing（8 个字段）
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md

# 仅标题（简化模式）
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md title

# 配合需求文件（如单图文案需求）
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md --requirement ~/tasks/image-brief.md

# 自定义语言
/ecommerce-multilingual-copy --product ~/my-products/MyProduct.md --languages CN,EN,FR
```

### 3. 获取结果

技能��出 Markdown 表格，可直接粘贴到 Excel、Google Sheets 或 Figma。使用 `--requirement` 或 `--product` 参数时，结果会自动保存：

```
~/tasks/image-brief_result_20260412.md
```

## 参数说明

| 参数 | 必须 | 说明 |
|------|------|------|
| `--product <path>` | 是 | 产品知识库文件路径 |
| `--requirement <path>` | 否 | 需求/brief 文件路径 |
| `copy-type` | 否 | `full-listing`（默认）、`title`、`bullets`、`a-plus`、`tagline`、`image-copy` |
| `--languages XX,XX` | 否 | 覆盖语言列表（默认 `CN,EN,DE,ES`） |
| `--platform` | 否 | `amazon`（默认）或 `aliexpress` |

## 文案类型

| 类型 | 输出字段 | 管线模式 |
|------|----------|----------|
| `full-listing` | 标题+副标题+5条要点+短描述 | 完整 4 步 |
| `title` | 标题+副标题 | 简化 |
| `bullets` | 5 条要点 | 完整（回译精简） |
| `a-plus` | 横幅+4 个特性模块 | 完整 4 步 |
| `tagline` | 1-2 行创意文案 | 简化 |
| `image-copy` | 主标题+副标题+标签配文 | 完整 4 步 |

## 管线工作原理

1. **初稿生成** — 资深文案专家角色，基于产品知识库创建多语言初稿
2. **极限审查** — 强制视角切换为严苛审查官，逐条找出每一个缺陷
3. **终审重写 + 回译** — 切换为母语级文案大师，吸收审查反馈重写；德语/西语回译为中文验证语义
4. **人工核对呈现** — 干净表格 + 回译核对表 + 执行摘要 + 变更日志

## 开发

```bash
bun install                # 安装开发依赖
bun run dev                # 启动 Claude Code 并加载本插件
bun run validate           # 检查插件结构完整性
bun run lint               # 检查 TypeScript 代码
bun run format             # 格式化 TypeScript 代码
```

详细开发文档见 `docs/development-context.md`。

## 许可证

MIT
