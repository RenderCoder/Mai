---
name: new-requirement
description: >
  创建文案需求模板文件。输入需求名称和目标目录，自动生成可填写的文案需求 Markdown 文件。
argument-hint: "<requirement-name> [target-directory] [--type copy-type]"
---

# 创建文案需求模板

## 功能

根据用户提供的需求名称，生成一个预填好名称和文案类型的文案需求 Markdown 模板文件。用户随后可在文件中填写画面描述、卖点、草稿等信息，供 Claude Code 的 `/ecommerce-multilingual-copy --requirement <path>` 或 Codex 的 `$ecommerce-multilingual-copy --requirement <path>` 使用。

## 输入解析

根据当前运行环境解析输入：

- Claude Code：解析 `$ARGUMENTS`。
- Codex：解析用户消息中紧跟 `$new-requirement` 后的内容，或用户自然语言中给出的需求名称、目录和文案类型。

- **$0**（必须）：需求名称（如 `wt702-image3`、`listing-rewrite-v2`）
- **$1**（可选）：目标目录路径，支持绝对路径和 `~` 展开。默认为当前工作目录
- **--type**（可选）：文案类型，默认 `image-copy`。可选值：`full-listing`、`title`、`bullets`、`a-plus`、`tagline`、`image-copy`

**示例调用**：
- `/ecommerce-multilingual-copy:new-requirement wt702-image3` → 当前目录创建 `wt702-image3.md`（默认 image-copy 类型）
- `/ecommerce-multilingual-copy:new-requirement listing-v2 ~/tasks/ --type full-listing` → 在 `~/tasks/` 创建 `listing-v2.md`
- `/ecommerce-multilingual-copy:new-requirement wt702-tagline ~/tasks/ --type tagline`
- `使用 $new-requirement 创建 wt702-image3 到 ~/tasks/，类型 image-copy` → Codex 中创建 `~/tasks/wt702-image3.md`

**无参数调用**：依次询问需求名称、目标目录、文案类型。若无法判断保存目录，询问用户要把模板保存到哪个文件夹。

## 执行步骤

1. 解析需求名称、目标目录、文案类型
2. 确定输出文件路径：`<目标目录>/<需求名称>.md`
3. 检查文件是否已存在。若已存在，提示用户确认是否覆盖
4. 根据文案类型选择对应模板（见下方），其中 `{{REQUIREMENT_NAME}}` 替换为用户输入的需求名称，`{{COPY_TYPE}}` 替换为文案类型
5. 使用当前环境可用的文件写入能力创建文件
6. 输出："✅ 文案需求模板已创建：`<完整文件路径>`\n\n请编辑该文件填写需求信息后，配合产品知识库使用：\nClaude Code：`/ecommerce-multilingual-copy --product <产品文件> --requirement <完整文件路径>`\nCodex：`使用 $ecommerce-multilingual-copy --product <产品文件> --requirement <完整文件路径>`"

## 模板内容

### `image-copy` 类型（默认）

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
image-copy

## 图片信息
- **图片序号/位置**：
- **画面内容描述**：

## 核心传达卖点
- 
- 
- 

## 解决的痛点/用户场景
- **场景**：
- **痛点**：

## 技术参数/事实
- 
- 

## 当前拟定文案（草稿）
- **标题**：
- **副标题**：
- **标签配文**：

## 字数与排版限制
- 主标题：不超过 4 个单词（英文）
- 副标题：不超过 6 个单词（英文）

## 特殊要求

```

### `full-listing` 类型

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
full-listing

## 需求背景
<!-- 为什么需要重写/新建 Listing？上架、改版、A/B 测试？ -->


## 重点突出的卖点
<!-- 如有特定优先级要求，在此说明 -->
- 
- 

## 现有草稿（可选）
<!-- 如有现有文案，粘贴在此供优化 -->


## 特殊要求

```

### `title` 类型

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
title

## 标题需求背景
<!-- A/B 测试、新品上架、SEO 优化？ -->


## 希望突出的关键词/卖点
- 
- 

## 现有标题（可选）
<!-- 如有现有标题，粘贴在此 -->


## 特殊要求

```

### `bullets` 类型

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
bullets

## 要点需求背景
<!-- 为什么需要重写要点？补充新卖点、优化转化率？ -->


## 希望突出的卖点（按优先级）
1. 
2. 
3. 
4. 
5. 

## 现有要点（可选）
<!-- 如有现有要点，粘贴在此 -->


## 特殊要求

```

### `a-plus` 类型

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
a-plus

## A+ 内容规划
- **横幅主题**：
- **模块 1 主题**：
- **模块 2 主题**：
- **模块 3 主题**：
- **模块 4 主题**：

## 品牌故事/差异化角度


## 现有 A+ 内容（可选）
<!-- 如有现有内容，粘贴在此 -->


## 特殊要求

```

### `tagline` 类型

```markdown
# {{REQUIREMENT_NAME}}

## 文案类型
tagline

## 标语用途
<!-- 包装、广告、社媒、产品页？ -->


## 希望传达的核心信息


## 语气/风格偏好
<!-- 例：简洁有力、温暖亲切、科技感 -->


## 现有标语（可选）


## 特殊要求

```
