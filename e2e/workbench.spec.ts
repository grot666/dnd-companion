import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const shot = (page: Page, project: string, name: string, fullPage = false) =>
  page.screenshot({
    path: `artifacts/screenshots/${project}-${name}.png`,
    fullPage,
  });
const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const EDITORIAL = /待核实|待查|未核实|编辑解读|设定摘要|TODO|本站尚未/;
const SERIES = "#/series/example-ashriver";

async function readDownload(page: Page, click: () => Promise<void>) {
  const wait = page.waitForEvent("download");
  await click();
  const d = await wait;
  return {
    name: d.suggestedFilename(),
    text: readFileSync((await d.path())!, "utf8"),
  };
}
const seg = (page: Page, name: string | RegExp) =>
  page.getByRole("group", { name: "查看时间点" }).getByRole("link", { name });

test("series → world → story 1 → character → story 2 changes → edit → influence → adoption → reload → export", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const p = info.project.name;

  // 1. my series
  await page.goto("#/");
  await expect(
    page.getByRole("heading", { name: "我的系列", level: 1 }),
  ).toBeVisible();
  await expect(
    page.locator(".wb-main .wb-theme-strip, .wb-main .wb-theme-card"),
  ).toHaveCount(0);
  await expect(
    page.locator(".wb-main").getByRole("heading", { name: "主题索引" }),
  ).toHaveCount(0);
  await shot(page, p, "flow-1-home");
  await page
    .locator(".wb-main")
    .getByRole("link", { name: /烬川纪事（原创示例）/ })
    .click();
  await expect(page).toHaveURL(/#\/series\/example-ashriver\/overview$/);
  await expect(
    page.getByRole("heading", { name: "烬川纪事（原创示例）", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /前作影响 7 处/ })).toBeVisible();
  await shot(page, p, "flow-2-overview", true);

  // 2. world
  await page.getByRole("tab", { name: "世界" }).click();
  await expect(
    page.getByRole("heading", { name: "烬川", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByTestId("fact").filter({ hasText: "渡影" }).first(),
  ).toContainText("死者的影子");
  await expect(page.getByText("盐税年代")).toBeVisible();
  await shot(page, p, "flow-3-world");

  // 3. story 1, read
  await page.getByRole("tab", { name: "故事" }).click();
  await page.locator(".wb-story-card", { hasText: "渡口之火" }).click();
  await expect(
    page.getByRole("heading", { name: "《渡口之火》", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByTestId("event").filter({ hasText: "渡口大火" }),
  ).toContainText("影响后续故事");
  await expect(page.getByTestId("cast")).toHaveCount(4);
  await shot(page, p, "flow-4-story1", true);

  // 4. character state in story 1
  await page.getByTestId("cast").filter({ hasText: "苏缇" }).click();
  await expect(page).toHaveURL(/characters\/c-suti\?story=story-ferry-fire$/);
  await expect(page.getByTestId("state-role")).toContainText("渡口船工");
  await expect(page.getByTestId("state-age")).toContainText("19 岁");
  await shot(page, p, "flow-5-suti-418");

  // 5. switch to story 2: changes and causes from story 1
  await seg(page, /灰桥/).click();
  await expect(page).toHaveURL(/story=story-grey-bridge$/);
  await expect(page.getByTestId("state-role")).toContainText("灰桥镇守");
  const changes = page.getByRole("region", {
    name: "自《渡口之火》以来的变化",
  });
  await expect(
    changes.getByTestId("change").filter({ hasText: "身份与职务" }),
  ).toContainText("渡口船工");
  await expect(
    changes.getByTestId("change").filter({ hasText: "身份与职务" }),
  ).toContainText("灰桥镇守");
  await expect(changes).toContainText("渡口大火");
  await expect(
    page.getByTestId("relationship").filter({ hasText: "柯伦" }).first(),
  ).toBeVisible();
  await shot(page, p, "flow-6-suti-436", true);

  // 6. edit the shared base profile: visible in both stories
  await seg(page, "基本资料").click();
  await page.getByRole("button", { name: "编辑基本资料" }).click();
  await page.getByLabel("一句话简介").fill("渡口船工之女，后来的灰桥镇守。");
  await page
    .getByLabel("动机", { exact: true })
    .fill("让河两岸的人都能免费过河。");
  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.getByTestId("profile-motivation")).toContainText(
    "免费过河",
  );
  for (const st of [/渡口之火/, /灰桥/]) {
    await seg(page, st).click();
    await expect(page.locator(".wb-object-head .wb-lede")).toHaveText(
      "渡口船工之女，后来的灰桥镇守。",
    );
  }

  // 7. edit a story state: only that story changes
  await seg(page, /灰桥/).click();
  await page.getByRole("button", { name: "编辑此时的状态" }).click();
  await page.getByLabel("所在地", { exact: true }).fill("议会厅");
  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.getByTestId("state-location")).toHaveText(/议会厅/);
  await seg(page, /渡口之火/).click();
  await expect(page.getByTestId("state-location")).toHaveText(/盐桥渡/);

  // 8. add an influence from story 1 into story 2
  await page.goto(`${SERIES}/stories/story-grey-bridge?mode=influence`);
  await expect(page.getByTestId("influence")).toHaveCount(7);
  const form = page.getByRole("form", { name: "添加影响" });
  await form
    .getByLabel("前作中的事件")
    .selectOption({ label: "《渡口之火》渡口大火" });
  await form.getByLabel("影响的对象").selectOption({ label: "人物：诺欧" });
  await form
    .getByLabel("影响说明")
    .fill("大火那年出生在流放路上，由柯伦收养。");
  await form.getByRole("button", { name: "添加影响" }).click();
  await expect(page.getByTestId("influence")).toHaveCount(8);
  await shot(page, p, "flow-7-influence");

  // 9. change an adoption decision
  await page.getByRole("tab", { name: "采用的设定" }).click();
  await page.getByLabel("对邪术师的决定").selectOption("采用");
  const warlock = page.getByTestId("adoption").filter({ hasText: "邪术师" });
  await warlock
    .getByLabel("本系列的设定")
    .fill("烬川的契主即邪术师的恩主，规则照官方。");
  await expect(warlock.locator(".wb-badge").first()).toHaveText("采用");
  await expect(page.getByTestId("save-status")).toContainText(
    "保存在本浏览器（未同步到 GitHub）",
  );
  await expect(page.getByTestId("save-status")).toContainText("已保存");
  await shot(page, p, "flow-8-adoptions");

  // 10. reload restores everything
  await page.reload();
  await expect(page.getByLabel("对邪术师的决定")).toHaveValue("adopt");
  await page.goto(`${SERIES}/characters/c-suti?story=story-grey-bridge`);
  await page.reload();
  await expect(page.getByTestId("state-location")).toHaveText(/议会厅/);
  await expect(page.locator(".wb-object-head .wb-lede")).toHaveText(
    "渡口船工之女，后来的灰桥镇守。",
  );
  await page.goto(`${SERIES}/stories/story-grey-bridge?mode=influence`);
  await expect(page.getByTestId("influence")).toHaveCount(8);

  // 11. exports
  const full = await readDownload(page, () =>
    page.getByRole("button", { name: "导出 Markdown（全部）" }).click(),
  );
  expect(full.text).toContain("# 烬川纪事（原创示例）");
  expect(full.text).toContain("## 世界：烬川");
  expect(full.text).toContain("## 故事：《渡口之火》");
  expect(full.text).toContain("## 故事：《灰桥》");
  expect(full.text).toContain("### 此时的状态");
  expect(full.text).toContain("议会厅");
  expect(full.text).toContain("### 前作影响");
  expect(full.text).toContain("大火那年出生在流放路上");
  expect(full.text).toContain("烬川的契主即邪术师的恩主");
  expect(full.text).toContain("（仅自己）");
  const pub = await readDownload(page, () =>
    page.getByRole("button", { name: "导出 Markdown（公开内容）" }).click(),
  );
  expect(pub.name).toContain("公开版");
  expect(pub.text).not.toContain("（仅自己）");
  expect(pub.text).not.toContain("渡影的来历");
  expect(pub.text).not.toContain("没有告诉弟弟渡影这次要的是什么");
  expect(pub.text).toContain("议会厅");
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("story reading: public-only view, previous-story influence and story navigation", async ({
  page,
}, info) => {
  await page.goto(`${SERIES}/stories/story-grey-bridge`);
  const callout = page.getByRole("complementary", { name: "前作影响" });
  await expect(callout).toContainText("苏缇");
  await expect(callout).toContainText("源自《渡口之火》");
  await expect(
    page.getByTestId("relationship").filter({ hasText: "隐瞒" }),
  ).toHaveCount(1);
  await page.getByLabel("只显示公开内容").check();
  await expect(page).toHaveURL(/pub=1/);
  await expect(
    page.getByTestId("relationship").filter({ hasText: "隐瞒" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("只显示公开内容")).toBeChecked();
  await shot(page, info.project.name, "story2-read", true);
  await page.getByRole("link", { name: /上一部：《渡口之火》/ }).click();
  await expect(
    page.getByRole("heading", { name: "《渡口之火》", level: 2 }),
  ).toBeVisible();
  await page.goto(`${SERIES}/timeline`);
  await expect(page.getByTestId("timeline-event").first()).toContainText("418");
  await expect(
    page.getByTestId("timeline-event").filter({ hasText: "渡口大火" }),
  ).toContainText("影响后续故事");
  await shot(page, info.project.name, "timeline");
});

test("reading text never shows editorial-workflow labels", async ({ page }) => {
  await page.goto("#/library");
  const slugs = await page
    .locator(".wb-grid:not(.wb-grid-compact) a.wb-card")
    .evaluateAll((as) =>
      as.map((a) => (a as HTMLAnchorElement).hash.replace("#/entry/", "")),
    );
  expect(slugs.length).toBeGreaterThan(10);
  for (const slug of slugs) {
    await page.goto(`#/entry/${slug}`);
    const text = await page.getByTestId("reading").innerText();
    expect(text, slug).not.toMatch(EDITORIAL);
    expect(await page.locator(".wb-entry-head").innerText(), slug).not.toMatch(
      EDITORIAL,
    );
  }
  await page.goto("#/entry/true-name");
  await expect(page.locator(".wb-footnotes li").first()).toContainText(
    "SRD 5.1",
  );
  await expect(page.getByRole("complementary", { name: "解读" })).toBeVisible();
  for (const hash of [
    `${SERIES}/stories/story-ferry-fire`,
    `${SERIES}/stories/story-grey-bridge`,
    "#/themes/power",
  ]) {
    await page.goto(hash);
    expect(await page.locator(".wb-main").innerText(), hash).not.toMatch(
      EDITORIAL,
    );
  }
  // drafts live on their own author-facing page
  await page.goto("#/drafts");
  await expect(
    page.getByRole("heading", { name: "核实草稿", level: 1 }),
  ).toBeVisible();
  expect(await page.getByTestId("draft").count()).toBeGreaterThan(5);
  await expect(page.getByTestId("draft").first()).toContainText("缺少的资料");
});

test("entry → 加入系列设定 → adoption card", async ({ page }) => {
  await page.goto("#/entry/lich");
  await page.getByRole("button", { name: "加入系列设定" }).click();
  const dlg = page.getByRole("dialog", { name: "加入系列设定" });
  await dlg.getByLabel(/烬川纪事/).check();
  await dlg.getByRole("button", { name: "确认加入" }).click();
  await expect(page.getByRole("status")).toContainText(
    "已加入“烬川纪事（原创示例）”",
  );
  await page.getByRole("link", { name: "打开采用的设定" }).click();
  await expect(page).toHaveURL(/adoptions\/lich$/);
  const card = page.getByTestId("adoption").filter({ hasText: "巫妖" });
  await expect(card.locator(".wb-badge").first()).toHaveText("未决定");
  await expect(card).toContainText("CC BY 4.0");
});

test("deep links survive refresh; back restores search, filter and scroll", async ({
  page,
}) => {
  await page.goto(`${SERIES}/characters/c-koren?story=story-grey-bridge`);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "柯伦", level: 2 }),
  ).toBeVisible();
  await expect(seg(page, /灰桥/)).toHaveAttribute("aria-current", "true");
  await page.goto(`${SERIES}/stories/story-grey-bridge?mode=edit`);
  await page.reload();
  await expect(page.getByLabel("标题", { exact: true })).toHaveValue("灰桥");
  await page.goto("#/entry/lich?tab=sources");
  await page.reload();
  await expect(page.getByRole("tab", { name: "来源" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goto("#/series/nope");
  await expect(
    page.getByRole("heading", { name: "找不到这个系列" }),
  ).toBeVisible();

  await page.goto("#/library");
  await page.getByRole("button", { name: "职业", exact: true }).click();
  await expect(page).toHaveURL(/cat=class/);
  await page.getByLabel("搜索资料").fill("师");
  await expect(page).toHaveURL(/cat=class&q=%E5%B8%88/);
  await page.getByLabel("搜索资料").fill("");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(250);
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(300);
  await page.locator(".wb-card", { hasText: "野蛮人" }).click();
  await expect(
    page.getByRole("heading", { name: /野蛮人/, level: 1 }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "职业", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(y - 40);

  // back from a character returns to the same story view
  await page.goto(`${SERIES}/stories/story-grey-bridge`);
  await page.getByTestId("cast").filter({ hasText: "阿岚" }).click();
  await expect(page).toHaveURL(/c-alan\?story=story-grey-bridge/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "《灰桥》", level: 2 }),
  ).toBeVisible();
});

test("round-3 saves migrate to series; tabletop save untouched", async ({
  page,
}) => {
  const v1 = readFileSync("tests/fixtures/v1-save.json", "utf8");
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("dnd-workbench-v1"))
      localStorage.setItem("dnd-workbench-v1", raw);
  }, v1);
  await page.goto("#tools");
  await page.getByRole("button", { name: "新的旅人", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("角色姓名").fill("老存档");
  await d.getByText("奥秘", { exact: true }).check();
  await d.getByText("历史", { exact: true }).check();
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "下一步" }).click();
  await d.getByRole("button", { name: "创建角色", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "老存档", exact: true }),
  ).toBeVisible();
  const before = await page.evaluate(() =>
    localStorage.getItem("wayfarer-5e-v1"),
  );
  await page.goto("#/");
  await expect(
    page
      .locator(".wb-main")
      .getByRole("link", { name: /灰港契约（原创示例）/ }),
  ).toBeVisible();
  await expect(
    page.locator(".wb-main").getByRole("link", { name: /雾港旧稿/ }),
  ).toBeVisible();
  // old project deep link lands on the converted series
  await page.goto("#/projects/example-greyharbor/plots");
  await expect(
    page.getByRole("heading", { name: "灰港契约（原创示例）", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "故事" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: "人物" }).click();
  await expect(page.locator(".wb-obj-card")).toHaveCount(5);
  await page.goto("#/tools");
  await expect(
    page.getByRole("heading", { name: "老存档", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("wayfarer-5e-v1")),
  ).toBe(before);
  expect(
    await page.evaluate(() => localStorage.getItem("dnd-workbench-v1")),
  ).toBe(v1);
  const v2 = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("dnd-workbench-v2")!),
  );
  expect(v2.version).toBe(2);
  expect(v2.series.map((s: { id: string }) => s.id)).toEqual([
    "example-ashriver",
    "example-greyharbor",
    "proj-mine",
  ]);
});

test("JSON export → import preview → undo, and malformed import", async ({
  page,
}) => {
  await page.goto(`${SERIES}/overview`);
  const json = await readDownload(page, () =>
    page.getByRole("button", { name: "导出 JSON" }).click(),
  );
  expect(JSON.parse(json.text).series.stories).toHaveLength(2);
  await page.goto("#/");
  await page
    .getByTestId("import-file")
    .setInputFiles({
      name: "s.json",
      mimeType: "application/json",
      buffer: Buffer.from(json.text),
    });
  const dlg = page.getByRole("dialog", { name: "导入预览" });
  await expect(dlg).toContainText("故事：2");
  await expect(dlg).toContainText("影响：7");
  await dlg.getByRole("button", { name: "确认导入" }).click();
  const imported = page
    .locator(".wb-main")
    .getByRole("link", { name: /（导入）/ });
  await expect(imported).toHaveCount(1);
  await page.reload();
  await expect(imported).toHaveCount(1);
  await page
    .getByTestId("import-file")
    .setInputFiles({
      name: "s.json",
      mimeType: "application/json",
      buffer: Buffer.from(json.text),
    });
  await page
    .getByRole("dialog", { name: "导入预览" })
    .getByRole("button", { name: "确认导入" })
    .click();
  await expect(imported).toHaveCount(2);
  await page.getByRole("button", { name: "撤销导入" }).click();
  await expect(imported).toHaveCount(1);
  await page
    .getByTestId("import-file")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(page.getByRole("alert")).toContainText("导入失败");
});

test("navigation shell and layout on desktop and mobile", async ({
  page,
}, info) => {
  const mobile = info.project.name === "mobile";
  await page.goto("#/");
  await expect(
    page.getByText("保存在本浏览器（未同步到 GitHub）").first(),
  ).toBeVisible();
  if (mobile) {
    await page.getByRole("button", { name: "打开菜单" }).click();
    await page
      .getByRole("dialog", { name: "菜单" })
      .getByRole("link", { name: "资料条目" })
      .click();
    await expect(page.getByRole("dialog", { name: "菜单" })).toBeHidden();
  } else {
    await page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: "资料条目" })
      .click();
    await page.getByRole("button", { name: "收起侧栏" }).click();
    await expect(page.locator(".wb-collapsed")).toHaveCount(1);
    await page.reload();
    await expect(page.locator(".wb-collapsed")).toHaveCount(1);
    await page.getByRole("button", { name: "展开侧栏" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "资料条目", level: 1 }),
  ).toBeVisible();
  for (const [hash, name] of [
    [`${SERIES}/overview`, "series-overview"],
    [`${SERIES}/world`, "series-world"],
    [`${SERIES}/characters`, "series-characters"],
    [`${SERIES}/characters/c-suti`, "char-base"],
    [`${SERIES}/places`, "series-places"],
    [`${SERIES}/places/p-ferry?story=story-grey-bridge`, "place-436"],
    [`${SERIES}/stories`, "series-stories"],
    [`${SERIES}/stories/story-grey-bridge?mode=edit`, "story-edit"],
    [`${SERIES}/stories/story-grey-bridge?mode=influence`, "story-influence"],
    [`${SERIES}/adoptions`, "series-adoptions"],
    ["#/library", "library"],
    ["#/entry/cleric", "entry-cleric"],
    ["#/entry/true-name", "entry-true-name"],
    ["#/drafts", "drafts"],
    ["#/themes", "themes"],
    ["#/tools", "tools"],
  ]) {
    await page.goto(hash);
    await page.waitForTimeout(300);
    expect(await noOverflow(page), hash).toBe(true);
    await shot(page, info.project.name, name);
  }
  await page.goto(`${SERIES}/characters/c-suti?story=story-grey-bridge`);
  const img = page.locator(".wb-object-art");
  await expect(img).toBeVisible();
  expect(
    await img.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 400,
    ),
  ).toBe(true);
  expect(await img.getAttribute("src")).toContain("char-suti-436");
});
