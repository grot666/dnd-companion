import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { entries, getEntry, searchEntries } from "../src/wb/entries";
import { themes, searchThemes } from "../src/wb/themes";
import { sources } from "../src/wb/sources";
import * as P from "../src/wb/project";
import { parseHash, href, type Route } from "../src/wb/router";

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

describe("entry data integrity", () => {
  it("has unique slugs and resolvable links", () => {
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    for (const e of entries) {
      for (const r of e.related) expect(getEntry(r), `${e.slug} → ${r}`).toBeTruthy();
      for (const t of e.themes) expect(themes.some((x) => x.slug === t), `${e.slug} theme ${t}`).toBe(true);
      for (const [sid] of e.sources) expect(sources[sid], `${e.slug} source ${sid}`).toBeTruthy();
    }
  });
  it("cites every sourced paragraph and never cites unknown sources", () => {
    for (const e of entries)
      for (const s of e.sections)
        for (const b of s.blocks) {
          if (b.p === "source") expect(b.cite?.length, `${e.slug}: ${b.text.slice(0, 20)}`).toBeGreaterThan(0);
          for (const [sid] of b.cite ?? []) expect(sources[sid]).toBeTruthy();
        }
  });
  it("marks claims that rest on unread books or secondary sources as 待核实", () => {
    for (const e of entries)
      for (const s of e.sections)
        for (const b of s.blocks)
          if ((b.cite ?? []).some(([sid]) => sources[sid].kind === "book" || sources[sid].kind === "secondary")) expect(b.p, `${e.slug}: ${b.text.slice(0, 30)}`).toBe("unverified");
  });
  it("only links verified https sources and keeps books without URLs", () => {
    for (const s of Object.values(sources)) {
      if (s.kind === "book") expect(s.url).toBeUndefined();
      else expect(s.url).toMatch(/^https:\/\//);
    }
  });
  it("keeps the first batch of deep entries with images on disk", () => {
    for (const slug of ["warlock", "paladin", "cleric", "wizard", "rogue", "pact", "oath", "soul-death", "true-name", "devils", "celestials", "lich", "nine-hells", "shadowfell", "harpers", "zhentarim"]) {
      const e = getEntry(slug)!;
      expect(e.depth).toBe("deep");
      expect(e.sections.length).toBeGreaterThan(0);
      expect(existsSync(`public/${e.image!.src}`), e.image!.src).toBe(true);
    }
  });
  it("keeps the SRD catalog browsable: 12 classes and 9 races", () => {
    expect(entries.filter((e) => e.category === "class")).toHaveLength(12);
    expect(entries.filter((e) => e.category === "race")).toHaveLength(9);
  });
  it("tags faction entries with their setting", () => {
    expect(getEntry("harpers")!.setting).toContain("Forgotten Realms");
    expect(getEntry("zhentarim")!.setting).toContain("Forgotten Realms");
  });
  it("never states True Name as a sourced universal rule", () => {
    const tn = getEntry("true-name")!;
    const sourced = tn.sections.flatMap((s) => s.blocks).filter((b) => b.p === "source");
    expect(sourced.every((b) => !/真名/.test(b.text))).toBe(true);
    expect(tn.summary).toContain("不是 D&D 的通用规则");
  });
  it("searches names, English names and tags", () => {
    expect(searchEntries("warlock").map((e) => e.slug)).toContain("warlock");
    expect(searchEntries("契约").length).toBeGreaterThan(2);
    expect(searchEntries("", "faction").map((e) => e.slug).sort()).toEqual(["harpers", "zhentarim"]);
  });
});

describe("themes", () => {
  it("has the five editorial themes with images and valid links", () => {
    expect(themes.map((t) => t.zh)).toEqual(["权力与依附", "契约与束缚", "身份与秘密", "信仰与义务", "死亡与灵魂"]);
    for (const t of themes) {
      expect(existsSync(`public/${t.image.src}`)).toBe(true);
      expect(t.conditions.length).toBeGreaterThan(1);
      for (const e of t.entries) expect(getEntry(e.slug)).toBeTruthy();
      for (const s of t.scenarios) for (const e of s.entries) expect(getEntry(e), e).toBeTruthy();
      for (const a of t.adjacent) expect(themes.some((x) => x.slug === a)).toBe(true);
    }
  });
  it("makes 'holding a secret gives influence' discoverable from both themes", () => {
    const hits = searchThemes("秘密 影响力");
    expect(hits.map((h) => h.theme.slug).sort()).toEqual(["power", "secrets"]);
    for (const h of hits) expect(h.scenario.entries).toEqual(expect.arrayContaining(["true-name", "pact", "warlock", "zhentarim"]));
  });
});

describe("copy rules", () => {
  const files = ["src/Workbench.tsx", "src/wb/ProjectView.tsx", "src/wb/entries.ts", "src/wb/themes.ts", "src/App.tsx", "index.html"];
  const text = files.map((f) => readFileSync(f, "utf8")).join("\n");
  it("removes the old slogans", () => {
    for (const s of ["找到你的冒险方式", "把每一次出手，变成可靠的答案", "先看玩法，再看规则", "开启属于你的传奇", "每一个传奇"]) expect(text).not.toContain(s);
  });
  it("avoids second person in reading content and UI", () => {
    expect(text.match(/你/g) ?? []).toHaveLength(0);
  });
  it("uses the literal action labels", () => {
    for (const s of ["收藏到项目", "添加关系", "导出 Markdown", "导出 JSON", P.SAVE_LABEL]) expect(text + P.SAVE_LABEL).toContain(s);
  });
});

describe("creative projects", () => {
  const ex = P.exampleProject();
  it("ships a valid example labelled 原创示例 with consistent references", () => {
    expect(P.projectSchema.parse(ex)).toEqual(ex);
    expect(ex.example).toBe(true);
    expect(ex.name).toContain("原创示例");
    const ids = new Set(ex.characters.map((c) => c.id));
    for (const r of ex.relationships) {
      expect(ids.has(r.from) && ids.has(r.to)).toBe(true);
      expect(r.from).not.toBe(r.to);
      expect(r.description.length).toBeGreaterThan(6);
    }
    const locs = new Set(ex.locations.map((l) => l.id));
    for (const pl of ex.plots) {
      expect(pl.cause && pl.conflict && pl.consequence).toBeTruthy();
      pl.characterIds.forEach((c) => expect(ids.has(c)).toBe(true));
      pl.locationIds.forEach((l) => expect(locs.has(l)).toBe(true));
      pl.entrySlugs.forEach((s) => expect(getEntry(s)).toBeTruthy());
    }
    for (const a of ex.adaptations) {
      expect(getEntry(a.slug)).toBeTruthy();
      expect(a.changed.length).toBeGreaterThan(0);
    }
    for (const c of ex.characters.slice(0, 3)) for (const k of ["appearance", "identity", "history", "motivation", "desire", "secret", "abilities", "limits"] as const) expect(c[k], `${c.name}.${k}`).not.toBe("");
  });
  it("seeds a fresh store and saves under its own versioned key", () => {
    const st = new MemStorage() as unknown as Storage;
    const { state, blocked } = P.loadWb(st);
    expect(blocked).toBe(false);
    expect(state.projects[0].id).toBe("example-greyharbor");
    P.saveWb(state, st);
    expect(JSON.parse(st.getItem(P.WB_KEY)!).version).toBe(1);
    expect(st.getItem("wayfarer-5e-v1")).toBeNull();
  });
  it("migrates older partial saves and rejects unknown versions", () => {
    const old = { projects: [{ id: "a", name: "旧项目", createdAt: "x", updatedAt: "x" }] };
    const m = P.migrate(old);
    expect(m.favorites).toEqual([]);
    expect(m.projects[0].characters).toEqual([]);
    expect(m.projects[0].adaptations).toEqual([]);
    expect(() => P.migrate({ version: 2, projects: [] })).toThrow("不支持");
  });
  it("blocks autosave and keeps a corrupted save untouched", () => {
    const st = new MemStorage() as unknown as Storage;
    st.setItem(P.WB_KEY, "{broken");
    const r = P.loadWb(st);
    expect(r.blocked).toBe(true);
    expect(r.warning).toContain("自动保存已暂停");
    expect(st.getItem(P.WB_KEY)).toBe("{broken");
  });
  it("adds a favorite without touching the original entry", () => {
    const before = JSON.stringify(getEntry("lich"));
    const p = P.addAdaptation(ex, "lich");
    expect(p.adaptations.at(-1)).toMatchObject({ slug: "lich", adopted: "", changed: "" });
    expect(P.addAdaptation(p, "lich").adaptations.length).toBe(p.adaptations.length);
    expect(JSON.stringify(getEntry("lich"))).toBe(before);
  });
  it("exports Markdown with characters, directed relationships, plots, sources and adaptations", () => {
    const md = P.projectMarkdown(ex);
    expect(md).toContain("# 灰港契约（原创示例）");
    expect(md).toContain("原创示例：本项目的人物、关系与情节均为原创");
    expect(md).toContain("马尔科·韦斯（Marco Vess） → 伊瑟·洛温（Isel Rowan）｜掌握秘密");
    expect(md).toContain("### 第三个签名");
    expect(md).toContain("- **起因**：");
    expect(md).toContain("**设定摘要（来源内容）**");
    expect(md).toContain("**本项目改动**：恩主不是大魔鬼");
    expect(md).toContain(sources.srd51.url!);
    expect(md).toContain(sources.basicFactions.url!);
  });
  it("round-trips JSON and never overwrites on import", () => {
    const json = P.projectJson(ex);
    const prev = P.parseImport(json);
    expect(prev.projects[0]).toEqual(ex);
    const merged = P.applyImport(P.freshState(), prev);
    expect(merged.projects).toHaveLength(2);
    expect(merged.projects[1].id).not.toBe(ex.id);
    expect(merged.projects[0]).toEqual(ex);
  });
  it("rejects malformed files and tabletop backups with clear messages", () => {
    expect(() => P.parseImport("{nope")).toThrow("不是有效的 JSON");
    expect(() => P.parseImport(JSON.stringify({ version: 1, characters: [], activeId: null }))).toThrow("跑团工具");
    expect(() => P.parseImport(JSON.stringify({ format: P.PROJECT_FORMAT, version: 1, project: { id: "x" } }))).toThrow("校验失败");
  });
});

describe("routes", () => {
  it("round-trips stable hash routes", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "browse", cat: "class", q: "契约 魔鬼" },
      { name: "entry", slug: "true-name", tab: "sources" },
      { name: "themes", q: "秘密" },
      { name: "theme", slug: "secrets" },
      { name: "projects" },
      { name: "project", id: "example-greyharbor", tab: "relationships", item: "" },
      { name: "project", id: "p1", tab: "characters", item: "c-isel" },
      { name: "favorites" },
      { name: "tools", view: "spells", q: "Fireball" },
    ];
    for (const r of routes) expect(parseHash(href(r))).toEqual(r);
  });
  it("maps v2 hashes to the new routes", () => {
    expect(parseHash("#tools")).toEqual({ name: "tools", view: "sheet", q: "" });
    expect(parseHash("#classes")).toEqual({ name: "browse", cat: "class", q: "" });
    expect(parseHash("#spells")).toMatchObject({ name: "tools", view: "spells" });
  });
});
