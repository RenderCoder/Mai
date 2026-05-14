# Mai 电商文案

Mai 是一个给 **Codex** 和 **Claude Code** 用的电商多语言文案技能。

“Mai” 是“卖”的拼音，也可以理解成“卖货 AI”：把商品卖点写成能用于电商页面、图片和 Listing 的文案。

它的重点不是让你记复杂命令，而是用几个短入口完成常见工作。你也可以完全用自然语言描述需求；如果缺少必要信息，Mai 会一个问题一个问题问你，并给出数字选项，你回复数字即可。

| 入口 | 用途 |
| --- | --- |
| `$mai` | 不确定用哪个时，就用这个 |
| `$mai-title` | 生成标题、副标题、标题 A/B 方案 |
| `$mai-copy` | 生成 Listing、五点、A+、标语、图片文案 |
| `$mai-rich` | 根据图片、草图、原型图、复杂需求生成文案 |
| `$mai-product` | 创建产品资料文件夹模板 |
| `$mai-brief` | 创建文案需求模板 |

## 安装

### 方式一：从 GitHub 安装

大多数用户先安装主入口就够了：

```text
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai
```

装好后重启 Codex，然后输入：

```text
使用 $mai
```

只安装 `$mai` 也能完成标题、Listing、五点、A+、图片文案、多语言输出、确认后保存等核心任务。先用它体验最简单。

检查已安装版本：

```bash
cat ~/.codex/skills/mai/VERSION
bun ~/.codex/skills/mai/scripts/check-version.ts
```

期望看到版本 `1.1.0`，并且 `Three-round workflow` 和 `CLI-friendly preview` 都是 `yes`。

如果你之前已经安装过旧版，`$skill-installer` 遇到已存在目录会停止，不会自动覆盖。要更新旧版，推荐下载项目后执行：

```bash
git clone https://github.com/RenderCoder/Mai.git
cd Mai
bun install
bun run install:codex -- --force
```

然后重启 Codex，再运行上面的版本检查命令。

如果你后续想要更明确的快捷入口，再按需安装：

```text
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-title
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-copy
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-rich
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-product
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-brief
```

> 注意：安装子入口前请先安装 `mai`。`mai-title`、`mai-copy` 和 `mai-rich` 会读取 `mai` 里的共享工作流规则。

### 方式二：下载项目后一键安装

在项目目录里运行：

```bash
bun install
bun run install:codex
```

然后重启 Codex。

Claude Code 用户可以在本地运行：

```bash
bun run dev
```

### 发布建议

- 给普通用户：优先把上面的 `$skill-installer` 安装说明放到 README、飞书/Notion 或团队知识库里。
- 给团队稳定使用：发布 GitHub Release，并在安装说明里写清楚版本号。
- 如果要把 Mai 作为 Codex 里的正式可安装包分发，建议后续打包成 Codex plugin。OpenAI 文档建议：本地写作和测试可以直接用 skill；要分发多个 skill，plugin 更合适。

## 最简单的用法

完整中文手册见：[docs/user-manual.zh-CN.md](docs/user-manual.zh-CN.md)。

### 1. 创建产品资料

```text
使用 $mai-product 创建 WT801 到 ~/my-products/
```

打开 `~/my-products/WT801/product.md`，把品牌、型号、规格、卖点、关键词填进去。你也可以继续把规格、FAQ、SEO 关键词、图片 brief、竞品资料、旧 Listing 等文档放进 `~/my-products/WT801/`，Mai 会在 `--product` 指向这个文件夹时递归读取。

### 2. 生成标题

```text
使用 $mai-title --product ~/my-products/WT801/
```

也可以不写参数：

```text
使用 $mai-title 帮我给新品写标题
```

Mai 会按顺序询问产品资料、平台、语言、长度、方案数量等缺失信息。

`--product` 可以传产品资料文件夹，也可以传单个 Markdown 文件。推荐使用文件夹，这样一个产品的所有资料都能放在同一个来源目录里。

### 3. 生成完整文案

```text
使用 $mai-copy --product ~/my-products/WT801/
```

### 4. 根据图片或草图生成文案

```text
使用 $mai-rich --product ~/my-products/WT801/
根据这张草图生成主图文案，英文主标题不超过 4 个词，副标题不超过 6 个词
```

## 新的交付规则

Mai 不会一上来就写文件。

如果信息不完整，它会像这样一次问一个问题：

```text
我需要先确认一个选项：你要生成哪类文案？
1. 标题/副标题
2. 五点描述
3. 完整 Listing
4. A+ 内容
5. 图片/草图文案
请回复数字即可。
```

每次生成文案时，它应该先在对话里给你看：

- 它对场景的理解
- 要输出哪些语言
- 当前假设和缺失信息
- 第一轮：初步版本
- 第二轮：反思自查与优化建议
- 第三轮：最终版本
- 文案预览，用编号方案和分组列表展示
- 字符数、词数、行数统计，用短列表展示
- 是否有二维排版风险
- 合规风险

如果产品资料、平台、语言、版位、数量限制或合规证据不清楚，它应该先问你确认，不能直接生成。

对话里会尽量避免 Markdown 表格，方便你在命令行里阅读和确认。你确认后，写入的 Markdown 文档可以使用表格，方便复制和对照。

你确认“没问题 / 可以 / 保存 / 写入”之后，它才会把结果写成 Markdown 文档。

写入的文档会带上下文，包括：

- 原始需求
- 场景理解
- 关键决策
- 最终文案
- 数量统计
- 合规检查
- 需要人工复核的事项

## 常用示例

典型完整用法：

```text
使用 $mai-rich --product ~/my-products/WT801/ --length minimal --languages CN,EN,DE,ES
根据我上传的草图生成亚马逊副图文案。
画面是一个智能浇水定时器连接两条水管，左边浇花坛，右边浇草坪。
目标用户是家庭园艺用户。
英文主标题不超过 4 个词，副标题不超过 6 个词，标签最多 3 个。
先给我看文案和字符统计，不要直接写文档。
```

Mai 会先回复理解确认、文案预览、字符/词数/行数统计和排版风险。你确认后，它再写入 Markdown 文档。

更适合普通用户的自然语言用法：

```text
使用 $mai-rich 帮我根据这张草图写亚马逊副图文案。
```

如果你没有说明语言、长度、平台或产品资料，Mai 会逐项询问，并让你回复数字。

## 长度档位

你可以用 `--length` 选择文案长度：

| 参数 | 中文说法 | 适合场景 |
| --- | --- | --- |
| `--length minimal` | 极简表达 | 主图、标签、按钮、小版位 |
| `--length medium` | 中等 | 副图、详情页模块、常规标题 |
| `--length full` | 完整 | Listing、A+、SEO 覆盖更完整的内容 |

也可以直接用中文说：

```text
使用 $mai-title --product ~/my-products/WT801/，长度用极简表达
```

生成 5 组标题方案：

```text
使用 $mai-title --product ~/my-products/WT801/ --count 5 --length medium
```

只生成五点描述：

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --length medium
```

生成 Amazon A+ 文案：

```text
使用 $mai-copy --product ~/my-products/WT801/ a-plus --length full
```

创建图片文案需求文件：

```text
使用 $mai-brief 创建 wt801-image2 到 ~/tasks/，类型 image-copy
```

根据需求文件生成：

```text
使用 $mai-rich --product ~/my-products/WT801/ --requirement ~/tasks/wt801-image2.md
```

指定语言：

```text
使用 $mai-copy --product ~/my-products/WT801/ --languages CN,EN,DE,ES
```

## 适合普通文员/设计师的建议

你可以直接这样说：

```text
使用 $mai-rich，根据这张图给我写亚马逊副图文案。
目标用户是家庭园艺用户。
英文主标题不超过 4 个词，副标题不超过 6 个词，标签最多 3 个。
长度用极简表达。
语言要中文、英文、德语、西语。
```

Mai 应该先确认理解，再给你结果和统计。你确认之后，它再保存文档。

## 开发命令

```bash
bun run validate
bun run test
bun run lint
bun run release:check
```

准发布或重新安装前运行：

```bash
bun run release:check
bun run install:codex -- --force
```

重新安装后重启 Codex。

## 旧入口说明

旧的长入口 `ecommerce-multilingual-copy` 文件仍保留在仓库中作兼容参考，但推荐新用户使用 `mai` 系列短入口。
