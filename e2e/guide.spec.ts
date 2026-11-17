import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
async function nav(page: Page, label: string) {
  if (
    await page
      .getByRole("button", { name: "打开导航", exact: true })
      .isVisible()
  ) {
    await page.getByRole("button", { name: "打开导航", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: label, exact: true })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "百科导航", exact: true })
      .getByRole("button", { name: label, exact: true })
      .click();
}
test("game codex classes, real tabs and responsive navigation", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("");
  await expect(
    page.getByRole("heading", { name: "职业", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".g-class-card")).toHaveCount(12);
  await page.getByRole("button", { name: /法师 WIZARD/ }).click();
  await expect(page.locator(".g-class-hero")).toContainText("把魔法写进法术书");
  await page.getByRole("tab", { name: "核心特点" }).click();
  await expect(
    page.getByRole("heading", { name: "奥术回想", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "狂暴 Rage", exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "野蛮人", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "狂暴 Rage", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "奥术回想", exact: true }),
  ).not.toBeVisible();
  await page.getByRole("tab", { name: "玩法与成长" }).click();
  await expect(
    page.getByRole("heading", { name: "第一次玩野蛮人", exact: true }),
  ).toBeVisible();
  if (info.project.name === "desktop") {
    await page.getByRole("button", { name: "收起侧边菜单" }).click();
    await expect(page.locator(".g-shell")).toHaveClass(/g-collapsed/);
    await page.reload();
    await expect(page.locator(".g-shell")).toHaveClass(/g-collapsed/);
    await page.getByRole("button", { name: "展开侧边菜单" }).click();
  } else {
    await page.getByRole("button", { name: "打开导航" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "关闭导航" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await page.getByRole("tab", { name: "职业介绍" }).click();
  await page.getByRole("button", { name: /法师 WIZARD/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({
    path: `artifacts/screenshots/v2-${info.project.name}-classes.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `artifacts/screenshots/v2-${info.project.name}-classes-viewport.png`,
  });
  expect(errors).toEqual([]);
});
test("beginner, races, background, magic and world have substantive Chinese guides", async ({
  page,
}, info) => {
  await page.goto("");
  await nav(page, "快速入门");
  await expect(
    page.getByRole("heading", { name: "先理解：你在玩什么？" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "掷骰与检定" }).click();
  await expect(
    page.getByRole("heading", { name: "优势与劣势：仍然只加一次加值" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "战斗速读" }).click();
  await expect(
    page.getByRole("heading", { name: "你的回合：移动 + 动作" }),
  ).toBeVisible();
  await nav(page, "种族");
  await expect(page.locator(".g-race-card")).toHaveCount(9);
  await page.getByRole("tab", { name: "属性与亚种族" }).click();
  await expect(page.getByRole("table")).toContainText("另选两项各 +1");
  await nav(page, "背景");
  await expect(page.getByText(/只开放了侍僧/)).toBeVisible();
  await page.getByRole("tab", { name: "侍僧背景" }).click();
  await expect(
    page.getByRole("heading", { name: "技能与语言", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "自定义背景" }).click();
  await expect(
    page.getByRole("heading", { name: "选两项技能", exact: true }),
  ).toBeVisible();
  await nav(page, "法术");
  await expect(
    page.getByRole("heading", { name: "专注 Concentration", exact: true }),
  ).toBeVisible();
  await nav(page, "地理与世界");
  await expect(page.getByText(/费伦 Faerûn/)).toBeVisible();
  await page.getByRole("tab", { name: "位面速览" }).click();
  await expect(page.locator(".g-plane")).toHaveCount(6);
  await page.getByRole("tab", { name: "原创地区地图" }).click();
  await page.getByRole("button", { name: "观星遗址", exact: true }).click();
  await expect(page.locator(".g-map-detail h2")).toHaveText("观星遗址");
  await expect(page.getByText(/既不是费伦也不是官方/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({
    path: `artifacts/screenshots/v2-${info.project.name}-world.png`,
    fullPage: true,
  });
});
test("global search routes to distinct classes and filtered spell/item catalog", async ({
  page,
}) => {
  await page.goto("");
  const search = page.getByLabel("搜索百科、法术与物品");
  await search.fill("游荡者");
  await page
    .locator(".g-search-results")
    .getByRole("button", { name: /游荡者 rogue/ })
    .click();
  await expect(page.locator(".g-class-hero h2")).toHaveText("游荡者");
  await search.fill("Fireball");
  await page
    .locator(".g-search-results")
    .getByRole("button", { name: /火球术 · Fireball/ })
    .click();
  await expect(page.getByLabel("搜索法术或物品")).toHaveValue("Fireball");
  await page.getByLabel("法术环阶").selectOption("3");
  await expect(page.locator(".catalog-card")).toHaveCount(1);
  await page.getByRole("button", { name: "火球术 Fireball" }).click();
  await expect(page.getByRole("dialog")).toContainText("8d6");
  await page.getByRole("button", { name: "关闭弹窗" }).click();
  await search.fill("Longsword");
  await page
    .locator(".g-search-results")
    .getByRole("button", { name: "长剑 · Longsword 物品", exact: true })
    .click();
  await expect(page.getByLabel("搜索法术或物品")).toHaveValue("Longsword");
  await page.getByLabel("物品分类").selectOption("weapon");
  await expect(page.locator(".catalog-card")).toHaveCount(2);
  await expect(
    page.getByRole("heading", { name: "Longsword", exact: true }),
  ).toBeVisible();
});
test("reading guide preserves existing v1 characters without a migration", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "wayfarer-5e-v1",
      '{"version":1,"characters":[],"activeId":null}',
    );
  });
  await page.goto("");
  const before = await page.evaluate(() =>
    localStorage.getItem("wayfarer-5e-v1"),
  );
  await nav(page, "种族");
  await nav(page, "地理与世界");
  expect(
    await page.evaluate(() => localStorage.getItem("wayfarer-5e-v1")),
  ).toBe(before);
});
