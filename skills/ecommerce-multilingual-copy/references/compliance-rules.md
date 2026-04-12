# 电商文案合规规则

本文件定义了多语言电商文案的通用合规红线。产品知识库中的"合规覆写规则"可对特定条目进行覆盖。

## 一、通用禁止语（所有产品、所有语言、所有平台适用）

### 1.1 极限词 / 绝对化表述

**严格禁止**以下词语及其对应的德语/西班牙语/中文翻译：

| 英语 | 德语 | 西班牙语 | 中文 |
|------|------|----------|------|
| best | beste/r/s | mejor | 最好的 |
| perfect | perfekt | perfecto | 完美 |
| No.1 / #1 | Nr. 1 | N.° 1 | 第一 |
| unique / only | einzigartig / einzig | unico / solo | 唯一 |
| guaranteed | garantiert | garantizado | 保证 |
| 100% | 100% | 100% | 百分百 |
| always | immer | siempre | 总是/永远 |
| never (fails) | nie | nunca | 绝不 |
| absolutely | absolut | absolutamente | 绝对 |
| revolutionary | revolutionar | revolucionario | 革命性的 |

### 1.2 不可验证最高级

禁止：most advanced, first-ever, industry-leading, world's best, unmatched, unparalleled

### 1.3 时效促销语

禁止：limited time, sale, discount, hurry, act now, while supplies last

## 二、合规替代用语

| 禁止表述 | 推荐替代 |
|----------|----------|
| the best | a top-rated / highly rated |
| perfect for | designed for / ideal for / great for |
| guaranteed to | engineered to / built to |
| 100% waterproof | water-resistant (IP65) |
| always works | reliable performance |
| never breaks | durable construction / built to last |
| unlimited | long-lasting / extended |

**核心原则**：使用 "designed to", "helps", "engineered for", "up to" 替代绝对表述。数字声明须注明测试条���（例："up to 6 months battery life under normal use conditions"）。

## 三、平台特定规则

### 3.1 Amazon

| 字段 | 限制 |
|------|------|
| Title (标题) | max 200 字符(EN)；无促销短语；无 HTML；品牌名前置 |
| Bullet Point (要点) | max 1000 字符/条；大写关键词短语开头；禁止 HTML |
| Description (描述) | max 2000 字符 |

**Amazon 禁止内容**：
- 标题中的 emoji
- "Free shipping" / 运费相关
- 价格引用
- "Amazon's Choice" / "Best Seller" 等平台标签
- 竞品品牌名称（对比类文案除外）

### 3.2 AliExpress（参考）

- 标题允许 emoji
- 促销语限制较宽松
- 字符限制不同，具体按品类

## 四、产品可覆写机制

产品知识库中可通过"合规覆写规则"表格覆盖以下通用规则：

- `ip_rating: IP67+` → 可启用 "waterproof" 声明
- `certified_test_data: true` → 可声明具体电池续航/性能数字
- `freeze_resistant: true` → 可使用全天候/全年表述
- `professional_grade: true` → 可声明专业级

**覆写优先级**：产品知识库 > 通用规则。但极限词（1.1 节）不可覆写，任何情况下都禁止使用。
