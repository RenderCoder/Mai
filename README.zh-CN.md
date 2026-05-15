# Mai 电商文案

Mai 是给 **Codex** 和 **Claude Code** 使用的电商多语言文案技能。

“Mai” 是“卖”的拼音。普通用户只需要记住一个入口：`$mai`。

Mai 可以完成：

- 标题、副标题、标题 A/B 方案。
- Listing、五点描述、A+、标语、图片文案。
- 根据图片、草图、原型图、Figma 截图、复杂 brief 写文案。
- 创建产品资料文件夹模板和文案需求模板。
- 检查版本，并提示如何用 shell 更新到最新版。

## 安装

在 Codex 里输入：

```text
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai
```

安装后重启 Codex，然后输入：

```text
使用 $mai
```

只安装 `$mai` 就够了。不要让普通用户再安装其它复杂入口。

## 检查版本

在 Codex 里可以直接说：

```text
使用 $mai 检查版本
```

Mai 会优先运行这个 shell 命令：

```bash
sh ~/.codex/skills/mai/scripts/check-version.sh
```

期望版本：`1.1.4`。检查结果应显示：

```text
Double-reflection workflow: yes
CLI-friendly preview: yes
Chinese-first copy: yes
Short-word layout: yes
```

如果显示不是最新版，先退出 Codex，再在系统终端运行：

```bash
sh ~/.codex/skills/mai/scripts/update-installed.sh
```

这个更新脚本只依赖 macOS 默认可用的 shell、curl、tar、cp 和 mv，不要求普通用户安装 Bun、Python 或其它开发环境。更新后重启 Codex。

## 最短上手

### 1. 准备产品资料目录

建议把所有产品放进一个产品资料根目录，例如 `~/my-products/`，每个产品一个子目录：

```text
~/my-products/
├── WT801/
└── WT802/
```

新手推荐在 `~/my-products/` 这个根目录打开 Codex。生成文案时，不要只依赖当前目录；每次都明确写出具体产品目录，例如 `--product ~/my-products/WT801/`。

### 2. 创建产品资料

```text
使用 $mai 创建 WT801 产品资料到 ~/my-products/
```

打开 `~/my-products/WT801/product.md`，把品牌、型号、规格、卖点、关键词填进去。也可以继续把规格、FAQ、SEO 关键词、图片 brief、竞品资料、旧 Listing 等文档放进同一个产品文件夹。

### 3. 生成标题

```text
使用 $mai --product ~/my-products/WT801/ 生成 5 组 Amazon 标题，长度用中等。
```

### 4. 生成完整 Listing

```text
使用 $mai --product ~/my-products/WT801/ 生成完整 Listing，语言要中文、英文、德语、西语。
```

### 5. 根据图片或草图写文案

```text
使用 $mai --product ~/my-products/WT801/ 根据这张草图写 Amazon 副图文案。
英文主标题不超过 4 个词，副标题不超过 6 个词，标签最多 3 个。
长度用极简表达。
```

## 交付规则

Mai 不会一上来就写文件。

如果信息不完整，它会一次只问一个选择题，你回复数字即可：

```text
我需要先确认一个选项：你要生成哪类文案？
1. 标题/副标题
2. 五点描述
3. 完整 Listing
4. A+ 内容
5. 图片/草图文案
请回复数字即可。
```

每次生成文案时，Mai 必须先在对话中展示：

- 理解确认。
- 当前假设。
- 第一步：初步版本。
- 第二步：第一次反思自查与优化建议。
- 第三步：修正版。
- 第四步：第二次反思与最终调整建议。
- 第五步：最终版本。
- 外语回译核对。
- 数量统计。
- 合规与风险检查。
- 待确认事项。

为了方便命令行阅读，对话预览里尽量不用 Markdown 表格。你确认“可以 / 保存 / 写入”之后，Mai 才会把结果写入 Markdown 文档；写入文档时最终文案、外语回译核对和数量统计必须使用 Markdown 表格，方便复制、对照和多语言校对。

## 中文优先

Mai 面向中文团队。无论你是否要求中文，文案结果都必须先输出简体中文审核版，再输出其它语言。

例如你说：

```text
使用 $mai --product ~/my-products/WT801/ 生成英文和德语五点。
```

实际输出顺序是：

```text
简体中文 -> 英语 -> 德语
```

外语终稿后还会增加回译核对。例如德语终稿会再翻译回简体中文，让中文团队确认它是否表达了原本意思。

## 长度选择

可以直接用自然语言说：

- 极简表达：适合主图、标签、按钮、小版位。
- 中等：适合副图、详情页模块、常规标题、五点。
- 完整：适合 Listing、A+、SEO 覆盖更完整的内容。

示例：

```text
使用 $mai --product ~/my-products/WT801/ 写图片文案，长度用极简表达。
```

## 适合普通用户的提示词

```text
使用 $mai 帮我根据这张草图写亚马逊副图文案。
产品资料在 ~/my-products/WT801/。
目标用户是家庭园艺用户。
英文主标题不超过 4 个词，副标题不超过 6 个词，标签最多 3 个。
语言要中文、英文、德语、西语。
先给我看文案和统计，不要直接写文档。
```

## 开发者命令

普通用户不需要运行这些命令。

```bash
bun install
bun run validate
bun run test
bun run lint
bun run release:check
```

开发者本地安装到 Codex：

```bash
bun run install:codex -- --force
```

## 旧入口说明

旧的长入口和历史子入口文件仍保留在仓库中作兼容参考。新用户只安装和使用 `$mai`。
