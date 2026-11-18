import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
const toolTab: Record<string, string> = { 法术: "法术目录", 装备与魔法物品: "物品目录", 角色工具: "角色卡" };
async function nav(page: Page, label: string) {
  await page
    .getByRole("tablist", { name: "工具" })
    .getByRole("tab", { name: toolTab[label] ?? label, exact: true })
    .click();
}
async function create(page: Page, name = "瑟林·星羽") {
  await page.getByRole("button", { name: "新的旅人", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("角色姓名").fill(name);
  await dialog.getByText("奥秘", { exact: true }).check();
  await dialog.getByText("历史", { exact: true }).check();
  await dialog.getByRole("button", { name: "下一步" }).click();
  await dialog.getByRole("button", { name: "下一步" }).click();
  await dialog.getByRole("button", { name: "创建角色", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}
test("create, damage, spells, inventory and persistence", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#/tools");
  await create(page);
  await page.getByLabel("伤害或治疗数值").fill("3");
  await page.getByRole("button", { name: "− 受伤", exact: true }).click();
  await expect(page.getByTestId("current-hp")).toHaveText("5");
  await nav(page, "法术");
  await page.getByLabel("搜索法术或物品").fill("魔法飞弹");
  await page
    .getByRole("button", { name: "添加 Magic Missile", exact: true })
    .click();
  await nav(page, "装备与魔法物品");
  await page.getByLabel("搜索法术或物品").fill("Longsword");
  await page
    .getByRole("button", { name: "添加 Longsword", exact: true })
    .click();
  await nav(page, "角色工具");
  await page.getByRole("tab", { name: /我的法术/ }).click();
  await expect(
    page.getByRole("button", { name: /魔法飞弹 · Magic Missile/ }),
  ).toBeVisible();
  await page.getByLabel("已准备", { exact: true }).check();
  await page.getByRole("button", { name: "1环法术位 1", exact: true }).click();
  await page.getByRole("tab", { name: /行囊物品/ }).click();
  await page.getByLabel("Longsword 数量").fill("2");
  await page.getByLabel("装备", { exact: true }).check();
  await page.reload();
  await expect(page.getByTestId("current-hp")).toHaveText("5");
  await page.getByRole("tab", { name: /行囊物品/ }).click();
  await expect(page.getByLabel("Longsword 数量")).toHaveValue("2");
  await expect(page.getByLabel("装备", { exact: true })).toBeChecked();
  await page.getByRole("tab", { name: /我的法术/ }).click();
  await expect(page.getByLabel("已准备", { exact: true })).toBeChecked();
  await expect(
    page.getByRole("button", { name: "1环法术位 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: /角色总览/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}-character.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("point-buy validation and long rest", async ({ page }) => {
  await page.goto("#/tools");
  await page.getByRole("button", { name: "新的旅人", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("角色姓名").fill("购点旅人");
  await d.getByText("奥秘", { exact: true }).check();
  await d.getByText("历史", { exact: true }).check();
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "27 点购点" }).click();
  const selects = d.locator(".ability-assign select");
  for (let i = 0; i < 4; i++) await selects.nth(i).selectOption("15");
  await expect(d.getByRole("button", { name: "下一步" })).toBeDisabled();
  await selects.nth(3).selectOption("8");
  await expect(d.getByRole("status")).toContainText("27 / 27");
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "创建角色", exact: true }).click();
  await page.getByLabel("伤害或治疗数值").fill("2");
  await page.getByRole("button", { name: "− 受伤", exact: true }).click();
  await page.getByRole("button", { name: "长休", exact: true }).click();
  await page.getByRole("button", { name: "完成休息", exact: true }).click();
  await expect(page.getByTestId("current-hp")).toHaveText("9");
});
test("backup round trip and malformed import protection", async ({ page }) => {
  await page.goto("#/tools");
  await create(page, "备份旅人");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出备份", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".json");
  const raw = await page.evaluate(() =>
    localStorage.getItem("wayfarer-5e-v1")!,
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.getByRole("status")).toContainText("导入失败");
  await expect(
    page.getByRole("heading", { name: "备份旅人", exact: true }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.locator("input[type=file]").setInputFiles({
    name: "good.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  await expect(page.getByRole("status")).toContainText("备份导入成功");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "备份旅人", exact: true }),
  ).toBeVisible();
});
test("duplicate, custom content, delete confirmation and switching", async ({
  page,
}, info) => {
  await page.goto("#/tools");
  await create(page, "第一位");
  await page.getByRole("tab", { name: /笔记与设置/ }).click();
  await page.getByLabel("特性、语言、羁绊与冒险记录").fill("和朋友去龙之谷");
  await page.getByRole("button", { name: "复制角色", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "第一位（副本）", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /行囊物品/ }).click();
  await page.getByRole("button", { name: "自定义", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("名称", { exact: true }).fill("老地图");
  await d.getByLabel("效果 / 备注（由 DM 确认）").fill("通往废墟的地图");
  await d.getByRole("button", { name: "保存并添加" }).click();
  await expect(
    page.getByRole("button", { name: /^老地图 自定义/ }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /笔记与设置/ }).click();
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "删除角色", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "第一位（副本）", exact: true }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "删除角色", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "第一位", exact: true }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await expect(page.getByLabel("切换角色")).toBeVisible();
  }
});
test("catalog details and responsive empty state", async ({ page }, info) => {
  await page.goto("#/tools");
  await expect(
    page.getByRole("button", { name: "创建第一位角色" }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}-empty.png`,
    fullPage: true,
  });
  await nav(page, "法术");
  await page.getByLabel("法术环阶").selectOption("3");
  await page.getByLabel("搜索法术或物品").fill("Fireball");
  await page.getByRole("button", { name: "火球术 Fireball" }).click();
  await expect(page.getByRole("dialog")).toContainText("8d6");
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "请先创建角色" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "关闭弹窗" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}-spells.png`,
    fullPage: true,
  });
});
test("damaged local save is not silently overwritten", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("wayfarer-5e-v1", "{broken"),
  );
  await page.goto("#/tools");
  await expect(page.getByRole("alert")).toContainText("暂停自动保存");
  expect(
    await page.evaluate(() => localStorage.getItem("wayfarer-5e-v1")),
  ).toBe("{broken");
});
