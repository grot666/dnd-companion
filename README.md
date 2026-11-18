# D&D 系列创作

维护个人创作体系的工具：**系列 → 世界 → 多部故事**，人物、地点与势力在故事之间共享，并记录它们在每部故事时间点的状态。D&D 第五版资料作为参考来源，作者在每个系列中决定采用、改编或不采用。跑团工具（角色卡、法术与物品目录）保留为辅助入口。

- 在线使用：**https://grot666.github.io/dnd-companion/**
- 博客入口：https://grot666.github.io/ （Projects）
- 无账号、无后端、无在线 AI。系列与收藏**保存在本浏览器（未同步到 GitHub）**。

## 结构

左侧导航（桌面可收起，手机为抽屉）分三组：**创作**（我的系列，以及每个系列的快捷入口）/ **参考资料**（资料条目、主题索引）/ **辅助**（跑团工具）。顶部 Tab 只切换当前对象的内容。

- 系列：概览 / 世界 / 人物 / 地点与势力 / 故事 / 时间线 / 采用的设定
- 人物、地点、势力：“基本资料”（所有故事共用）与每部故事中的状态（年龄、身份、状况、立场、所在地、外貌变化、此时知道的事等）。切换到后一部故事时显示“自《前作》以来的变化”和来自前作的原因。
- 故事：阅读 / 编辑 / 前作影响。阅读页可勾选“只显示公开内容”；前作影响页按前作事件分组列出它改变了谁、怎样改变，并可添加新的影响。
- 采用的设定：每个参考条目一张卡片，左边是参考资料摘要与来源（附使用方式），右边是本系列的决定（采用 / 改编 / 不采用 / 未决定）、本系列的设定与改编说明。

稳定链接（刷新或直接打开都能恢复内容）：

| 路径 | 内容 |
| --- | --- |
| `#/` | 我的系列 |
| `#/series/example-ashriver/overview` | 系列概览 |
| `#/series/example-ashriver/characters/c-suti?story=story-grey-bridge` | 人物在《灰桥》时的状态，以及自《渡口之火》以来的变化 |
| `#/series/example-ashriver/stories/story-grey-bridge?mode=influence` | 《灰桥》的前作影响 |
| `#/series/example-ashriver/stories/story-ferry-fire?pub=1` | 故事阅读，只显示公开内容 |
| `#/series/example-ashriver/adoptions/warlock` | 采用的设定中的某一条 |
| `#/library?cat=class&q=契约`、`#/entry/lich?tab=sources` | 参考资料；返回时恢复搜索、筛选与滚动位置 |
| `#/drafts` | 核实草稿（作者用，列出尚无一手出处的说法） |
| `#/tools`、`#/tools/spells` | 跑团工具 |

旧链接自动跳转：`#/browse` → 资料条目，`#/favorites` → 资料条目的收藏筛选，`#/projects/<id>/<tab>` → 对应系列的 Tab，v2 的 `#tools`、`#spells` 等 → 跑团工具。

## 示例系列

“烬川纪事（原创示例）”：一个世界（烬川河谷，川历纪年，盐税年代与重建年代），两部相隔十八年、共享人物的故事。

- 《渡口之火》（川历 418）：盐会焚烧渡口的走私仓；船工苏缇在火中与“渡影”立约救出弟弟阿岚；税务官柯伦交出账册。
- 《灰桥》（川历 436）：苏缇成了灰桥镇守，阿岚成了守灯誓团团长，柯伦流放归来作证，盐会会长梅蕾已死。
- 7 条前作影响把《渡口之火》的两个事件连到《灰桥》中的人物、地点与势力；人物在两部故事中有不同的画像与状态。
- 采用的设定示例：邪术师、堕影冥界、圣武士为“改编”，魔鬼为“不采用”，牧师为“未决定”（仅自己）。

## 参考资料

- 深度条目 20 条（职业、概念、生物、位面、势力），其余 SRD 职业与种族为简要条目；本轮没有增加条目数量。
- 正文只写能对照到可公开查阅出处的内容，出处以脚注列在条目末尾；本站的归纳放在“解读”框；2014 与 2024 版的差异写在“版本差异”中。
- 找不到一手出处的说法不出现在正文，集中在 `#/drafts`，每条写明已找到的线索、缺少的资料和原因。
- 核实状态、资料使用方式（授权）、作者是否采用、是否公开，分别记录：来源注明使用方式；采用与公开范围保存在系列中。
- “真名”是普通条目：依据 SRD 5.1 与 5.2.1 的异界之门（Gate）法术说明，没有作为全站主题。

## 系列数据

- 存档键 `dnd-workbench-v2`（zod 校验）。首次打开时，如果有第三轮的 `dnd-workbench-v1` 存档，每个项目转换为只有一部故事的系列（人物、关系、情节、地点、设定改编全部保留），旧存档原样保留不删除。读取失败时暂停自动保存并保留原始数据，可先导出原始存档。跑团工具继续使用 `wayfarer-5e-v1`，互不影响。
- 每个对象、状态、章节、事件、关系、影响、采用记录都有公开范围（公开 / 仅自己）。
- 导出：**导出 Markdown（公开内容）**（不含“仅自己”）、**导出 Markdown（全部）**、**导出 JSON**。Markdown 包含系列、世界与时代、已确定的设定、采用的设定（附参考来源）、人物 / 地点 / 势力的基本资料、每部故事的梗概、章节、此时的状态、事件（起因 / 冲突 / 后果）、人物关系与前作影响。
- JSON 导入先显示预览，追加而不覆盖（同 ID 时改用新 ID 并加“（导入）”），导入后可撤销；也能导入第三轮导出的项目 JSON。

## 插图

`public/art/` 中的 29 张插图是为本站生成的半写实数字绘画（WebP），不含文字、真实人物或现实宗教符号，不是官方美术。本轮新增 7 张用于示例系列（世界风景、418 年的渡口、436 年的灰桥、苏缇在两个时期的画像、阿岚与柯伦在 436 年的画像），并重画了牧师条目插图。页面按主体位置设置 `object-position`，避免裁掉主体。

## 规则数据与许可证

详见 [ATTRIBUTION.md](ATTRIBUTION.md)。来源为固定提交 `3b6da29a45b3b328c2409cf97a14e2507e291bf8` 的 5e-bits **2014 英文** JSON。原始表未修改，哈希位于 `src/data/manifest.json`，可执行 `python3 scripts/verify-data.py` 复核。数据已打包，无运行时 API 请求。规则 CC BY 4.0，原创代码 MIT，上游软件 MIT 声明另附。

This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

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

当前验证：**81 项单元测试 + 28 项桌面 / 手机浏览器测试**（14 个用例 × 桌面 1440px 与手机 375px）。浏览器测试覆盖完整创作流程：我的系列 → 世界 → 阅读《渡口之火》→ 苏缇在 418 年的状态 → 切换到《灰桥》看到变化与前作原因 → 修改基本资料（两部故事都更新）→ 修改《灰桥》中的状态（只影响《灰桥》）→ 添加前作影响 → 修改采用决定 → 刷新恢复 → 导出两种 Markdown 并检查内容（公开版不含“仅自己”）。另覆盖：阅读正文不出现编辑流程标签、核实草稿页、条目加入系列设定、深链接刷新、返回恢复搜索 / 筛选 / 滚动位置、第三轮存档迁移、JSON 导出 / 导入预览 / 撤销、导航与 375px 无横向溢出，以及跑团工具原有流程。

单元测试覆盖：条目只有“来源 / 解读”两类正文且来源段都有引用、正文不引用付费书目或社区帖子、草稿字段完整且不出现在正文、来源授权标签、2024 引用处写明版本、示例系列引用一致性与图片存在、状态差异与前作影响、编辑模型、存档迁移与损坏保护、导出与公开过滤、导入、路由往返与旧链接、文案规则，以及跑团工具的规则计算。截图在 `artifacts/screenshots/`，HTML 报告在 `playwright-report/`，均不提交版本控制。

安全说明：2026-11-18（Asia/Singapore）npm audit 报告开发依赖 picomatch `<=4.0.7` 的 extglob ReDoS（GHSA-fc5q-39xc-vjpf），传递影响 Vite / Vitest。当前 registry 无已修复的新版本，不为消除告警而降级到更旧工具链。仅构建 / 测试固定仓库文件模式，不接受外部 glob；生产发布物不运行这些 Node 开发工具。更新依赖时重新复核。

## CI/CD 与 GitHub Pages

`.github/workflows/pages.yml`：push main / PR / 手动触发 → Node 24 → `npm ci` → 类型检查 → 单测 → 构建 → Playwright 桌面与手机。只有 main 且所有检查通过才上传并部署 Pages；PR 只校验不部署。报告和截图保存为 Actions artifact（14 天）。部署单独 job，仅授予 `pages:write` 与 `id-token:write`。

仓库 Settings → Pages → Source 设为 **GitHub Actions**。Vite base 固定 `/dnd-companion/`；改仓库名时需同步修改。无需 secret、后端或自定义域名。
