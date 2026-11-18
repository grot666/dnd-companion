import { z } from "zod";
import { getEntry } from "./entries";
import { sources } from "./sources";

export const WB_KEY = "dnd-workbench-v1";
export const SAVE_LABEL = "保存在本浏览器（未同步到 GitHub）";

const id = z.string().min(1).max(80);
const text = (max = 4000) => z.string().max(max).default("");

export const characterSchema = z.object({
  id,
  name: z.string().min(1).max(120),
  appearance: text(),
  identity: text(),
  history: text(),
  motivation: text(),
  desire: text(),
  secret: text(),
  abilities: text(),
  limits: text(),
  notes: text(),
  entrySlugs: z.array(z.string()).default([]),
  image: z.string().max(200).optional(),
});
export const relationshipSchema = z.object({
  id,
  from: id,
  to: id,
  type: z.string().min(1).max(40),
  description: text(2000),
});
export const plotSchema = z.object({
  id,
  title: z.string().min(1).max(160),
  cause: text(),
  conflict: text(),
  consequence: text(),
  characterIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
  entrySlugs: z.array(z.string()).default([]),
});
export const locationSchema = z.object({
  id,
  name: z.string().min(1).max(120),
  description: text(),
  entrySlugs: z.array(z.string()).default([]),
});
export const adaptationSchema = z.object({
  slug: z.string().min(1),
  adopted: text(),
  changed: text(),
  addedAt: z.string(),
});
export const projectSchema = z.object({
  id,
  name: z.string().min(1).max(160),
  summary: text(),
  example: z.boolean().default(false),
  image: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  characters: z.array(characterSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  plots: z.array(plotSchema).default([]),
  locations: z.array(locationSchema).default([]),
  adaptations: z.array(adaptationSchema).default([]),
});
export const wbStateSchema = z.object({
  version: z.literal(1),
  projects: z.array(projectSchema),
  favorites: z.array(z.string()).default([]),
});
export type Character = z.infer<typeof characterSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Plot = z.infer<typeof plotSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Adaptation = z.infer<typeof adaptationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type WbState = z.infer<typeof wbStateSchema>;

export const relationTypes = ["保护", "亏欠", "掌握秘密", "效忠", "依附", "契约", "敌对", "利用", "隐瞒", "信任", "其他"];

let counter = 0;
export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const now = () => new Date().toISOString();

export function exampleProject(): Project {
  const t = "2026-11-18T00:00:00.000Z";
  return {
    id: "example-greyharbor",
    name: "灰港契约（原创示例）",
    summary:
      "原创示例项目，用于展示角色、关系、情节与设定改编的记录方式。人物、地点、关系与情节均为原创，不是官方设定；引用的设定条目保留原始来源，本项目的改动单独记录。",
    example: true,
    image: "art/project-greyharbor.webp",
    createdAt: t,
    updatedAt: t,
    characters: [
      {
        id: "c-isel",
        name: "伊瑟·洛温（Isel Rowan）",
        appearance: "二十七八岁，深色卷发，常穿旧旅行外套；右手食指有一道细小的灼痕，签约时留下。",
        identity: "灰港的抄写员，私下是与魔鬼立约的邪术师。",
        history: "三年前弟弟托文染上港口热病，神庙的治疗无效。伊瑟在一份来历不明的契约上签名，弟弟当夜退烧。",
        motivation: "保住弟弟的性命，同时不让任何人知道代价。",
        desire: "找到解除契约的办法。",
        secret: "契约规定她须在五年内为契约方取得另外三人的自愿签名，否则契约方可以索取她的灵魂。",
        abilities: "契约魔法；擅长辨认笔迹与伪造文书。",
        limits: "契约条款的解释权在契约方手中；她不能主动向他人说出契约内容（本项目原创设定）。",
        notes: "",
        entrySlugs: ["warlock", "pact", "devils"],
        image: "art/theme-pact.webp",
      },
      {
        id: "c-marco",
        name: "马尔科·韦斯（Marco Vess）",
        appearance: "五十岁上下，灰发短须，眼皮沉重，衣领上别着一枚小小的黑铁徽针。",
        identity: "港口情报掮客，原创组织“黑铁行会”在灰港的负责人。",
        history: "年轻时做过商队护卫，后来发现消息比刀剑值钱。",
        motivation: "扩大行会在港口的影响力。",
        desire: "拿到神庙账册中记录的走私名单。",
        secret: "他知道伊瑟的契约，因为三年前那份契约正是经他的手转交的。",
        abilities: "庞大的线人网络；熟悉港口每一条暗巷。",
        limits: "行会只认结果；他若失手，会被其他野心家取代。",
        notes: "",
        entrySlugs: ["zhentarim", "rogue"],
        image: "art/project-broker.webp",
      },
      {
        id: "c-sera",
        name: "塞拉修女（Sister Sera）",
        appearance: "灰色法衣，胸前挂着潮汐女神的贝壳圣徽，双手常因熬药而泛黄。",
        identity: "潮汐女神礼拜堂的牧师，主持港口的临时病房。",
        history: "与伊瑟一起长大。三年前曾亲手照顾托文，至今不明白他为何痊愈。",
        motivation: "照顾病人，维护礼拜堂。",
        desire: "知道真相，同时不必在信仰与友情之间选择。",
        secret: "她已经怀疑伊瑟与邪魔有关，但没有上报教会。",
        abilities: "治疗与神术；在港口居民中享有信任。",
        limits: "教规要求她上报与邪魔立约的人（本项目原创设定）。",
        notes: "",
        entrySlugs: ["cleric", "acolyte"],
        image: "art/theme-faith.webp",
      },
      {
        id: "c-ezrath",
        name: "书记官艾兹拉斯（Ezrath）",
        appearance: "以高瘦文员的形象出现，长角收在礼帽下，手指过长。",
        identity: "下层位面的契约书记官，伊瑟的契约方（原创角色）。",
        history: "",
        motivation: "收集签名，提升自己在上级眼中的地位。",
        desire: "",
        secret: "",
        abilities: "",
        limits: "必须遵守契约的字面条款（本项目原创设定）。",
        notes: "原创角色，借用了 SRD 中魔鬼“守序邪恶”的阵营；“书记官”这一身份不是官方设定。",
        entrySlugs: ["devils", "nine-hells"],
        image: "art/entry-devil.webp",
      },
      {
        id: "c-torvin",
        name: "托文·洛温（Torvin Rowan）",
        appearance: "十九岁，瘦高，码头搬运工。",
        identity: "伊瑟的弟弟。",
        history: "三年前热病痊愈，不知道原因。",
        motivation: "想出海当水手。",
        desire: "",
        secret: "",
        abilities: "",
        limits: "",
        notes: "",
        entrySlugs: [],
      },
    ],
    relationships: [
      { id: "r1", from: "c-marco", to: "c-isel", type: "掌握秘密", description: "马尔科知道伊瑟与魔鬼立约，并以此要求她潜入礼拜堂偷取账册。" },
      { id: "r2", from: "c-isel", to: "c-torvin", type: "保护", description: "伊瑟为救托文签下契约，至今对他隐瞒一切。" },
      { id: "r3", from: "c-isel", to: "c-ezrath", type: "亏欠", description: "伊瑟欠艾兹拉斯三个签名，期限还剩两年。" },
      { id: "r4", from: "c-sera", to: "c-isel", type: "隐瞒", description: "塞拉怀疑伊瑟与邪魔有关，却没有按教规上报。" },
      { id: "r5", from: "c-marco", to: "c-sera", type: "亏欠", description: "塞拉曾在病房救过马尔科的命，他一直没有还这份人情。" },
    ],
    plots: [
      {
        id: "p1",
        title: "第三个签名",
        cause: "艾兹拉斯提醒伊瑟期限过半；同一周，马尔科以契约的秘密要挟她偷取礼拜堂的账册。",
        conflict: "账册由塞拉保管。伊瑟若照做，将背叛唯一可能帮助她的朋友；若拒绝，马尔科可能把契约告诉教会。",
        consequence: "未定。可能的走向：伊瑟向塞拉坦白；马尔科在人情与利益间改变立场；艾兹拉斯提出用马尔科的签名抵债。",
        characterIds: ["c-isel", "c-marco", "c-sera", "c-ezrath"],
        locationIds: ["l-chapel", "l-warehouse"],
        entrySlugs: ["pact", "warlock", "zhentarim", "cleric"],
      },
    ],
    locations: [
      { id: "l-harbor", name: "灰港", description: "终年多雾的港口小城，有一座石砌灯塔。", entrySlugs: [] },
      { id: "l-warehouse", name: "灯塔下的仓库", description: "黑铁行会在灰港的据点，马尔科在此办事。", entrySlugs: ["zhentarim"] },
      { id: "l-chapel", name: "潮汐女神礼拜堂", description: "兼作临时病房，地窖里保存着教区账册。", entrySlugs: ["cleric", "acolyte"] },
    ],
    adaptations: [
      {
        slug: "warlock",
        adopted: "采用邪魔恩主的设定：恩主来自下层位面，其目的是邪恶的。",
        changed: "恩主不是大魔鬼，而是一名低阶契约书记官；“取得三个签名”的条款为本项目原创。",
        addedAt: t,
      },
      {
        slug: "devils",
        adopted: "采用魔鬼守序邪恶的阵营。",
        changed: "“魔鬼必须遵守契约字面条款”在本项目中作为确定规则使用；官方资料中的相关形象尚待核实。",
        addedAt: t,
      },
      {
        slug: "zhentarim",
        adopted: "采用“以财富为权力、提供佣兵、奖励个人野心”的组织特征。",
        changed: "不使用被遗忘的国度；改名为原创组织“黑铁行会”，规模限于一座港口城市。",
        addedAt: t,
      },
      {
        slug: "true-name",
        adopted: "不采用真名作为规则。",
        changed: "契约上的签名必须是本人真实姓名，借鉴了 SRD 异界之门“化名无效”的思路；签名带来的约束为原创。",
        addedAt: t,
      },
    ],
  };
}

export const freshState = (): WbState => ({ version: 1, projects: [exampleProject()], favorites: [] });

/** Accepts the current shape plus older/partial shapes (missing arrays, missing favorites). */
export function migrate(raw: unknown): WbState {
  if (!raw || typeof raw !== "object") throw new Error("存档不是对象");
  const r = raw as Record<string, unknown>;
  const candidate = { version: 1, projects: Array.isArray(r.projects) ? r.projects : [], favorites: Array.isArray(r.favorites) ? r.favorites : [] };
  if (r.version !== undefined && r.version !== 1) throw new Error(`不支持的存档版本：${String(r.version)}`);
  return wbStateSchema.parse(candidate);
}

export function loadWb(storage: Storage = localStorage): { state: WbState; warning: string; blocked: boolean } {
  const raw = storage.getItem(WB_KEY);
  if (!raw) return { state: freshState(), warning: "", blocked: false };
  try {
    return { state: migrate(JSON.parse(raw)), warning: "", blocked: false };
  } catch (e) {
    return {
      state: freshState(),
      warning: `本地项目存档无法读取（${(e as Error).message}）。原始数据未被覆盖，自动保存已暂停。`,
      blocked: true,
    };
  }
}

export function saveWb(state: WbState, storage: Storage = localStorage) {
  storage.setItem(WB_KEY, JSON.stringify(state));
}

export const touch = (p: Project): Project => ({ ...p, updatedAt: now() });

export function addAdaptation(p: Project, slug: string): Project {
  if (p.adaptations.some((a) => a.slug === slug)) return p;
  return touch({ ...p, adaptations: [...p.adaptations, { slug, adopted: "", changed: "", addedAt: now() }] });
}

// ---------- Export ----------
export const PROJECT_FORMAT = "dnd-workbench-project";

export function projectJson(p: Project) {
  return JSON.stringify({ format: PROJECT_FORMAT, version: 1, exportedAt: now(), project: p }, null, 2);
}

const line = (label: string, v?: string) => (v && v.trim() ? `- **${label}**：${v.trim()}\n` : "");

export function projectMarkdown(p: Project) {
  const name = (cid: string) => p.characters.find((c) => c.id === cid)?.name ?? cid;
  const loc = (lid: string) => p.locations.find((l) => l.id === lid)?.name ?? lid;
  const ent = (s: string) => {
    const e = getEntry(s);
    return e ? `${e.zh}（${e.en}）` : s;
  };
  let md = `# ${p.name}\n\n`;
  if (p.example) md += `> 原创示例：本项目的人物、关系与情节均为原创，不是官方设定。\n\n`;
  md += `${p.summary}\n\n`;
  md += `内容类型说明：“设定摘要”来自所列来源；“编辑解读”为本站整理；“本项目采用/改动”与人物、关系、情节为用户原创或改编。\n\n`;
  md += `## 角色\n\n`;
  for (const c of p.characters) {
    md += `### ${c.name}\n\n`;
    md += line("外貌", c.appearance) + line("身份", c.identity) + line("经历", c.history) + line("动机", c.motivation);
    md += line("欲望", c.desire) + line("秘密", c.secret) + line("能力", c.abilities) + line("限制", c.limits) + line("备注", c.notes);
    if (c.entrySlugs.length) md += `- **相关设定**：${c.entrySlugs.map(ent).join("、")}\n`;
    md += `\n`;
  }
  md += `## 关系\n\n`;
  for (const r of p.relationships) md += `- ${name(r.from)} → ${name(r.to)}｜${r.type}：${r.description}\n`;
  md += `\n## 情节\n\n`;
  for (const pl of p.plots) {
    md += `### ${pl.title}\n\n` + line("起因", pl.cause) + line("冲突", pl.conflict) + line("后果", pl.consequence);
    if (pl.characterIds.length) md += `- **人物**：${pl.characterIds.map(name).join("、")}\n`;
    if (pl.locationIds.length) md += `- **地点**：${pl.locationIds.map(loc).join("、")}\n`;
    if (pl.entrySlugs.length) md += `- **相关设定**：${pl.entrySlugs.map(ent).join("、")}\n`;
    md += `\n`;
  }
  md += `## 地点\n\n`;
  for (const l of p.locations) md += `- **${l.name}**：${l.description}\n`;
  md += `\n## 设定与改编\n\n`;
  for (const a of p.adaptations) {
    const e = getEntry(a.slug);
    md += `### ${ent(a.slug)}\n\n`;
    if (e) {
      md += `**设定摘要（来源内容）**：${e.summary}\n\n`;
      md += `- 版本：${e.edition}；世界观：${e.setting}\n`;
      md += `- 来源：${e.sources
        .map(([sid, loc]) => {
          const s = sources[sid];
          return s ? `${s.title}${loc ? `，${loc}` : ""}${s.url ? ` <${s.url}>` : ""}` : sid;
        })
        .join("；")}\n\n`;
    }
    md += `**本项目采用**：${a.adopted || "（未填写）"}\n\n**本项目改动**：${a.changed || "（未填写）"}\n\n`;
  }
  md += `---\n导出自 D&D 设定资料库（grot666.github.io/dnd-companion），${now().slice(0, 10)}。SRD 内容依据 CC-BY-4.0，见站点署名页。\n`;
  return md;
}

// ---------- Import ----------
export type ImportPreview = { projects: Project[]; favorites: string[]; kind: "project" | "state" };

export function parseImport(textValue: string): ImportPreview {
  let raw: unknown;
  try {
    raw = JSON.parse(textValue);
  } catch {
    throw new Error("文件不是有效的 JSON");
  }
  const r = raw as Record<string, unknown>;
  if (r && r.format === PROJECT_FORMAT) {
    if (r.version !== 1) throw new Error(`不支持的项目文件版本：${String(r.version)}`);
    const parsed = projectSchema.safeParse(r.project);
    if (!parsed.success) throw new Error("项目内容校验失败：" + parsed.error.issues[0]?.message);
    return { projects: [parsed.data], favorites: [], kind: "project" };
  }
  if (r && Array.isArray(r.projects)) {
    const st = migrate(r);
    return { projects: st.projects, favorites: st.favorites, kind: "state" };
  }
  if (r && Array.isArray(r.characters) && "activeId" in r) throw new Error("这是跑团工具的角色备份，请在“跑团工具”中导入");
  throw new Error("无法识别的文件格式");
}

/** Merge imported projects; colliding ids get new ids so nothing is overwritten. */
export function applyImport(state: WbState, preview: ImportPreview): WbState {
  const ids = new Set(state.projects.map((p) => p.id));
  const incoming = preview.projects.map((p) => (ids.has(p.id) ? { ...p, id: uid("proj"), name: `${p.name}（导入）` } : p));
  return {
    ...state,
    projects: [...state.projects, ...incoming],
    favorites: Array.from(new Set([...state.favorites, ...preview.favorites])),
  };
}
