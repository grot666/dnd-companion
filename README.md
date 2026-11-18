# D&D 设定资料库

D&D 第五版设定资料库与创作工作台，面向个人 ACG 创作（故事、游戏、角色、AI 对话角色与场景）。核心流程：浏览 / 搜索设定 → 理解概念与关联 → 收藏到创作项目 → 编写角色、关系与情节 → 导出 Markdown / JSON 给其他工具使用。跑团工具（角色卡、法术与物品目录）保留为辅助入口。

- 在线使用：**https://grot666.github.io/dnd-companion/**
- 博客入口：https://grot666.github.io/ （Projects）
- 无账号、无后端、无在线 AI。项目与收藏**保存在本浏览器（未同步到 GitHub）**。

## 结构

左侧一级导航（桌面可收起，手机为抽屉）：**首页 / 浏览资料 / 主题索引 / 我的项目 / 收藏**，辅助入口 **跑团工具**。顶部 Tab 只切换当前对象的内容（条目：正文 / 规则与数值 / 来源；项目：概览 / 角色 / 关系 / 情节 / 地点 / 设定改编）。

稳定链接（刷新或直接打开都能恢复内容）：

| 路径 | 内容 |
| --- | --- |
| `#/browse?cat=class&q=契约` | 浏览资料，分类与搜索词写在地址中；返回时恢复滚动位置 |
| `#/entry/true-name?tab=sources` | 条目详情 |
| `#/themes/secrets` | 主题 |
| `#/projects/<id>/characters?item=<角色id>` | 项目中的某个角色 |
| `#/favorites` | 收藏 |
| `#/tools`、`#/tools/spells` | 跑团工具（v2 的 `#tools`、`#spells` 等旧链接自动跳转） |

## 内容与可靠性

- **深度条目**（首批 20 条）：邪术师、圣武士、牧师、法师、游荡者；契约、誓言、灵魂与死亡、真名（核实案例）；魔鬼、恶魔、天界生物、巫妖；九层地狱、堕影冥界、外层位面；竖琴手、散塔林会（标注被遗忘的国度）；被遗忘的国度；侍僧。其余 7 个 SRD 职业与 9 个种族为简要条目。法术与物品保留在 SRD 目录中。
- 每段正文标明类型：**设定摘要**（附来源与页码）/ **编辑解读** / **待核实**。只依据非开放书目或二手资料的说法一律标为待核实，不转载原文。每个条目记录版本（2014 SRD 5.1；2024 SRD 5.2.1 未逐条核对）、世界观与来源。
- **真名**：SRD 5.1 全文没有 “true name”；能定位到的 5e 提及只涉及恶魔，来自 Monster Manual（2014）与 Xanathar's Guide（经二手资料定位，待核实）。条目写明适用范围，不作为通用规则。
- **主题索引**：权力与依附、契约与束缚、身份与秘密、信仰与义务、死亡与灵魂。主题说明为编辑解读，附适用条件、情境索引（人工标签检索）与相关条目。例如“掌握他人的秘密而获得影响力”可从“身份与秘密”和“权力与依附”找到，并连到真名、契约、邪术师、散塔林会、竖琴手、游荡者。

## 创作项目

- 项目包含角色（外貌、身份、经历、动机、欲望、秘密、能力、限制、相关设定）、有方向的关系（从谁指向谁、类型、具体内容）、情节（起因 / 冲突 / 后果，关联人物、地点与设定）、地点与设定改编。
- “收藏到项目”保留条目原文与来源，项目的“本项目采用 / 本项目改动”另行保存，不修改原条目。
- 每个项目可导出 **Markdown** 与 **JSON**；JSON 导入先显示预览，追加而不覆盖，导入后可撤销。
- 存档键 `dnd-workbench-v1`（zod 校验 + 迁移）；读取失败时暂停自动保存并保留原始数据，可先导出原始存档。跑团工具继续使用原有 `wayfarer-5e-v1`，两者互不影响。
- 示例项目“灰港契约（原创示例）”：人物、关系、情节均为原创，设定改编中写明与原条目的差异。

## 插图

`public/art/` 中的 22 张插图是为本站生成的半写实数字绘画（WebP），用于首页横幅、5 个主题与精选条目、示例项目。不含文字与真实人物，不是官方美术。每张图在页面中按主体位置设置 `object-position`，避免裁掉主体。

## 规则数据与许可证

详见 [ATTRIBUTION.md](ATTRIBUTION.md)。来源为固定提交 `3b6da29a45b3b328c2409cf97a14e2507e291bf8` 的 5e-bits **2014 英文** JSON。原始表未修改，哈希位于 `src/data/manifest.json`，可执行 `python3 scripts/verify-data.py` 复核。数据已打包，无运行时 API 请求。规则 CC BY 4.0，原创代码 MIT，上游软件 MIT 声明另附。

This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

## 开发与验证

Node.js 24 + npm，依赖锁定在 `package-lock.json`。

```sh
npm ci
npm run dev # http://localhost:5173/dnd-companion/
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run e2e
python3 scripts/verify-data.py
```

当前验证：**72 项单元测试 + 24 项桌面 / 手机浏览器测试**（12 个用例 × 桌面 1440px 与手机 375px）。浏览器测试覆盖完整创作流程（主题 → 条目 → 收藏到项目 → 角色与关系 → 情节 → 刷新恢复 → 导出 Markdown 并检查内容）、深链接刷新、返回时恢复搜索 / 筛选 / 滚动位置、旧存档兼容、JSON 导出 / 导入预览 / 撤销，以及跑团工具原有流程。

单元测试另覆盖条目来源完整性（每段设定摘要都有引用；依赖未核对书目的段落必须标为待核实）、主题链接、文案规则（禁用旧口号与第二人称）、项目校验 / 迁移 / 损坏存档保护、Markdown 与 JSON 导出、路由往返，以及属性 / 熟练 / HP / AC / 护甲 / 技能 / 购点 / 休息 / 法术位 / 数据校验 / 损坏存档；Playwright 同时检查桌面与 375px 手机建卡、生命管理、法术与物品、重载持久化、备份导入、复制 / 删除 / 自定义与检索。截图在 `artifacts/screenshots/`，HTML 报告在 `playwright-report/`，均不提交版本控制。

安全说明：2026-11-18（Asia/Singapore）npm audit 报告开发依赖 picomatch `<=4.0.7` 的 extglob ReDoS（GHSA-fc5q-39xc-vjpf），传递影响 Vite / Vitest。当前 registry 无已修复的新版本，不为消除告警而降级到更旧工具链。仅构建 / 测试固定仓库文件模式，不接受外部 glob；生产发布物不运行这些 Node 开发工具。更新依赖时重新复核。

## CI/CD 与 GitHub Pages

`.github/workflows/pages.yml`：push main / PR / 手动触发 → Node 24 → `npm ci` → 类型检查 → 单测 → 构建 → Playwright 桌面与手机。只有 main 且所有检查通过才上传并部署 Pages；PR 只校验不部署。报告和截图保存为 Actions artifact（14 天）。部署单独 job，仅授予 `pages:write` 与 `id-token:write`。

仓库 Settings → Pages → Source 设为 **GitHub Actions**。Vite base 固定 `/dnd-companion/`；改仓库名时需同步修改。无需 secret、后端或自定义域名。
