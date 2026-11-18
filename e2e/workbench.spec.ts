import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const shot = (page: Page, project: string, name: string, fullPage = false) =>
  page.screenshot({ path: `artifacts/screenshots/${project}-${name}.png`, fullPage });
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

async function readDownload(page: Page, click: () => Promise<void>) {
  const wait = page.waitForEvent("download");
  await click();
  const d = await wait;
  return { name: d.suggestedFilename(), text: readFileSync((await d.path())!, "utf8") };
}

test("theme → entry → favorite → character + relationship → plot → refresh → Markdown", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#/themes");
  await expect(page.getByRole("heading", { name: "主题索引", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: /身份与秘密/ }).first().click();
  await expect(page).toHaveURL(/#\/themes\/secrets$/);
  const scenario = page.locator(".wb-scenario", { hasText: "掌握他人的秘密而获得影响力" });
  await expect(scenario).toBeVisible();
  await expect(scenario.getByRole("link", { name: "散塔林会" })).toBeVisible();
  await shot(page, info.project.name, "flow-1-theme");
  await scenario.getByRole("link", { name: "真名" }).click();
  await expect(page).toHaveURL(/#\/entry\/true-name$/);
  await expect(page.getByRole("heading", { name: /真名/, level: 1 })).toBeVisible();
  await expect(page.getByText("待核实").first()).toBeVisible();
  await expect(page.getByText("设定摘要").first()).toBeVisible();
  await shot(page, info.project.name, "flow-2-entry");

  await page.getByRole("button", { name: "收藏到项目" }).click();
  const dlg = page.getByRole("dialog", { name: "收藏到项目" });
  await dlg.getByLabel("新建项目").check();
  await dlg.getByLabel("新项目名称").fill("雾港密约");
  await dlg.getByRole("button", { name: "确认收藏" }).click();
  await expect(page.getByRole("status")).toContainText("已收藏到“雾港密约”");
  await page.getByRole("link", { name: "打开项目设定" }).click();
  await expect(page.getByRole("heading", { name: /雾港密约/, level: 1 })).toBeVisible();
  const adapt = page.getByTestId("adaptation").filter({ hasText: "真名" });
  await expect(adapt).toContainText("不是 D&D 的通用规则");
  await adapt.getByLabel("本项目改动").fill("在本项目中，凡人的真名也能被契约利用（原创改编）。");

  // characters
  await page.getByRole("tab", { name: /角色/ }).click();
  await page.getByRole("button", { name: "添加角色" }).click();
  await page.getByLabel("名称", { exact: true }).fill("林雾");
  await page.getByLabel("身份", { exact: true }).fill("港口抄写员");
  await page.getByLabel("秘密", { exact: true }).fill("曾替人伪造过一份契约");
  await page.getByRole("button", { name: "添加角色" }).click();
  await page.getByLabel("名称", { exact: true }).fill("纪安");
  await page.getByLabel("动机", { exact: true }).fill("想控制港口的消息来源");
  await expect(page.getByRole("list", { name: "角色列表" }).getByRole("button")).toHaveCount(2);

  // relationship
  await page.getByRole("tab", { name: /关系/ }).click();
  const form = page.getByRole("form", { name: "添加关系" });
  await form.getByLabel("从").selectOption({ label: "纪安" });
  await form.getByLabel("关系类型").selectOption("掌握秘密");
  await form.getByLabel("指向").selectOption({ label: "林雾" });
  await form.getByLabel("具体内容").fill("纪安知道林雾伪造契约的事，以此要她抄出名单。");
  await form.getByRole("button", { name: "添加关系" }).click();
  await expect(page.getByTestId("relationship")).toContainText("纪安 → 林雾");

  // location + plot
  await page.getByRole("tab", { name: /地点/ }).click();
  await page.getByRole("button", { name: "添加地点" }).click();
  await page.getByLabel("名称", { exact: true }).last().fill("旧码头");
  await page.getByRole("tab", { name: /情节/ }).click();
  await page.getByRole("button", { name: "添加情节" }).click();
  await page.getByLabel("标题").fill("名单");
  await page.getByLabel("起因").fill("纪安以秘密要挟林雾。");
  await page.getByLabel("冲突").fill("名单上有林雾的恩人。");
  await page.getByLabel("后果").fill("未定。");
  await page.getByRole("group", { name: "关联人物" }).getByLabel("林雾").check();
  await page.getByRole("group", { name: "关联人物" }).getByLabel("纪安").check();
  await page.getByRole("group", { name: "关联地点" }).getByLabel("旧码头").check();
  await page.getByLabel("添加关联设定").selectOption({ label: "真名 True Name" });
  await expect(page.getByTestId("save-status")).toContainText("保存在本浏览器（未同步到 GitHub）");
  await expect(page.getByTestId("save-status")).toContainText("已保存");
  await shot(page, info.project.name, "flow-3-plot");

  // refresh restores the deep link and the data
  await page.reload();
  await expect(page.getByLabel("标题")).toHaveValue("名单");
  await expect(page.getByRole("group", { name: "关联地点" }).getByLabel("旧码头")).toBeChecked();
  await page.getByRole("tab", { name: /关系/ }).click();
  await expect(page.getByTestId("relationship")).toContainText("纪安知道林雾伪造契约的事");

  const md = await readDownload(page, () => page.getByRole("button", { name: "导出 Markdown" }).click());
  expect(md.name).toBe("雾港密约.md");
  expect(md.text).toContain("# 雾港密约");
  expect(md.text).toContain("### 林雾");
  expect(md.text).toContain("- **秘密**：曾替人伪造过一份契约");
  expect(md.text).toContain("纪安 → 林雾｜掌握秘密：纪安知道林雾伪造契约的事");
  expect(md.text).toContain("### 名单");
  expect(md.text).toContain("- **地点**：旧码头");
  expect(md.text).toContain("### 真名（True Name）");
  expect(md.text).toContain("**本项目改动**：在本项目中，凡人的真名也能被契约利用（原创改编）。");
  expect(md.text).toContain("https://www.dndbeyond.com/attachments/39j2li89/SRD5.1-CCBY4.0_License_live%20links.pdf");
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("deep links survive refresh", async ({ page }) => {
  await page.goto("#/entry/lich?tab=sources");
  await expect(page.getByRole("heading", { name: /巫妖/, level: 1 })).toBeVisible();
  await expect(page.getByRole("tab", { name: "来源" })).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await expect(page.getByRole("tab", { name: "来源" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Monster Manual（2014）").first()).toBeVisible();
  await page.goto("#/projects/example-greyharbor/characters?item=c-marco");
  await page.reload();
  await expect(page.getByLabel("名称", { exact: true })).toHaveValue("马尔科·韦斯（Marco Vess）");
  await page.goto("#/themes/death");
  await page.reload();
  await expect(page.getByRole("heading", { name: /死亡与灵魂/, level: 1 })).toBeVisible();
  await page.goto("#/entry/not-a-thing");
  await expect(page.getByRole("heading", { name: "找不到这个条目" })).toBeVisible();
});

test("browse keeps search, filter and scroll position on back", async ({ page }, info) => {
  await page.goto("#/browse");
  await page.getByRole("button", { name: "职业", exact: true }).click();
  await expect(page).toHaveURL(/cat=class/);
  await expect(page.getByText("12 个条目")).toBeVisible();
  await page.getByLabel("搜索资料").fill("师");
  await expect(page).toHaveURL(/cat=class&q=%E5%B8%88/);
  const count = await page.locator(".wb-result-count").textContent();
  await page.getByLabel("搜索资料").fill("");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(250);
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(300);
  await shot(page, info.project.name, "browse");
  await page.locator(".wb-card", { hasText: "野蛮人" }).click();
  await expect(page.getByRole("heading", { name: /野蛮人/, level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page.getByRole("button", { name: "职业", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y - 40);
  // search term restored on back
  await page.getByLabel("搜索资料").fill("契约");
  await page.locator(".wb-card", { hasText: "邪术师" }).first().click();
  await page.goBack();
  await expect(page.getByLabel("搜索资料")).toHaveValue("契约");
  expect(count).toContain("个条目");
});

test("old saves keep working: tabletop tools, v2 hashes and partial workbench saves", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("dnd-workbench-v1"))
      localStorage.setItem("dnd-workbench-v1", JSON.stringify({ version: 1, projects: [{ id: "legacy", name: "旧版项目", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }] }));
  });
  await page.goto("#tools");
  await page.getByRole("button", { name: "新的旅人", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("角色姓名").fill("老存档");
  await d.getByText("奥秘", { exact: true }).check();
  await d.getByText("历史", { exact: true }).check();
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "创建角色", exact: true }).click();
  await expect(page.getByRole("heading", { name: "老存档", exact: true })).toBeVisible();
  const before = await page.evaluate(() => localStorage.getItem("wayfarer-5e-v1"));
  await page.goto("#/projects");
  await expect(page.getByRole("link", { name: /旧版项目/ })).toBeVisible();
  await page.getByRole("link", { name: /旧版项目/ }).click();
  await page.getByLabel("项目简介").fill("迁移后可编辑");
  await page.goto("#/tools");
  await expect(page.getByRole("heading", { name: "老存档", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("wayfarer-5e-v1"))).toBe(before);
  const wb = await page.evaluate(() => JSON.parse(localStorage.getItem("dnd-workbench-v1")!));
  expect(wb.favorites).toEqual([]);
  expect(wb.projects[0].summary).toBe("迁移后可编辑");
});

test("JSON export → import preview → undo, and malformed import", async ({ page }) => {
  await page.goto("#/projects/example-greyharbor/overview");
  const json = await readDownload(page, () => page.getByRole("button", { name: "导出 JSON" }).click());
  expect(JSON.parse(json.text).project.relationships).toHaveLength(5);
  await page.goto("#/projects");
  await page.getByTestId("import-file").setInputFiles({ name: "p.json", mimeType: "application/json", buffer: Buffer.from(json.text) });
  const dlg = page.getByRole("dialog", { name: "导入预览" });
  await expect(dlg).toContainText("灰港契约（原创示例）：5 个角色、5 条关系、1 条情节、4 条设定改编");
  await dlg.getByRole("button", { name: "确认导入" }).click();
  await expect(page.getByRole("status")).toContainText("已导入 1 个项目");
  await expect(page.getByRole("link", { name: /（导入）/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: /（导入）/ })).toBeVisible();
  await page.getByTestId("import-file").setInputFiles({ name: "p.json", mimeType: "application/json", buffer: Buffer.from(json.text) });
  await page.getByRole("dialog", { name: "导入预览" }).getByRole("button", { name: "确认导入" }).click();
  await expect(page.getByRole("link", { name: /（导入）/ })).toHaveCount(2);
  await page.getByRole("button", { name: "撤销导入" }).click();
  await expect(page.getByRole("link", { name: /（导入）/ })).toHaveCount(1);
  await page.getByTestId("import-file").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{bad") });
  await expect(page.getByRole("alert")).toContainText("导入失败");
  await expect(page.getByRole("link", { name: /（导入）/ })).toHaveCount(1);
});

test("navigation shell and reading layout on desktop and mobile", async ({ page }, info) => {
  const mobile = info.project.name === "mobile";
  await page.goto("#/");
  await expect(page.getByRole("heading", { name: "D&D 设定资料库", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "最近编辑的项目" })).toBeVisible();
  await expect(page.getByText("保存在本浏览器（未同步到 GitHub）").first()).toBeVisible();
  await shot(page, info.project.name, "home");
  if (mobile) {
    await page.getByRole("button", { name: "打开菜单" }).click();
    await page.getByRole("dialog", { name: "菜单" }).getByRole("link", { name: "主题索引" }).click();
    await expect(page.getByRole("dialog", { name: "菜单" })).toBeHidden();
  } else {
    await page.getByRole("navigation").first().getByRole("link", { name: "主题索引" }).click();
    await page.getByRole("button", { name: "收起侧栏" }).click();
    await expect(page.locator(".wb-collapsed")).toHaveCount(1);
    await page.reload();
    await expect(page.locator(".wb-collapsed")).toHaveCount(1);
    await page.getByRole("button", { name: "展开侧栏" }).click();
  }
  await expect(page.getByRole("heading", { name: "主题索引", level: 1 })).toBeVisible();
  for (const [hash, name] of [
    ["#/themes", "themes"],
    ["#/entry/warlock", "entry-warlock"],
    ["#/entry/warlock?tab=rules", "entry-rules"],
    ["#/themes/power", "theme-power"],
    ["#/projects/example-greyharbor/overview", "project-overview"],
    ["#/projects/example-greyharbor/characters", "project-characters"],
    ["#/projects/example-greyharbor/relationships", "project-relationships"],
    ["#/projects/example-greyharbor/settings", "project-settings"],
    ["#/favorites", "favorites"],
    ["#/tools", "tools"],
  ]) {
    await page.goto(hash);
    await page.waitForTimeout(300);
    expect(await noOverflow(page), hash).toBe(true);
    await shot(page, info.project.name, name);
  }
  // images actually load and keep their subject visible (object-position set)
  await page.goto("#/entry/paladin");
  const img = page.locator(".wb-entry-art");
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 500)).toBe(true);
  expect(await img.evaluate((el) => getComputedStyle(el).objectPosition)).not.toBe("50% 50%");
});
