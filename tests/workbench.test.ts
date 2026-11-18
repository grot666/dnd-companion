import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { entries, getEntry, searchEntries } from "../src/wb/entries";
import { themes, searchThemes } from "../src/wb/themes";
import { sources, licenseLabel } from "../src/wb/sources";
import * as S from "../src/wb/series";
import { exampleSeries } from "../src/wb/example";
import { parseHash, href, seriesRoute, type Route } from "../src/wb/router";

class MemStorage {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
  key() {
    return null;
  }
  get length() {
    return this.m.size;
  }
}
const mem = () => new MemStorage() as unknown as Storage;
const v1Save = readFileSync("tests/fixtures/v1-save.json", "utf8");
const S1 = "story-ferry-fire";
const S2 = "story-grey-bridge";

// Editorial-workflow wording that must never reach reading text.
const EDITORIAL = /待核实|待查|未核实|编辑解读|设定摘要|TODO|本站尚未/;

describe("reference entries", () => {
  it("has unique slugs and resolvable links", () => {
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    for (const e of entries) {
      for (const r of e.related)
        expect(getEntry(r), `${e.slug} → ${r}`).toBeTruthy();
      for (const t of e.themes)
        expect(
          themes.some((x) => x.slug === t),
          `${e.slug} theme ${t}`,
        ).toBe(true);
      for (const [sid] of e.sources)
        expect(sources[sid], `${e.slug} source ${sid}`).toBeTruthy();
    }
  });
  it("keeps only two provenance kinds in reading text, and cites every sourced paragraph", () => {
    for (const e of entries)
      for (const s of e.sections)
        for (const b of s.blocks) {
          expect(["source", "editorial"]).toContain(b.p);
          if (b.p === "source")
            expect(
              b.cite?.length,
              `${e.slug}: ${b.text.slice(0, 20)}`,
            ).toBeGreaterThan(0);
          for (const [sid] of b.cite ?? []) expect(sources[sid]).toBeTruthy();
        }
  });
  it("never shows editorial-workflow labels in reading text", () => {
    for (const e of entries) {
      const reading = [
        e.summary,
        e.edition,
        e.setting,
        ...e.sections.flatMap((s) => [s.title, ...s.blocks.map((b) => b.text)]),
        ...(e.rules?.items.flat() ?? []),
      ].join("\n");
      expect(reading, e.slug).not.toMatch(EDITORIAL);
    }
    for (const t of themes)
      expect(JSON.stringify(t), t.slug).not.toMatch(EDITORIAL);
  });
  it("does not cite paywalled books or community posts as evidence in reading text", () => {
    for (const e of entries)
      for (const s of e.sections)
        for (const b of s.blocks)
          for (const [sid] of b.cite ?? [])
            expect(
              ["book", "secondary"],
              `${e.slug}: ${b.text.slice(0, 30)}`,
            ).not.toContain(sources[sid].kind);
  });
  it("keeps unconfirmed claims as drafts with what is missing and why", () => {
    const drafts = entries.flatMap((e) =>
      (e.drafts ?? []).map((d) => ({ e, d })),
    );
    expect(drafts.length).toBeGreaterThan(5);
    for (const { e, d } of drafts) {
      expect(d.claim.length, e.slug).toBeGreaterThan(4);
      expect(d.missing.length, e.slug).toBeGreaterThan(4);
      expect(d.blocker.length, e.slug).toBeGreaterThan(4);
      for (const [sid] of d.located)
        expect(sources[sid], `${e.slug} draft source ${sid}`).toBeTruthy();
      // a draft claim must not be repeated verbatim in the reading text
      const reading = e.sections
        .flatMap((s) => s.blocks.map((b) => b.text))
        .join("\n");
      expect(reading.includes(d.claim)).toBe(false);
    }
  });
  it("labels each source's licence separately from verification", () => {
    for (const s of Object.values(sources)) {
      expect(licenseLabel[s.license], s.id).toBeTruthy();
      if (s.kind === "book") {
        expect(s.url).toBeUndefined();
        expect(s.license).toBe("title-only");
      } else expect(s.url).toMatch(/^https:\/\//);
    }
    expect(sources.srd51.license).toBe("cc-by");
    expect(sources.srd521.license).toBe("cc-by");
  });
  it("states the 2014/2024 difference where 2024 material is cited", () => {
    for (const e of entries) {
      const cites = e.sections.flatMap((s) =>
        s.blocks.flatMap((b) => b.cite ?? []),
      );
      if (cites.some(([sid]) => sid === "srd521" || sid === "fr2024"))
        expect(e.edition, e.slug).toContain("2024");
    }
    expect(
      getEntry("cleric")!.sections.some((s) => s.title === "版本差异"),
    ).toBe(true);
    expect(
      getEntry("shadowfell")!.sections.some((s) => s.title === "版本差异"),
    ).toBe(true);
  });
  it("treats True Name as an ordinary entry grounded in the Gate spell", () => {
    const tn = getEntry("true-name")!;
    expect(tn.summary).toContain("异界之门");
    const cites = tn.sections.flatMap((s) =>
      s.blocks.flatMap((b) => b.cite ?? []),
    );
    expect(cites).toEqual(expect.arrayContaining([["srd51", "第 148 页"]]));
    expect(tn.drafts?.length).toBeGreaterThan(0);
  });
  it("keeps deep entries with images on disk and the SRD catalog", () => {
    for (const e of entries.filter((x) => x.depth === "deep")) {
      expect(e.sections.length, e.slug).toBeGreaterThan(0);
      if (e.image)
        expect(existsSync(`public/${e.image.src}`), e.image.src).toBe(true);
    }
    expect(entries.filter((e) => e.category === "class")).toHaveLength(12);
    expect(entries.filter((e) => e.category === "race")).toHaveLength(9);
  });
  it("searches names, English names and tags", () => {
    expect(searchEntries("warlock").map((e) => e.slug)).toContain("warlock");
    expect(searchEntries("契约").length).toBeGreaterThan(2);
    expect(
      searchEntries("", "faction")
        .map((e) => e.slug)
        .sort(),
    ).toEqual(["harpers", "zhentarim"]);
  });
  it("keeps the theme index valid", () => {
    for (const t of themes) {
      expect(existsSync(`public/${t.image.src}`)).toBe(true);
      for (const e of t.entries) expect(getEntry(e.slug)).toBeTruthy();
      for (const s of t.scenarios)
        for (const e of s.entries) expect(getEntry(e), e).toBeTruthy();
    }
    expect(searchThemes("秘密").length).toBeGreaterThan(0);
  });
});

describe("example series", () => {
  const ex = exampleSeries();
  it("is a valid series labelled 原创示例 with one world and two stories in different eras", () => {
    expect(S.seriesSchema.parse(ex)).toEqual(ex);
    expect(ex.example).toBe(true);
    expect(ex.name).toContain("原创示例");
    const list = S.storiesInOrder(ex);
    expect(list.map((s) => s.id)).toEqual([S1, S2]);
    expect(list[0].eraId).not.toBe(list[1].eraId);
    expect(list[1].yearStart - list[0].yearEnd).toBeGreaterThan(10);
    const shared = list[0].cast.filter((c) => list[1].cast.includes(c));
    expect(shared.length).toBeGreaterThanOrEqual(3);
  });
  it("has consistent references everywhere", () => {
    const objIds = new Set(ex.objects.map((o) => o.id));
    const storyIds = new Set(ex.stories.map((s) => s.id));
    const evIds = new Set(ex.events.map((e) => e.id));
    const factIds = new Set(ex.world.facts.map((f) => f.id));
    for (const st of ex.stories)
      for (const id of [...st.cast, ...st.places, ...st.factions])
        expect(objIds.has(id), id).toBe(true);
    for (const o of ex.objects) {
      for (const s of o.states) expect(storyIds.has(s.storyId)).toBe(true);
      for (const slug of o.entrySlugs) expect(getEntry(slug)).toBeTruthy();
      if (o.image) expect(existsSync(`public/${o.image}`), o.image).toBe(true);
      for (const s of o.states)
        if (s.image)
          expect(existsSync(`public/${s.image}`), s.image).toBe(true);
    }
    for (const e of ex.events) {
      expect(!e.storyId || storyIds.has(e.storyId)).toBe(true);
      for (const id of [...e.characterIds, ...e.placeIds, ...e.factionIds])
        expect(objIds.has(id), id).toBe(true);
      for (const slug of e.entrySlugs) expect(getEntry(slug)).toBeTruthy();
    }
    for (const r of ex.relationships) {
      expect(objIds.has(r.from) && objIds.has(r.to) && r.from !== r.to).toBe(
        true,
      );
      expect(storyIds.has(r.storyId)).toBe(true);
    }
    for (const i of ex.influences) {
      expect(evIds.has(i.eventId)).toBe(true);
      expect(storyIds.has(i.storyId)).toBe(true);
      expect(
        !i.targetId || objIds.has(i.targetId) || factIds.has(i.targetId),
      ).toBe(true);
      // influence always flows from an earlier story into a later one
      const from = ex.stories.find(
        (s) => s.id === ex.events.find((e) => e.id === i.eventId)!.storyId,
      )!;
      const to = ex.stories.find((s) => s.id === i.storyId)!;
      expect(from.order).toBeLessThan(to.order);
    }
    for (const a of ex.adoptions)
      expect(getEntry(a.entrySlug), a.entrySlug).toBeTruthy();
    for (const img of [ex.image, ...ex.stories.map((s) => s.image)])
      expect(existsSync(`public/${img}`), img).toBe(true);
  });
  it("is not centred on true names or secrets", () => {
    expect(ex.adoptions.map((a) => a.entrySlug)).not.toContain("true-name");
    expect(JSON.stringify(ex)).not.toContain("真名");
  });
  it("shows a character's concrete changes between the two stories", () => {
    const suti = S.findObject(ex, "c-suti")!;
    expect(S.previousStateStory(ex, suti, S2)?.id).toBe(S1);
    const changes = S.stateChanges(suti, S1, S2);
    const role = changes.find((c) => c.key === "role")!;
    expect(role.before).toBe("渡口船工");
    expect(role.after).toContain("灰桥镇守");
    expect(changes.find((c) => c.key === "age")).toMatchObject({
      before: "19 岁",
      after: "37 岁",
    });
    const inf = S.influencesInto(ex, S2).filter(
      (v) => v.influence.targetId === "c-suti",
    );
    expect(inf[0].event?.title).toBe("渡口大火");
    expect(inf[0].fromStory?.id).toBe(S1);
  });
  it("records adoption decisions separately from visibility", () => {
    expect(ex.adoptions.map((a) => a.decision)).toEqual(
      expect.arrayContaining(["adapt", "reject", "undecided"]),
    );
    expect(ex.adoptions.some((a) => a.visibility === "private")).toBe(true);
    expect(S.decisionNames.adapt).toBe("改编");
  });
});

describe("editing model", () => {
  const ex = exampleSeries();
  it("a base-profile edit is shared by every story; a state edit stays in one story", () => {
    const suti = S.findObject(ex, "c-suti")!;
    const edited = {
      ...suti,
      profile: { ...suti.profile, motivation: "新的动机" },
    };
    expect(edited.profile.motivation).toBe("新的动机");
    const s2 = S.setState(suti, S2, "location", "议会厅");
    expect(S.stateIn(s2, S2)!.fields.location).toBe("议会厅");
    expect(S.stateIn(s2, S1)!.fields.location).toBe(
      S.stateIn(suti, S1)!.fields.location,
    );
    const fresh = S.setState(S.findObject(ex, "c-noa")!, S1, "role", "婴儿");
    expect(S.stateIn(fresh, S1)!.fields.role).toBe("婴儿");
  });
  it("adds an adoption once and never touches the reference entry", () => {
    const before = JSON.stringify(getEntry("lich"));
    const s = S.addAdoption(ex, "lich");
    expect(s.adoptions.at(-1)).toMatchObject({
      entrySlug: "lich",
      decision: "undecided",
      canon: "",
      change: "",
    });
    expect(S.addAdoption(s, "lich").adoptions.length).toBe(s.adoptions.length);
    expect(JSON.stringify(getEntry("lich"))).toBe(before);
  });
  it("creates an empty series with one story", () => {
    const s = S.emptySeries("新系列");
    expect(s.stories).toHaveLength(1);
    expect(S.seriesSchema.parse(s)).toEqual(s);
  });
});

describe("storage and migration", () => {
  it("seeds a fresh store with the example and saves under dnd-workbench-v2", () => {
    const st = mem();
    const { state, blocked } = S.loadWb(st);
    expect(blocked).toBe(false);
    expect(state.series[0].id).toBe("example-ashriver");
    S.saveWb(state, st);
    expect(S.WB_KEY).toBe("dnd-workbench-v2");
    expect(JSON.parse(st.getItem(S.WB_KEY)!).version).toBe(2);
    expect(st.getItem("wayfarer-5e-v1")).toBeNull();
  });
  it("migrates every round-3 project into a one-story series and keeps the old save", () => {
    const st = mem();
    st.setItem(S.WB_KEY_V1, v1Save);
    const r = S.loadWb(st);
    expect(r.notice).toContain("2 个项目");
    expect(r.notice).toContain("旧存档原样保留");
    expect(r.state.series.map((s) => s.id)).toEqual([
      "example-ashriver",
      "example-greyharbor",
      "proj-mine",
    ]);
    expect(r.state.favorites).toEqual(["lich"]);
    const old = JSON.parse(v1Save).projects[0];
    const s = r.state.series[1];
    expect(s.stories).toHaveLength(1);
    expect(S.objectsOf(s, "character").map((c) => c.name)).toEqual(
      old.characters.map((c: { name: string }) => c.name),
    );
    expect(S.objectsOf(s, "character")[0].profile.secret).toBe(
      old.characters[0].secret,
    );
    expect(s.events.map((e) => e.title)).toEqual(
      old.plots.map((p: { title: string }) => p.title),
    );
    expect(s.relationships).toHaveLength(old.relationships.length);
    expect(s.relationships.every((x) => x.storyId === s.stories[0].id)).toBe(
      true,
    );
    expect(s.adoptions.map((a) => a.entrySlug)).toEqual(
      old.adaptations.map((a: { slug: string }) => a.slug),
    );
    expect(s.adoptions.find((a) => a.entrySlug === "warlock")!.decision).toBe(
      "adapt",
    );
    expect(st.getItem(S.WB_KEY_V1)).toBe(v1Save);
  });
  it("blocks autosave and keeps a corrupted v2 save untouched", () => {
    const st = mem();
    st.setItem(S.WB_KEY, "{broken");
    const r = S.loadWb(st);
    expect(r.blocked).toBe(true);
    expect(r.warning).toContain("暂停自动保存");
    expect(st.getItem(S.WB_KEY)).toBe("{broken");
  });
  it("rejects unknown versions", () => {
    expect(() => S.migrate({ version: 3, series: [] })).toThrow("不支持");
  });
});

describe("export and import", () => {
  const ex = exampleSeries();
  it("exports Markdown with series, world, stories, states, events, relationships and influences", () => {
    const md = S.seriesMarkdown(ex);
    expect(md).toContain("# 烬川纪事（原创示例）");
    expect(md).toContain("烬川");
    expect(md).toContain("盐税年代");
    expect(md).toContain("《渡口之火》");
    expect(md).toContain("《灰桥》");
    expect(md).toContain("37 岁");
    expect(md).toContain("苏缇 → 阿岚｜保护");
    expect(md).toMatch(/起因/);
    expect(md).toContain("前作影响");
    expect(md).toContain("渡口大火");
    expect(md).toContain("采用的设定");
    expect(md).toContain(S.SAVE_LABEL);
    expect(md).toContain("（仅自己）");
    expect(md).toContain("渡影的来历");
  });
  it("leaves private items out of the public export", () => {
    const md = S.seriesMarkdown(ex, true);
    expect(md).not.toContain("仅自己");
    expect(md).not.toContain("渡影的来历");
    expect(md).not.toContain("没有告诉弟弟渡影这次要的是什么");
    expect(md).toContain("渡口大火");
    const pub = JSON.parse(S.seriesJson(ex, true)).series as S.Series;
    expect(pub.world.facts.some((f) => f.visibility === "private")).toBe(false);
    expect(pub.relationships.some((r) => r.visibility === "private")).toBe(
      false,
    );
    expect(pub.adoptions.some((a) => a.visibility === "private")).toBe(false);
  });
  it("round-trips JSON and never overwrites on import", () => {
    const prev = S.parseImport(S.seriesJson(ex), [ex]);
    expect(prev.series).toEqual(ex);
    expect(prev.collision).toBe(true);
    const merged = S.applyImport(S.freshState(), prev);
    expect(merged.series).toHaveLength(2);
    expect(merged.series[1].id).not.toBe(ex.id);
    expect(merged.series[1].name).toContain("（导入）");
    expect(merged.series[0]).toEqual(ex);
  });
  it("imports a round-3 project file as a series", () => {
    const old = JSON.parse(v1Save).projects[1];
    const prev = S.parseImport(
      JSON.stringify({
        format: "dnd-workbench-project",
        version: 1,
        project: old,
      }),
      [],
    );
    expect(prev.series.name).toBe("雾港旧稿");
    expect(prev.series.stories).toHaveLength(1);
  });
  it("rejects malformed files and tabletop backups with clear messages", () => {
    expect(() => S.parseImport("{nope")).toThrow("不是有效的 JSON");
    expect(() =>
      S.parseImport(
        JSON.stringify({ version: 1, characters: [], activeId: null }),
      ),
    ).toThrow("跑团工具");
    expect(() => S.parseImport(JSON.stringify({ hello: 1 }))).toThrow();
  });
});

describe("routes", () => {
  it("round-trips stable hash routes", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "library", cat: "class", q: "契约 魔鬼" },
      { name: "entry", slug: "true-name", tab: "sources" },
      { name: "themes", q: "秘密" },
      { name: "theme", slug: "secrets" },
      { name: "drafts" },
      seriesRoute("example-ashriver"),
      seriesRoute("example-ashriver", "characters", "c-suti", { story: S2 }),
      seriesRoute("example-ashriver", "stories", S2, { mode: "influence" }),
      seriesRoute("example-ashriver", "stories", S1, { pub: true }),
      seriesRoute("example-ashriver", "adoptions", "warlock"),
      { name: "tools", view: "spells", q: "Fireball" },
    ];
    for (const r of routes) expect(parseHash(href(r))).toEqual(r);
  });
  it("maps older hashes to the new routes", () => {
    expect(parseHash("#tools")).toEqual({
      name: "tools",
      view: "sheet",
      q: "",
    });
    expect(parseHash("#classes")).toEqual({
      name: "library",
      cat: "class",
      q: "",
    });
    expect(parseHash("#/browse?cat=plane")).toEqual({
      name: "library",
      cat: "plane",
      q: "",
    });
    expect(parseHash("#/favorites")).toEqual({
      name: "library",
      cat: "fav",
      q: "",
    });
    expect(parseHash("#/projects/example-greyharbor/plots")).toEqual(
      seriesRoute("example-greyharbor", "stories"),
    );
    expect(parseHash("#/projects/p1/relationships")).toEqual(
      seriesRoute("p1", "characters"),
    );
  });
});

describe("copy rules", () => {
  const files = [
    "src/Workbench.tsx",
    "src/wb/SeriesView.tsx",
    "src/wb/entries.ts",
    "src/wb/themes.ts",
    "src/App.tsx",
    "index.html",
  ];
  const text = files.map((f) => readFileSync(f, "utf8")).join("\n");
  it("removes the old slogans and second person", () => {
    for (const s of [
      "找到你的冒险方式",
      "把每一次出手，变成可靠的答案",
      "开启属于你的传奇",
    ])
      expect(text).not.toContain(s);
    expect(text.match(/你/g) ?? []).toHaveLength(0);
  });
  it("uses the literal action labels and the local-save label", () => {
    for (const s of [
      "新建系列",
      "导入 JSON",
      "导出 Markdown（公开内容）",
      "导出 JSON",
      "加入系列设定",
      "编辑基本资料",
      "编辑此时的状态",
      "添加影响",
      "添加关系",
      "SAVE_LABEL",
    ])
      expect(text).toContain(s);
    expect(S.SAVE_LABEL).toBe("保存在本浏览器（未同步到 GitHub）");
  });
  it("does not render the word 待核实 anywhere in the UI code", () => {
    expect(readFileSync("src/Workbench.tsx", "utf8")).not.toContain("待核实");
    expect(readFileSync("src/wb/SeriesView.tsx", "utf8")).not.toContain(
      "待核实",
    );
  });
});
