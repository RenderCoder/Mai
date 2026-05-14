# Mai 电商文案中文使用手册

这份手册给普通用户使用。你不需要懂命令行，也不需要记很多参数。只要记住：把一个产品的资料放进同一个文件夹，然后告诉 Mai 你要标题、Listing、五点、A+、图片文案还是需求模板。

Mai 默认用简体中文和你沟通。它会先在对话里给你看理解、文案、统计和风险；你确认“可以 / 保存 / 写入”之后，它才会把结果保存成 Markdown 文档。

## 1. Mai 能做什么

Mai 是一个给 Codex 和 Claude Code 使用的电商文案技能。它适合：

- 给 Amazon / AliExpress 产品写标题、副标题。
- 写完整 Listing、五点描述、A+ 模块、标语。
- 根据图片、草图、Figma 截图、详情页版位写图文案。
- 把中文卖点转成自然的英文、德语、西班牙语文案。
- 检查字数、词数、行数、二维版式风险。
- 检查合规风险，避免夸大、绝对化、没有依据的宣传。
- 把最终结果保存成带上下文的 Markdown 文档。

Mai 的默认输出语言是：

```text
中文、英文、德语、西班牙语
```

你也可以指定只要英文，或自定义语言。

## 2. 最短上手流程

### 第一步：创建产品资料文件夹

在 Codex 里输入：

```text
使用 $mai-product 创建 WT801 到 ~/my-products/
```

Mai 会创建：

```text
~/my-products/WT801/
└── product.md
```

打开 `product.md`，填入品牌、型号、规格、卖点、关键词等信息。

### 第二步：把更多资料放进同一个文件夹

你可以继续把资料放进 `~/my-products/WT801/`：

```text
~/my-products/WT801/
├── product.md
├── specs.md
├── faq.md
├── seo-keywords.csv
├── competitors.md
├── image-brief.md
└── old-listing.md
```

Mai 会递归读取这个文件夹里的文本资料。支持：

```text
.md, .txt, .csv, .json, .yaml, .yml
```

不建议放进这个文件夹作为资料源的内容：

- 图片、视频、压缩包等二进制文件。
- 与产品无关的文档。
- 过期且容易误导的资料，除非你明确标注“旧版 / 不再使用”。

### 第三步：生成文案

生成标题：

```text
使用 $mai-title --product ~/my-products/WT801/
```

生成完整 Listing：

```text
使用 $mai-copy --product ~/my-products/WT801/ full-listing
```

根据图片或草图生成副图文案：

```text
使用 $mai-rich --product ~/my-products/WT801/
根据这张草图写 Amazon 副图文案，英文主标题不超过 4 个词，副标题不超过 6 个词。
```

### 第四步：确认后保存

Mai 会先展示：

- 理解确认
- 当前假设
- 第一轮：初步版本
- 第二轮：反思自查与优化建议
- 第三轮：最终版本
- 文案预览
- 数量统计
- 合规与风险检查
- 待确认事项

你确认后输入：

```text
可以，保存
```

Mai 才会写入 Markdown 结果文档。

## 3. 安装方式

### 方式一：从 GitHub 安装

推荐先安装主入口体验：

```text
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai
```

安装后重启 Codex，然后输入：

```text
使用 $mai
```

只安装 `$mai` 已经可以完成大部分工作，包括标题、Listing、五点、A+、图片文案、多语言输出和确认后保存。

检查当前安装的版本：

```bash
cat ~/.codex/skills/mai/VERSION
bun ~/.codex/skills/mai/scripts/check-version.ts
```

如果版本是 `1.1.0`，并且看到：

```text
Three-round workflow: yes
CLI-friendly preview: yes
```

说明你安装的是包含“三轮反思流程”和“命令行友好预览”的版本。

如果你以前安装过旧版，`$skill-installer` 看到 `~/.codex/skills/mai` 已存在时会停止，不会自动覆盖。更新旧版建议使用本地安装方式：

```bash
git clone https://github.com/RenderCoder/Mai.git
cd Mai
bun install
bun run install:codex -- --force
```

然后重启 Codex，再检查版本。

如果你用熟了，想让入口更明确，再按需安装：

```text
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-title
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-copy
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-rich
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-product
使用 $skill-installer 安装 https://github.com/RenderCoder/Mai/tree/main/skills/mai-brief
```

注意：请先安装 `mai`，再安装其它 `mai-*` 子入口。`mai-title`、`mai-copy` 和 `mai-rich` 会读取 `mai` 里的共享工作流规则。

### 方式二：本地安装

在项目目录运行：

```bash
bun install
bun run install:codex
```

如果你之前已经安装过，想用最新版本覆盖：

```bash
bun run install:codex -- --force
```

安装后重启 Codex。

## 4. 六个入口怎么选

| 入口 | 什么时候用 | 示例 |
| --- | --- | --- |
| `$mai` | 不确定用哪个入口时 | `使用 $mai 帮我给这个产品写文案` |
| `$mai-title` | 标题、副标题、标题 A/B 测试 | `使用 $mai-title --product ~/my-products/WT801/` |
| `$mai-copy` | Listing、五点、A+、标语、常规图文案 | `使用 $mai-copy --product ~/my-products/WT801/ bullets` |
| `$mai-rich` | 图片、草图、Figma、复杂 brief、多文件上下文 | `使用 $mai-rich --product ~/my-products/WT801/ 根据这张图写副图文案` |
| `$mai-product` | 创建产品资料文件夹 | `使用 $mai-product 创建 WT801 到 ~/my-products/` |
| `$mai-brief` | 创建文案需求模板 | `使用 $mai-brief 创建 wt801-image2 到 ~/tasks/，类型 image-copy` |

如果你不确定，就用：

```text
使用 $mai
```

Mai 会根据你的描述判断要走标题、常规文案还是复杂图文案流程。

## 5. 产品资料文件夹怎么写

### 推荐目录结构

```text
~/my-products/WT801/
├── product.md
├── specs.md
├── selling-points.md
├── seo-keywords.csv
├── compliance.md
├── competitors.md
├── image-brief.md
└── old-listing.md
```

### `product.md` 建议包含什么

```markdown
# WT801 - 产品资料

## 基础信息

| 字段 | 值 |
| --- | --- |
| 品牌 |  |
| 型号 | WT801 |
| 品类 |  |
| 目标市场 |  |
| 平台 | Amazon |

## 核心技术规格

| 规格 | 值 |
| --- | --- |
| 电源 |  |
| 连接方式 |  |
| 防护等级 |  |
| 尺寸 |  |
| 重量 |  |

## 目标用户

-

## 关键卖点（按优先级）

1.
2.
3.
4.
5.

## SEO 关键词

### English
- Primary:
- Secondary:

### Deutsch
- Primary:
- Secondary:

### Espanol
- Primary:
- Secondary:

## 合规规则

-

## 禁止声明

-
```

### 多文件资料怎么组织

你可以按内容拆分：

```text
specs.md              放规格参数
faq.md                放用户常见问题
seo-keywords.csv      放关键词
competitors.md        放竞品对比
image-brief.md        放图片文案需求
old-listing.md        放旧版 Listing
compliance.md         放禁止词、认证依据、声明限制
```

Mai 会把它们合并成同一个产品上下文，并保留来源标题，例如：

```markdown
## source: specs.md
...

## source: seo-keywords.csv
...
```

这样你后续能知道某个事实来自哪个文件。

### 如果资料有冲突怎么办

例如：

- `specs.md` 说防护等级是 `IP65`
- `old-listing.md` 说产品是 `waterproof`

Mai 应该在“当前假设”或“待确认事项”里指出冲突，并使用更保守的表达，例如 `IP65 water-resistant`，而不是直接写 `waterproof`。

## 6. 常用任务示例

### 生成标题

```text
使用 $mai-title --product ~/my-products/WT801/
```

生成 5 组标题：

```text
使用 $mai-title --product ~/my-products/WT801/ --count 5
```

标题更短，适合图片主标题：

```text
使用 $mai-title --product ~/my-products/WT801/ --length minimal
用途是 Amazon 主图标题，英文不超过 4 个词。
```

偏 SEO 的 Listing 标题：

```text
使用 $mai-title --product ~/my-products/WT801/ --length full
用途是 Amazon Listing 标题，需要覆盖主要英文关键词。
```

### 生成五点描述

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --length medium
```

只要英文五点：

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --languages EN
```

### 生成完整 Listing

```text
使用 $mai-copy --product ~/my-products/WT801/ full-listing --length full
```

指定语言：

```text
使用 $mai-copy --product ~/my-products/WT801/ full-listing --languages CN,EN,DE,ES
```

### 生成 A+ 文案

```text
使用 $mai-copy --product ~/my-products/WT801/ a-plus --length full
```

补充模块要求：

```text
使用 $mai-copy --product ~/my-products/WT801/ a-plus
需要 1 个横幅模块、4 个特性模块、1 个对比模块。
整体语气专业、现代，不要太夸张。
```

### 生成标语

```text
使用 $mai-copy --product ~/my-products/WT801/ tagline --count 5 --length minimal
```

### 根据图片或草图生成文案

```text
使用 $mai-rich --product ~/my-products/WT801/
根据这张草图写 Amazon 副图文案。
画面是一个智能浇水定时器连接两条水管，左边浇花坛，右边浇草坪。
英文主标题不超过 4 个词，副标题不超过 6 个词，最多 3 个标签。
```

### 根据需求文件生成文案

先创建需求文件：

```text
使用 $mai-brief 创建 wt801-image2 到 ~/tasks/，类型 image-copy
```

填好 `~/tasks/wt801-image2.md` 后：

```text
使用 $mai-rich --product ~/my-products/WT801/ --requirement ~/tasks/wt801-image2.md
```

### 不想写参数时

你可以直接说：

```text
使用 $mai 帮我给 WT801 写一套 Amazon 英文五点。
产品资料在 ~/my-products/WT801/。
语气要专业、简洁，避免夸张。
```

Mai 会自己判断任务类型，并在缺少关键信息时一次问一个问题。

## 7. 长度档位怎么选

| 参数 | 中文说法 | 适合场景 |
| --- | --- | --- |
| `--length minimal` | 极简表达 | 主图、按钮、标签、包装、小版位 |
| `--length medium` | 中等 | 副图、详情页模块、常规标题、五点 |
| `--length full` | 完整 | Listing、A+、SEO 覆盖更完整的内容 |

示例：

```text
使用 $mai-rich --product ~/my-products/WT801/ --length minimal
```

也可以直接说：

```text
长度用极简表达，适合图片上排版。
```

## 8. 语言怎么指定

默认：

```text
CN,EN,DE,ES
```

只要英文：

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --languages EN
```

中文 + 英文：

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --languages CN,EN
```

自定义语言：

```text
使用 $mai-title --product ~/my-products/WT801/ --languages EN,FR,IT
```

注意：Mai 默认用简体中文和你解释、提问、审查；这不影响最终文案可以输出英文、德语、西语等目标语言。

## 9. Mai 会怎么提问

如果信息不完整，Mai 不会一次问很多问题。它会一次问一个选择题，例如：

```text
我需要先确认一个选项：你要生成哪类文案？
1. 标题/副标题
2. 五点描述
3. 完整 Listing
4. A+ 内容
5. 图片/草图文案
6. 标语/广告语
请回复数字即可。
```

你可以只回复：

```text
2
```

如果下一步还缺平台，它会继续问平台；如果缺语言，它再问语言。

## 10. Mai 会输出什么

在保存之前，Mai 应该先给你看：

```text
## 理解确认
- 产品资料来源：读取了 product.md、specs.md、seo-keywords.csv
- 目标平台：Amazon
- 文案类型：副图文案
- 目标用户：家庭园艺用户
- 核心卖点：双区控制、无需 Hub、远程 App、精准浇水

## 当前假设
- 未提供图片尺寸，默认副图常规横版版位。
- 英文主标题按 4 个词以内控制。
- 德语和西语通常更长，需要优先压缩标签文案。

## 第一轮：初步版本

方案 1：推荐
- 位置：主标题
  - 中文：远程安心浇水
  - 英语：Water From Anywhere
  - 德语：...
  - 西班牙语：...

- 位置：副标题
  - 中文：用 app 查看花园浇水状态
  - 英语：Check watering status from the app
  - 德语：...
  - 西班牙语：...

## 第二轮：反思自查与优化建议

- 英文主标题较短，适合图片版位。
- 德语和西语会更长，标签文案需要继续压缩。
- 不写 best、guaranteed、always 等不可验证承诺。
- 如果强调覆盖范围，必须说明“室内范围受户型影响”。

## 第三轮：最终版本

- 位置：主标题
  - 中文：随时查看家中气候
  - 英语：Check Home Climate Anytime
  - 德语：Raumklima jederzeit prüfen
  - 西班牙语：Consulta el clima del hogar

- 位置：副标题
  - 中文：用 app 查看温湿度变化
  - 英语：View temperature and humidity changes in the app
  - 德语：Temperatur und Luftfeuchtigkeit per App im Blick
  - 西班牙语：Consulta cambios de temperatura y humedad en la app

## 数量统计

- 主标题 / 英语
  - 字符数：19
  - 词数：3
  - 行数建议：1 行
  - 是否超限：否

- 副标题 / 英语
  - 字符数：34
  - 词数：6
  - 行数建议：1-2 行
  - 是否超限：否

## 合规与风险检查
- 不使用 all-weather、year-round、freeze-proof。
- Wi-Fi 6、2.4GHz、No Hub Required 来自产品资料。

## 待确认事项
- 是否更偏“远程安心”还是“无需网关省钱”？
- 确认后我再写入 Markdown 文档。
```

注意：Mai 在对话里会尽量避免 Markdown 表格，因为表格在命令行里不容易读。你确认后，保存下来的 Markdown 文档可以使用表格，方便复制、对照和交给设计同事。

你满意后再说：

```text
没问题，保存
```

## 11. 保存规则

Mai 不会一开始就写文件。它会等你确认。

保存路径优先级：

1. 如果你明确说“保存到某个文件”，就保存到你指定的文件。
2. 如果使用了 `--requirement`，保存到需求文件同目录。
3. 如果只使用了 `--product` 文件夹，保存到产品文件夹内。
4. 如果无法判断保存位置，Mai 会问你保存到哪里。

例子：

```text
产品资料：~/my-products/WT801/
文案类型：title
日期：2026-05-13
```

结果可能保存为：

```text
~/my-products/WT801/WT801_title_result_20260513.md
```

如果同名文件已存在，会自动追加时间：

```text
WT801_title_result_20260513_1430.md
```

## 12. 结果文档里有什么

保存后的 Markdown 文档应包含：

- 产品资料源路径。
- 已读取的产品资料文件清单。
- 原始需求摘要。
- 场景理解。
- 关键决策。
- 最终文案表。
- 数量统计表。
- 合规与风险检查。
- 需要人工复核的事项。

这样做的好处是：以后你或同事打开结果文件，不只看到文案，还能看到它是基于什么资料、什么限制、什么判断生成的。

## 13. 给不同角色的建议

### 运营

常用：

```text
使用 $mai-copy --product ~/my-products/WT801/ full-listing --length full
```

建议你在产品资料文件夹里放：

- 关键词表。
- 竞品对比。
- 旧 Listing。
- 平台限制。
- 禁止声明。

### 设计师

常用：

```text
使用 $mai-rich --product ~/my-products/WT801/
根据这张版式图写副图文案，文字要短，适合放在图片上。
```

建议你说明：

- 图片用途：主图、副图、详情页、A+、包装。
- 文案放在哪里。
- 每块文字最多几行。
- 英文标题最多几个词。
- 标签最多几个。

### 文员

常用：

```text
使用 $mai-product 创建 WT801 到 ~/my-products/
```

然后把资料复制到 `product.md`，如果不知道怎么填，先填你知道的内容。Mai 会根据缺失信息继续问你。

## 14. 常见问题

### 我必须用参数吗？

不必须。你可以直接用自然语言：

```text
使用 $mai 帮我写 WT801 的 Amazon 五点，产品资料在 ~/my-products/WT801/。
```

### 产品资料必须只有一个文件吗？

不需要。推荐一个产品一个文件夹，里面可以放多个文件。Mai 会递归读取。

### 我可以继续用单个 `.md` 产品文件吗？

可以。单个 Markdown 文件保留兼容。但推荐使用文件夹，因为更适合导入多份产品资料。

### Mai 会直接帮我保存文件吗？

生成文案时不会直接保存。它会先展示结果，你确认后才保存。

创建模板时，例如 `$mai-product` 和 `$mai-brief`，会直接创建模板文件；如果目标文件已存在，它不应该直接覆盖。

### 为什么它一直问我问题？

Mai 只会在缺少关键参数时问，例如不知道平台、语言、文案类型、产品资料、版式限制。你可以在一开始说得更完整，减少追问。

### 我上传图片后还需要写描述吗？

建议写。图片和草图的文案质量很依赖版位信息。你可以补充：

```text
这是 Amazon 第二张副图，横版。左边是产品，右边放标题和 3 个标签。英文主标题不超过 4 个词。
```

### 德语和西语太长怎么办？

Mai 会提示字符膨胀和排版风险，并给出更短版本或断行建议。图片文案建议优先用 `--length minimal`。

### 合规检查能完全替代人工审核吗？

不能。Mai 会做风险提示，但最终上线前仍建议人工复核，尤其是认证、测试数据、医疗/健康、安全、极限词、平台政策相关内容。

### 结果文件会不会被下次当成产品资料读取？

不会。产品资料文件夹读取时会忽略类似 `*_result_*.md` 的已生成结果文件。

## 15. 推荐提示词模板

### 标题模板

```text
使用 $mai-title --product ~/my-products/WT801/ --count 5 --length medium
平台是 Amazon。
标题要自然，不要关键词堆砌。
英文标题尽量控制在 180 字符以内。
```

### 五点模板

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --length medium
语言要 CN,EN,DE,ES。
重点卖点顺序：精准浇水、双区控制、无需 Hub、太阳能供电、耐用接口。
语气专业、清晰，不要夸张。
```

### A+ 模板

```text
使用 $mai-copy --product ~/my-products/WT801/ a-plus --length full
需要：
1 个横幅标题和副标题
4 个特性模块
1 个对比模块
语言要 CN,EN,DE,ES。
```

### 图片文案模板

```text
使用 $mai-rich --product ~/my-products/WT801/ --length minimal
根据这张草图写 Amazon 副图文案。
画面：产品连接两条水管，左边浇花坛，右边浇草坪。
目标用户：家庭园艺用户。
英文主标题不超过 4 个词，副标题不超过 6 个词，标签最多 3 个。
先给我看文案和字符统计，不要直接写文档。
```

### 改写旧文案模板

```text
使用 $mai-copy --product ~/my-products/WT801/ bullets --length medium
请优化下面这版旧五点，让英文更自然，德语和西语不要像机翻。
同时检查是否有合规风险。

[粘贴旧文案]
```

## 16. 发布前给团队用户的说明

如果你要把 Mai 发给团队使用，建议告诉用户三件事：

1. 一个产品一个文件夹，所有资料都放进去。
2. 用 `$mai-product` 创建产品资料文件夹，用 `$mai-brief` 创建需求文件。
3. 生成文案时先看结果和风险，确认后再保存。

给团队的最短说明可以是：

```text
先用 $mai-product 建产品资料文件夹，把产品规格、卖点、关键词、竞品、旧文案都放进去。
写标题用 $mai-title，写 Listing/五点/A+ 用 $mai-copy，看图写文案用 $mai-rich。
Mai 会先用中文说明理解、输出多语言文案和统计，确认后才保存结果文件。
```
