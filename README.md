# 旅人手札 · D&D 5E Companion

一张安静、实用、能陪你上桌的中文角色卡。**2014 版 D&D 5e · SRD 5.1**，与 2024 规则不混用。

- 在线使用：**https://grot666.github.io/dnd-companion/**
- 博客入口：https://grot666.github.io/ （Projects）
- 无账号、无后端。规则数据本地打包；打开后浏览不依赖第三方规则 API。

## 第一场冒险

1. 点击「新的旅人」，填写姓名，选择种族、单职业、背景和职业技能。
2. 使用标准数组（15/14/13/12/10/8）或 27 点购点，完成基础建卡。
3. 在「角色总览」管理属性、技能、豁免、HP、临时 HP、生命骰、死亡豁免和状态。
4. 从「法术典籍」添加法术，在「我的法术」标记准备状态和已用法术位。
5. 从「装备宝库」添加物品，在行囊管理数量、装备和五类钱币。
6. 「笔记与设置」可修改等级、背景、名字，覆盖 HP / AC / 先攻，复制或确认删除角色。
7. 右上角下载图标导出 **全部角色 JSON 备份**；上传图标校验后导入，确认后替换本机记录。

手机支持 375px 宽屏，页面「当前旅人」下拉切换角色。桌面侧栏选择角色。打印按钮输出全部角色分区（当前角色），不打印应用导航。

## 已实现

- 多角色 CRUD、复制、删除确认；三步创建向导。
- 9 个 SRD 基础种族、12 个单职业、侍僧背景 / 自定义背景；标准数组唯一性与购点范围 / 成本校验。
- 固定种族加值、属性调整值、等级熟练、可编辑技能 / 专精 / 豁免、被动察觉。
- HP 首级满骰、后续固定平均（每级至少 1）；体质变动后重算最大值。当前 HP 不随升级自动增加。
- 普通护甲 / 盾牌、敏捷上限、野蛮人 / 武僧无甲防御；HP / AC / 先攻手动覆盖。
- 伤害先扣临时 HP、治疗上限、生命骰、死亡豁免、状态标记。
- 短休输入生命骰和手动骰点结果；邪术师契约位恢复。长休恢复 HP、普通法术位、半数总生命骰（向下取整，最少 1），重置死亡豁免，清空临时 HP。
- 319 道法术，支持名称 / 原文检索、环阶 / 职业 / 学派筛选、专注与仪式标记、英文完整描述、升环描述与材料。
- 237 件普通装备 + 362 件魔法物品；分类检索、详细规则与价格 / 重量 / 护甲 / 伤害属性。
- 法术书 / 已知法术、准备标记、基础单职业法术位、手动位上限覆盖；行囊数量 / 装备 / 钱币、常规负重参考。
- 自定义法术 / 物品，明确标记「非 SRD」；角色笔记；打印样式。
- localStorage v1 版本化 Zod schema、备份校验、文件大小 / 条目数 / 数值范围限制。未知备份版本拒绝导入，后续版本必须明确迁移，不猜测旧数据。损坏存档暂停自动覆盖，可下载原始内容；配额失败显著告警。

## 明确边界（请先读）

这是**基础角色卡 + 可编辑资源管理器**，不是全自动建卡器 / 完整规则裁判。

- SRD 5.1 不含所有玩家手册选项，开放背景只有侍僧。未复制非 SRD 内容。
- 亚种族、半精灵自选加值、种族附加熟练与语言、子职、专长、升级能力、兼职、职业次数资源、起始装备 / 金币需自行核对 / 填写。
- 创建只分配首级基础卡；侍僧自动给洞悉 / 宗教，背景与职业熟练重复时请手动改选。
- 装备不自动授予熟练；多套护甲取最高数值而非合法性判断；魔法加值 / 同调 / 魔法护甲 / 法师护甲等效果请使用覆盖。
- 法术添加和准备不限制职业资格、已知 / 准备数量。施法 DC / 攻击按职业默认属性参考，无施法职业也可记录法术但不因此获得资格。
- 法术位来自 2014 SRD 等级表。子职施法、兼职施法、灵活施法和高阶秘法不自动处理。
- 状态只标记，不应用数值修正。专注 / 抗性 / 瞬死 / 死亡豁免掷骰 / 力竭等级 / 职业资源恢复由玩家与 DM 判断。
- 短休 / 长休时间及资格请自行确认，长休不会自动消除疾病、状态或力竭。
- 容量按中 / 小型常规力量 × 15 lb 参考，不计强大体型、金币、容器嵌套与变体负重；未知重量按 0。
- 界面中文，部分常用条目有本项目辅助中文译名，**不是官方译本**。具体机制保留英文 SRD 原文，未承诺全部汉化。

## 存档与隐私

**所有角色只存在当前设备、当前浏览器、当前站点的 localStorage。不会上传或跨设备同步。** 清理站点数据 / 无痕窗口关闭 / 更换浏览器都会丢失或隔离记录。请常导出备份，再在另一台设备导入。勿在共享浏览器保存敏感个人信息。

导入使用严格的 v1 类型与范围校验，先解析后确认，失败不覆盖当前存档。支持最多 100 个角色、5 MB 文件。UI 文字以 React 文本渲染，不解析笔记 HTML。应用没有埋点或远程字体请求。

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

单元测试覆盖属性 / 熟练 / HP / AC / 护甲 / 技能 / 购点 / 休息 / 法术位 / 数据校验 / 损坏存档；Playwright 同时检查桌面与 375px 手机建卡、生命管理、法术与物品、重载持久化、备份导入、复制 / 删除 / 自定义与检索。截图在 `artifacts/screenshots/`，HTML 报告在 `playwright-report/`，均不提交版本控制。

安全说明：2026-11-18（Asia/Singapore）npm audit 报告开发依赖 picomatch `<=4.0.7` 的 extglob ReDoS（GHSA-fc5q-39xc-vjpf），传递影响 Vite / Vitest。当前 registry 无已修复的新版本，不为消除告警而降级到更旧工具链。仅构建 / 测试固定仓库文件模式，不接受外部 glob；生产发布物不运行这些 Node 开发工具。更新依赖时重新复核。

## CI/CD 与 GitHub Pages

`.github/workflows/pages.yml`：push main / PR / 手动触发 → Node 24 → `npm ci` → 类型检查 → 单测 → 构建 → Playwright 桌面与手机。只有 main 且所有检查通过才上传并部署 Pages；PR 只校验不部署。报告和截图保存为 Actions artifact（14 天）。部署单独 job，仅授予 `pages:write` 与 `id-token:write`。

仓库 Settings → Pages → Source 设为 **GitHub Actions**。Vite base 固定 `/dnd-companion/`；改仓库名时需同步修改。无需 secret、后端或自定义域名。
