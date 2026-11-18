import { z } from "zod";
import { getEntry } from "./entries";
import { sources, licenseLabel } from "./sources";
import {
  migrateV1,
  projectSchema as v1ProjectSchema,
  PROJECT_FORMAT_V1,
  WB_KEY_V1,
  type Project as V1Project,
} from "./legacy-v1";
import { exampleSeries } from "./example";

export const WB_KEY = "dnd-workbench-v2";
export { WB_KEY_V1 };
export const SAVE_LABEL = "保存在本浏览器（未同步到 GitHub）";

// ---------------------------------------------------------------- schema
const id = z.string().min(1).max(80);
const text = (max = 6000) => z.string().max(max).default("");
const ids = z.array(z.string()).default([]);
/** Visibility: whether an item belongs to the public version (export / public preview). */
const visibility = z.enum(["public", "private"]).default("public");
const fields = z.record(z.string(), z.string().max(6000)).default({});

export const objectKinds = ["character", "place", "faction"] as const;
export type ObjectKind = (typeof objectKinds)[number];
export const kindNames: Record<ObjectKind, string> = {
  character: "人物",
  place: "地点",
  faction: "势力",
};

/** Fields shared by every story (the base, canonical description). */
export const profileFields: Record<ObjectKind, [string, string][]> = {
  character: [
    ["identity", "身份"],
    ["appearance", "外貌"],
    ["history", "经历"],
    ["motivation", "动机"],
    ["desire", "欲望"],
    ["secret", "秘密"],
    ["abilities", "能力"],
    ["limits", "限制"],
    ["notes", "备注"],
  ],
  place: [
    ["description", "描述"],
    ["geography", "地理"],
    ["history", "历史"],
  ],
  faction: [
    ["description", "描述"],
    ["goals", "目标"],
    ["structure", "组织"],
  ],
};
/** Fields that describe an object at one story's point in time. */
export const stateFields: Record<ObjectKind, [string, string][]> = {
  character: [
    ["age", "年龄"],
    ["role", "身份与职务"],
    ["status", "状况"],
    ["allegiance", "效忠与立场"],
    ["location", "所在地"],
    ["appearance", "外貌变化"],
    ["knowledge", "此时知道的事"],
    ["note", "备注"],
  ],
  place: [
    ["status", "状况"],
    ["control", "控制者"],
    ["appearance", "面貌"],
    ["note", "备注"],
  ],
  faction: [
    ["status", "状况"],
    ["leader", "首领"],
    ["strength", "实力"],
    ["stance", "立场"],
    ["note", "备注"],
  ],
};

export const stateSchema = z.object({
  storyId: id,
  fields,
  image: z.string().max(200).optional(),
  visibility,
});
export const objectSchema = z.object({
  id,
  kind: z.enum(objectKinds),
  name: z.string().min(1).max(120),
  summary: text(1000),
  profile: fields,
  entrySlugs: ids,
  image: z.string().max(200).optional(),
  visibility,
  states: z.array(stateSchema).default([]),
});
export const eraSchema = z.object({
  id,
  name: z.string().min(1).max(80),
  start: z.number().int(),
  end: z.number().int().nullable().default(null),
  description: text(2000),
});
export const factSchema = z.object({
  id,
  title: z.string().min(1).max(120),
  category: z.string().max(20).default("其他"),
  text: text(),
  entrySlugs: ids,
  visibility,
});
export const worldSchema = z.object({
  name: z.string().max(120).default(""),
  overview: text(),
  calendar: z.string().max(40).default("年"),
  image: z.string().max(200).optional(),
  eras: z.array(eraSchema).default([]),
  facts: z.array(factSchema).default([]),
});
export const chapterSchema = z.object({
  id,
  title: z.string().min(1).max(160),
  text: text(),
  visibility,
});
export const storySchema = z.object({
  id,
  title: z.string().min(1).max(160),
  order: z.number().int().default(1),
  eraId: z.string().default(""),
  yearStart: z.number().int().default(0),
  yearEnd: z.number().int().default(0),
  synopsis: text(),
  chapters: z.array(chapterSchema).default([]),
  cast: ids,
  places: ids,
  factions: ids,
  image: z.string().max(200).optional(),
  visibility,
});
export const eventSchema = z.object({
  id,
  storyId: z.string().default(""),
  year: z.number().int().default(0),
  title: z.string().min(1).max(160),
  cause: text(),
  conflict: text(),
  consequence: text(),
  characterIds: ids,
  placeIds: ids,
  factionIds: ids,
  entrySlugs: ids,
  carriesForward: z.boolean().default(false),
  visibility,
});
export const relationshipSchema = z.object({
  id,
  from: id,
  to: id,
  type: z.string().min(1).max(40),
  description: text(2000),
  storyId: z.string().default(""),
  visibility,
});
/** The author's decision about a reference entry. Independent of verification, license and visibility. */
export const decisions = ["adopt", "adapt", "reject", "undecided"] as const;
export type Decision = (typeof decisions)[number];
export const decisionNames: Record<Decision, string> = {
  adopt: "采用",
  adapt: "改编",
  reject: "不采用",
  undecided: "未决定",
};
export const adoptionSchema = z.object({
  id,
  entrySlug: z.string().min(1),
  decision: z.enum(decisions).default("undecided"),
  canon: text(),
  change: text(),
  visibility,
  updatedAt: z.string(),
});
/** An event in one story changes something in a later story. */
export const influenceSchema = z.object({
  id,
  eventId: id,
  storyId: id,
  targetId: z.string().default(""),
  description: text(2000),
  visibility,
});
export const seriesSchema = z.object({
  id,
  name: z.string().min(1).max(160),
  summary: text(),
  example: z.boolean().default(false),
  image: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  world: worldSchema.default({
    name: "",
    overview: "",
    calendar: "年",
    eras: [],
    facts: [],
  }),
  objects: z.array(objectSchema).default([]),
  stories: z.array(storySchema).default([]),
  events: z.array(eventSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  adoptions: z.array(adoptionSchema).default([]),
  influences: z.array(influenceSchema).default([]),
});
export const wbStateSchema = z.object({
  version: z.literal(2),
  series: z.array(seriesSchema),
  favorites: z.array(z.string()).default([]),
  migratedFrom: z.string().optional(),
});

export type Visibility = "public" | "private";
export type StoryState = z.infer<typeof stateSchema>;
export type SObject = z.infer<typeof objectSchema>;
export type Era = z.infer<typeof eraSchema>;
export type Fact = z.infer<typeof factSchema>;
export type World = z.infer<typeof worldSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Story = z.infer<typeof storySchema>;
export type SEvent = z.infer<typeof eventSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Adoption = z.infer<typeof adoptionSchema>;
export type Influence = z.infer<typeof influenceSchema>;
export type Series = z.infer<typeof seriesSchema>;
export type WbState = z.infer<typeof wbStateSchema>;

export const relationTypes = [
  "亲人",
  "保护",
  "依赖",
  "效忠",
  "合作",
  "亏欠",
  "愧疚",
  "怨恨",
  "敌对",
  "利用",
  "信任",
  "分歧",
  "隐瞒",
  "其他",
];
export const factCategories = [
  "地理",
  "历史",
  "魔法",
  "宇宙观",
  "社会",
  "其他",
];

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
export const now = () => new Date().toISOString();

// ---------------------------------------------------------------- queries
export const storiesInOrder = (s: Series) =>
  [...s.stories].sort((a, b) => a.order - b.order || a.yearStart - b.yearStart);
export const objectsOf = (s: Series, kind: ObjectKind) =>
  s.objects.filter((o) => o.kind === kind);
export const findObject = (s: Series, oid: string) =>
  s.objects.find((o) => o.id === oid);
export const stateIn = (o: SObject, storyId: string) =>
  o.states.find((st) => st.storyId === storyId);
export const storyLabel = (s: Series, st: Story) => `《${st.title}》`;
export const yearLabel = (
  s: Series,
  st: { yearStart: number; yearEnd: number },
) =>
  `${s.world.calendar} ${st.yearStart}${st.yearEnd && st.yearEnd !== st.yearStart ? `–${st.yearEnd}` : ""}`;

/** The story before `storyId` in which the object has a recorded state. */
export function previousStateStory(
  s: Series,
  o: SObject,
  storyId: string,
): Story | undefined {
  const list = storiesInOrder(s);
  const idx = list.findIndex((x) => x.id === storyId);
  for (let i = idx - 1; i >= 0; i--) if (stateIn(o, list[i].id)) return list[i];
  return undefined;
}

export type FieldChange = {
  key: string;
  label: string;
  before: string;
  after: string;
};
/** Field-by-field changes of an object between two stories. */
export function stateChanges(
  o: SObject,
  fromStoryId: string,
  toStoryId: string,
): FieldChange[] {
  const a = stateIn(o, fromStoryId)?.fields ?? {};
  const b = stateIn(o, toStoryId)?.fields ?? {};
  return stateFields[o.kind]
    .map(([key, label]) => ({
      key,
      label,
      before: (a[key] ?? "").trim(),
      after: (b[key] ?? "").trim(),
    }))
    .filter((c) => c.before !== c.after && (c.before || c.after));
}

export const relationsIn = (s: Series, storyId: string) =>
  s.relationships.filter((r) => r.storyId === storyId || r.storyId === "");
export const eventsIn = (s: Series, storyId: string) =>
  s.events.filter((e) => e.storyId === storyId).sort((a, b) => a.year - b.year);

export type InfluenceView = {
  influence: Influence;
  event?: SEvent;
  fromStory?: Story;
  target?: SObject;
  fact?: Fact;
};
export function influencesInto(s: Series, storyId: string): InfluenceView[] {
  return s.influences
    .filter((i) => i.storyId === storyId)
    .map((influence) => {
      const event = s.events.find((e) => e.id === influence.eventId);
      return {
        influence,
        event,
        fromStory: s.stories.find((st) => st.id === event?.storyId),
        target: findObject(s, influence.targetId),
        fact: s.world.facts.find((f) => f.id === influence.targetId),
      };
    });
}
export const influencesFrom = (s: Series, storyId: string) => {
  const evIds = new Set(eventsIn(s, storyId).map((e) => e.id));
  return s.influences.filter((i) => evIds.has(i.eventId));
};
/** Events from stories earlier than `storyId`. */
export function earlierEvents(s: Series, storyId: string): SEvent[] {
  const list = storiesInOrder(s);
  const idx = list.findIndex((x) => x.id === storyId);
  const earlier = new Set(list.slice(0, Math.max(idx, 0)).map((x) => x.id));
  return s.events
    .filter((e) => earlier.has(e.storyId))
    .sort((a, b) => a.year - b.year);
}
export const appearsIn = (s: Series, o: SObject) =>
  storiesInOrder(s).filter(
    (st) =>
      st.cast.includes(o.id) ||
      st.places.includes(o.id) ||
      st.factions.includes(o.id) ||
      stateIn(o, st.id),
  );

// ---------------------------------------------------------------- mutations
export const touch = (s: Series): Series => ({ ...s, updatedAt: now() });
export function setState(
  o: SObject,
  storyId: string,
  key: string,
  value: string,
): SObject {
  const existing = stateIn(o, storyId);
  const states = existing
    ? o.states.map((st) =>
        st.storyId === storyId
          ? { ...st, fields: { ...st.fields, [key]: value } }
          : st,
      )
    : [
        ...o.states,
        { storyId, fields: { [key]: value }, visibility: "public" as const },
      ];
  return { ...o, states };
}
export function addAdoption(s: Series, slug: string): Series {
  if (s.adoptions.some((a) => a.entrySlug === slug)) return s;
  return {
    ...s,
    adoptions: [
      ...s.adoptions,
      {
        id: uid("adopt"),
        entrySlug: slug,
        decision: "undecided",
        canon: "",
        change: "",
        visibility: "public",
        updatedAt: now(),
      },
    ],
  };
}
export function emptySeries(name: string): Series {
  const t = now();
  const storyId = uid("story");
  return seriesSchema.parse({
    id: uid("series"),
    name: name || "未命名系列",
    summary: "",
    createdAt: t,
    updatedAt: t,
    world: { name: "", overview: "", calendar: "年", eras: [], facts: [] },
    stories: [{ id: storyId, title: "故事一", order: 1 }],
  });
}

// ---------------------------------------------------------------- migration & storage
/** A round-3 project becomes a series with one story; every field is kept. */
export function projectToSeries(p: V1Project): Series {
  const storyId = `${p.id}-story-1`;
  return seriesSchema.parse({
    id: p.id,
    name: p.name,
    summary: p.summary,
    example: p.example,
    image: p.image,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    world: { name: "", overview: "", calendar: "年", eras: [], facts: [] },
    objects: [
      ...p.characters.map((c) => ({
        id: c.id,
        kind: "character",
        name: c.name,
        summary: c.identity.slice(0, 200),
        profile: {
          identity: c.identity,
          appearance: c.appearance,
          history: c.history,
          motivation: c.motivation,
          desire: c.desire,
          secret: c.secret,
          abilities: c.abilities,
          limits: c.limits,
          notes: c.notes,
        },
        entrySlugs: c.entrySlugs,
        image: c.image,
      })),
      ...p.locations.map((l) => ({
        id: l.id,
        kind: "place",
        name: l.name,
        summary: l.description.slice(0, 200),
        profile: { description: l.description },
        entrySlugs: l.entrySlugs,
      })),
    ],
    stories: [
      {
        id: storyId,
        title: "故事一",
        order: 1,
        cast: p.characters.map((c) => c.id),
        places: p.locations.map((l) => l.id),
      },
    ],
    events: p.plots.map((pl) => ({
      id: pl.id,
      storyId,
      title: pl.title,
      cause: pl.cause,
      conflict: pl.conflict,
      consequence: pl.consequence,
      characterIds: pl.characterIds,
      placeIds: pl.locationIds,
      entrySlugs: pl.entrySlugs,
    })),
    relationships: p.relationships.map((r) => ({ ...r, storyId })),
    adoptions: p.adaptations.map((a, i) => ({
      id: `${p.id}-adopt-${i + 1}`,
      entrySlug: a.slug,
      decision: a.changed.trim()
        ? "adapt"
        : a.adopted.trim()
          ? "adopt"
          : "undecided",
      canon: a.adopted,
      change: a.changed,
      updatedAt: a.addedAt,
    })),
  });
}

export const freshState = (): WbState => ({
  version: 2,
  series: [exampleSeries()],
  favorites: [],
});

export function migrate(raw: unknown): WbState {
  if (!raw || typeof raw !== "object") throw new Error("存档不是对象");
  const r = raw as Record<string, unknown>;
  if (r.version !== 2)
    throw new Error(`不支持的存档版本：${String(r.version)}`);
  return wbStateSchema.parse({
    ...r,
    series: Array.isArray(r.series) ? r.series : [],
    favorites: Array.isArray(r.favorites) ? r.favorites : [],
  });
}

export type LoadResult = {
  state: WbState;
  warning: string;
  notice: string;
  blocked: boolean;
};
export function loadWb(storage: Storage = localStorage): LoadResult {
  const raw = storage.getItem(WB_KEY);
  if (raw !== null) {
    try {
      return {
        state: migrate(JSON.parse(raw)),
        warning: "",
        notice: "",
        blocked: false,
      };
    } catch (e) {
      return {
        state: freshState(),
        warning: `本地存档无法读取（${(e as Error).message}）。为避免覆盖，已暂停自动保存，原始数据仍保留在浏览器中。`,
        notice: "",
        blocked: true,
      };
    }
  }
  const old = storage.getItem(WB_KEY_V1);
  if (old !== null) {
    try {
      const v1 = migrateV1(JSON.parse(old));
      const migrated = v1.projects.map(projectToSeries);
      const series = migrated.some((s) => s.id === "example-ashriver")
        ? migrated
        : [exampleSeries(), ...migrated];
      return {
        state: {
          version: 2,
          series,
          favorites: v1.favorites,
          migratedFrom: WB_KEY_V1,
        },
        warning: "",
        notice: `已把旧版存档中的 ${v1.projects.length} 个项目转换为系列（每个项目成为一个只有一部故事的系列）。旧存档原样保留，未被删除。`,
        blocked: false,
      };
    } catch (e) {
      return {
        state: freshState(),
        warning: `旧版存档无法读取（${(e as Error).message}），已保留原数据未改动。`,
        notice: "",
        blocked: false,
      };
    }
  }
  return { state: freshState(), warning: "", notice: "", blocked: false };
}
export function saveWb(state: WbState, storage: Storage = localStorage) {
  storage.setItem(WB_KEY, JSON.stringify(wbStateSchema.parse(state)));
}

// ---------------------------------------------------------------- export
export const SERIES_FORMAT = "dnd-workbench-series";

/** Returns a copy without private items (and references to them). */
export function publicCopy(s: Series): Series {
  const pub = <T extends { visibility: Visibility }>(xs: T[]) =>
    xs.filter((x) => x.visibility === "public");
  const objects = pub(s.objects).map((o) => ({ ...o, states: pub(o.states) }));
  const objIds = new Set(objects.map((o) => o.id));
  const stories = pub(s.stories).map((st) => ({
    ...st,
    chapters: pub(st.chapters),
    cast: st.cast.filter((x) => objIds.has(x)),
    places: st.places.filter((x) => objIds.has(x)),
    factions: st.factions.filter((x) => objIds.has(x)),
  }));
  const storyIds = new Set(stories.map((x) => x.id));
  const facts = pub(s.world.facts);
  const events = pub(s.events).filter(
    (e) => !e.storyId || storyIds.has(e.storyId),
  );
  const evIds = new Set(events.map((e) => e.id));
  const factIds = new Set(facts.map((f) => f.id));
  return {
    ...s,
    world: { ...s.world, facts },
    objects,
    stories,
    events: events.map((e) => ({
      ...e,
      characterIds: e.characterIds.filter((x) => objIds.has(x)),
      placeIds: e.placeIds.filter((x) => objIds.has(x)),
      factionIds: e.factionIds.filter((x) => objIds.has(x)),
    })),
    relationships: pub(s.relationships).filter(
      (r) =>
        objIds.has(r.from) &&
        objIds.has(r.to) &&
        (!r.storyId || storyIds.has(r.storyId)),
    ),
    adoptions: pub(s.adoptions),
    influences: pub(s.influences).filter(
      (i) =>
        evIds.has(i.eventId) &&
        storyIds.has(i.storyId) &&
        (!i.targetId || objIds.has(i.targetId) || factIds.has(i.targetId)),
    ),
  };
}

export function seriesJson(s: Series, publicOnly = false) {
  return JSON.stringify(
    {
      format: SERIES_FORMAT,
      version: 2,
      exportedAt: now(),
      publicOnly,
      series: publicOnly ? publicCopy(s) : s,
    },
    null,
    2,
  );
}

export function seriesMarkdown(input: Series, publicOnly = false): string {
  const s = publicOnly ? publicCopy(input) : input;
  const L: string[] = [];
  const priv = (v: Visibility) => (v === "private" ? "（仅自己）" : "");
  const name = (oid: string) => findObject(s, oid)?.name ?? oid;
  const para = (label: string, v?: string) =>
    v?.trim() && L.push(`- **${label}**：${v.trim().replace(/\n+/g, " ")}`);
  L.push(`# ${s.name}`, "");
  L.push(
    `> ${publicOnly ? "公开版本：不含作者标记为不公开的内容。" : "完整版本：包含标记为“仅自己”的内容。"}系列内容为作者原创；“采用的设定”一节列出参考的 D&D 资料及其出处。`,
    "",
  );
  if (s.summary) L.push(s.summary, "");
  L.push(`## 世界：${s.world.name || "未命名"}`, "");
  if (s.world.overview) L.push(s.world.overview, "");
  if (s.world.eras.length) {
    L.push("### 时代", "");
    for (const e of s.world.eras)
      L.push(
        `- **${e.name}**（${s.world.calendar} ${e.start}–${e.end ?? "至今"}）：${e.description}`,
      );
    L.push("");
  }
  if (s.world.facts.length) {
    L.push("### 已确定的设定", "");
    for (const f of s.world.facts)
      L.push(
        `- **${f.title}**${priv(f.visibility)}（${f.category}）：${f.text}`,
      );
    L.push("");
  }
  if (s.adoptions.length) {
    L.push("## 采用的设定", "");
    for (const a of s.adoptions) {
      const e = getEntry(a.entrySlug);
      L.push(
        `### ${e?.zh ?? a.entrySlug}${e ? ` ${e.en}` : ""}｜${decisionNames[a.decision]}${priv(a.visibility)}`,
        "",
      );
      if (a.canon) L.push(`本系列的设定：${a.canon}`, "");
      if (a.change) L.push(`改编说明：${a.change}`, "");
      if (e) {
        L.push(`参考资料摘要：${e.summary}（${e.edition}）`);
        for (const [sid, loc] of e.sources) {
          const src = sources[sid];
          if (src)
            L.push(
              `- 出处：${src.title}${loc ? `，${loc}` : ""}${src.url ? ` <${src.url}>` : ""}（${licenseLabel[src.license]}）`,
            );
        }
        L.push("");
      }
    }
  }
  for (const kind of objectKinds) {
    const list = objectsOf(s, kind);
    if (!list.length) continue;
    L.push(`## ${kindNames[kind]}`, "");
    for (const o of list) {
      L.push(`### ${o.name}${priv(o.visibility)}`, "");
      if (o.summary) L.push(o.summary, "");
      for (const [k, label] of profileFields[kind]) para(label, o.profile[k]);
      if (o.entrySlugs.length)
        para(
          "相关设定",
          o.entrySlugs.map((x) => getEntry(x)?.zh ?? x).join("、"),
        );
      L.push("");
    }
  }
  for (const st of storiesInOrder(s)) {
    L.push(
      `## 故事：《${st.title}》${priv(st.visibility)}`,
      "",
      `时间：${yearLabel(s, st)}${st.eraId ? `（${s.world.eras.find((e) => e.id === st.eraId)?.name ?? ""}）` : ""}`,
      "",
    );
    if (st.synopsis) L.push(st.synopsis, "");
    if (st.chapters.length) {
      L.push("### 章节", "");
      st.chapters.forEach((c, i) =>
        L.push(`${i + 1}. **${c.title}**${priv(c.visibility)}：${c.text}`),
      );
      L.push("");
    }
    const inStory = s.objects.filter((o) => stateIn(o, st.id));
    if (inStory.length) {
      L.push("### 此时的状态", "");
      for (const o of inStory) {
        const stt = stateIn(o, st.id)!;
        const parts = stateFields[o.kind]
          .map(([k, label]) =>
            stt.fields[k]?.trim() ? `${label}：${stt.fields[k].trim()}` : "",
          )
          .filter(Boolean);
        L.push(`- **${o.name}**${priv(stt.visibility)}：${parts.join("；")}`);
      }
      L.push("");
    }
    const evs = eventsIn(s, st.id);
    if (evs.length) {
      L.push("### 事件", "");
      for (const e of evs) {
        L.push(
          `#### ${s.world.calendar} ${e.year}｜${e.title}${priv(e.visibility)}`,
          "",
        );
        para("起因", e.cause);
        para("冲突", e.conflict);
        para("后果", e.consequence);
        if (e.characterIds.length)
          para("人物", e.characterIds.map(name).join("、"));
        if (e.placeIds.length || e.factionIds.length)
          para(
            "地点与势力",
            [...e.placeIds, ...e.factionIds].map(name).join("、"),
          );
        L.push("");
      }
    }
    const rels = s.relationships.filter((r) => r.storyId === st.id);
    if (rels.length) {
      L.push("### 人物关系（此时）", "");
      for (const r of rels)
        L.push(
          `- ${name(r.from)} → ${name(r.to)}｜${r.type}${priv(r.visibility)}：${r.description}`,
        );
      L.push("");
    }
    const inf = influencesInto(s, st.id);
    if (inf.length) {
      L.push("### 前作影响", "");
      for (const v of inf) {
        const target = v.target?.name ?? v.fact?.title ?? "整体局势";
        L.push(
          `- ${v.fromStory ? `《${v.fromStory.title}》` : ""}${v.event?.title ?? ""} → ${target}${priv(v.influence.visibility)}：${v.influence.description}`,
        );
      }
      L.push("");
    }
  }
  L.push(
    "---",
    `导出时间：${new Date().toLocaleString("zh-CN")}。${SAVE_LABEL}，此文件为导出副本。`,
  );
  return L.join("\n");
}

// ---------------------------------------------------------------- import
export type ImportPreview = {
  series: Series;
  counts: Record<string, number>;
  source: string;
  collision: boolean;
};
export function parseImport(
  textValue: string,
  existing: Series[] = [],
): ImportPreview {
  let data: unknown;
  try {
    data = JSON.parse(textValue);
  } catch {
    throw new Error("不是有效的 JSON 文件。");
  }
  const d = data as Record<string, unknown>;
  if (d && typeof d === "object" && "characters" in d && "activeId" in d)
    throw new Error("这是跑团工具的角色卡备份，请在“跑团工具”中导入。");
  let series: Series;
  let source = "系列 JSON";
  if (d?.format === SERIES_FORMAT) {
    const r = seriesSchema.safeParse(d.series);
    if (!r.success)
      throw new Error(
        `校验失败：${r.error.issues[0]?.path.join(".")} ${r.error.issues[0]?.message}`,
      );
    series = r.data;
  } else if (d?.format === PROJECT_FORMAT_V1) {
    const r = v1ProjectSchema.safeParse(d.project);
    if (!r.success)
      throw new Error(
        `校验失败：${r.error.issues[0]?.path.join(".")} ${r.error.issues[0]?.message}`,
      );
    series = projectToSeries(r.data);
    source = "旧版项目 JSON（转换为一部故事）";
  } else {
    throw new Error("无法识别的文件格式：需要本站导出的系列 JSON。");
  }
  const collision = existing.some((x) => x.id === series.id);
  return {
    series,
    source,
    collision,
    counts: {
      故事: series.stories.length,
      人物: objectsOf(series, "character").length,
      地点: objectsOf(series, "place").length,
      势力: objectsOf(series, "faction").length,
      事件: series.events.length,
      影响: series.influences.length,
    },
  };
}
export function applyImport(state: WbState, p: ImportPreview): WbState {
  const s = p.collision
    ? {
        ...p.series,
        id: uid("series"),
        name: `${p.series.name}（导入）`,
        example: false,
      }
    : p.series;
  return { ...state, series: [...state.series, touch(s)] };
}
