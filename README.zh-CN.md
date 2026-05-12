# ecommerce-multilingual-copy

同时支持 **Codex** 和 **Claude Code** 的多语言电商文案技能。

它可以把一个产品资料文件变成适合亚马逊/速卖通使用的中文、英文、德语、西语文案，并把结果保存成 Markdown 文档。

## 给新手的最短流程

你只需要做三件事：

1. 安装技能。
2. 创建一个产品资料文件。
3. 让 Codex 或 Claude Code 根据这个文件生成文案。

### Codex 一键安装

如果你已经下载了这个项目：

```bash
bun install
bun run install:codex
```

安装完成后，重启 Codex。

如果要安装到指定 Codex 目录：

```bash
bun run install:codex -- --codex-home ~/.codex
```

如果提示技能已存在，想覆盖更新：

```bash
bun run install:codex -- --force
```

### Claude Code 安装

从 GitHub 安装：

```bash
npx skills add RenderCoder/ecommerce-multilingual-copy@ecommerce-multilingual-copy
```

本地开发或试用：

```bash
git clone https://github.com/RenderCoder/ecommerce-multilingual-copy.git
cd ecommerce-multilingual-copy
bun install
bun run dev
```

## 普通用户怎么用

### 1. 创建产品资料文件

在 Codex 里输入：

```text
使用 $new-product 创建 WT801 到 ~/my-products/
```

在 Claude Code 里输入：

```text
/ecommerce-multilingual-copy:new-product WT801 ~/my-products/
```

然后打开 `~/my-products/WT801.md`，填写品牌、规格、卖点、关键词、合规说明等空白项。

### 2. 生成文案

在 Codex 里输入：

```text
使用 $ecommerce-multilingual-copy --product ~/my-products/WT801.md title
```

在 Claude Code 里输入：

```text
/ecommerce-multilingual-copy --product ~/my-products/WT801.md title
```

### 3. 查看结果文件

结果会优先保存到产品文件或需求文件旁边，例如：

```text
~/my-products/WT801_title_result_20260512.md
```

如果 AI 不确定保存到哪里，它应该先问你要保存到哪个文件夹。

## 常用命令

生成完整 Listing：

```text
使用 $ecommerce-multilingual-copy --product ~/my-products/WT801.md
```

只生成五点描述：

```text
使用 $ecommerce-multilingual-copy --product ~/my-products/WT801.md bullets
```

根据图片需求生成单图文案：

```text
使用 $new-requirement 创建 wt801-image2 到 ~/tasks/，类型 image-copy
使用 $ecommerce-multilingual-copy --product ~/my-products/WT801.md --requirement ~/tasks/wt801-image2.md
```

指定语言：

```text
使用 $ecommerce-multilingual-copy --product ~/my-products/WT801.md --languages CN,EN,DE,ES
```

## 它会输出什么

- 最终多语言文案表
- 德语/西语回译核对表
- 简短执行摘要
- 修改记录
- 自动保存的 Markdown 结果文件

## 文案类型

| 类型 | 适合做什么 |
| --- | --- |
| `full-listing` | 标题、副标题、五点、短描述 |
| `title` | 标题和副标题 |
| `bullets` | 五条卖点 |
| `a-plus` | Amazon A+ 模块 |
| `tagline` | 短标语 |
| `image-copy` | 主图或详情图文案 |

## 参数说明

| 参数 | 必须 | 含义 |
| --- | --- | --- |
| `--product <path>` | 是 | 产品资料文件 |
| `--requirement <path>` | 否 | 文案需求文件 |
| `copy-type` | 否 | `full-listing`、`title`、`bullets`、`a-plus`、`tagline`、`image-copy` |
| `--languages XX,XX` | 否 | 默认 `CN,EN,DE,ES` |
| `--platform` | 否 | 默认 `amazon`，也支持 `aliexpress` |

## 开发命令

```bash
bun install
bun run validate
bun test
bun run lint
```

常用脚本：

- `bun run install:codex`：安装到 `$CODEX_HOME/skills` 或 `~/.codex/skills`。
- `bun run validate`：检查 Claude Code 插件和 Codex skill 结构。
- `bun run bin/save-result.ts --help`：查看结果保存工具。

## 许可证

MIT
