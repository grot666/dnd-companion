import { z } from "zod";
import raceData from "./data/Races.json";
import classData from "./data/Classes.json";
import levelData from "./data/Levels.json";
import skillData from "./data/Skills.json";
import spellData from "./data/Spells.json";
import gearData from "./data/Equipment.json";
import magicData from "./data/Magic-Items.json";
export const abilities = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type Ability = (typeof abilities)[number];
export const abilityNames: Record<Ability, string> = {
  str: "力量",
  dex: "敏捷",
  con: "体质",
  int: "智力",
  wis: "感知",
  cha: "魅力",
};
export const classNames: Record<string, string> = {
  barbarian: "野蛮人",
  bard: "吟游诗人",
  cleric: "牧师",
  druid: "德鲁伊",
  fighter: "战士",
  monk: "武僧",
  paladin: "圣武士",
  ranger: "游侠",
  rogue: "游荡者",
  sorcerer: "术士",
  warlock: "邪术师",
  wizard: "法师",
};
export const raceNames: Record<string, string> = {
  dwarf: "矮人",
  elf: "精灵",
  halfling: "半身人",
  human: "人类",
  dragonborn: "龙裔",
  gnome: "侏儒",
  "half-elf": "半精灵",
  "half-orc": "半兽人",
  tiefling: "提夫林",
};
export const skillNames: Record<string, string> = {
  acrobatics: "体操",
  "animal-handling": "驯兽",
  arcana: "奥秘",
  athletics: "运动",
  deception: "欺瞒",
  history: "历史",
  insight: "洞悉",
  intimidation: "威吓",
  investigation: "调查",
  medicine: "医药",
  nature: "自然",
  perception: "察觉",
  performance: "表演",
  persuasion: "游说",
  religion: "宗教",
  "sleight-of-hand": "巧手",
  stealth: "隐匿",
  survival: "求生",
};
export const races = raceData;
export const classes = classData;
export const skills = skillData;
export type Entry = {
  index: string;
  name: string;
  zh?: string;
  kind: "spell" | "gear" | "magic" | "custom";
  desc?: string[];
  level?: number;
  school?: { name: string; index: string };
  classes?: { index: string; name: string }[];
  range?: string;
  duration?: string;
  casting_time?: string;
  components?: string[];
  material?: string;
  concentration?: boolean;
  ritual?: boolean;
  higher_level?: string[];
  cost?: { quantity: number; unit: string };
  weight?: number;
  equipment_category?: { name: string; index: string };
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number };
  armor_category?: string;
  damage?: { damage_dice: string; damage_type: { name: string } };
  rarity?: { name: string };
  properties?: { name: string }[];
  contents?: { item: { name: string }; quantity: number }[];
  str_minimum?: number;
  stealth_disadvantage?: boolean;
};
const translations: Record<string, string> = {
  "magic-missile": "魔法飞弹",
  fireball: "火球术",
  "cure-wounds": "疗伤术",
  "healing-word": "治愈真言",
  shield: "护盾术",
  "mage-armor": "法师护甲",
  "detect-magic": "侦测魔法",
  light: "光亮术",
  "fire-bolt": "火焰箭",
  "eldritch-blast": "魔能爆",
  guidance: "神导术",
  "sacred-flame": "圣火术",
  sleep: "睡眠术",
  bless: "祝福术",
  "burning-hands": "燃烧之手",
  "acid-splash": "酸液飞溅",
  prestidigitation: "魔法伎俩",
  longsword: "长剑",
  shortsword: "短剑",
  dagger: "匕首",
  shortbow: "短弓",
  longbow: "长弓",
  "leather-armor": "皮甲",
  "chain-mail": "链甲",
  plate: "板甲",
  "shield-armor": "盾牌",
  backpack: "背包",
  "rope-hempen-50-feet": "麻绳（50 尺）",
  "potion-of-healing": "治疗药水",
  torch: "火把",
  "rations-1-day": "口粮（1日）",
  spellbook: "法术书",
  waterskin: "水袋",
};
export const spells: Entry[] = spellData.map(
  (x) => ({ ...x, kind: "spell", zh: translations[x.index] }) as Entry,
);
export const items: Entry[] = [
  ...gearData.map(
    (x) =>
      ({
        ...x,
        kind: "gear",
        zh: x.index === "shield" ? "盾牌" : translations[x.index],
      }) as Entry,
  ),
  ...magicData.map(
    (x) =>
      ({
        ...x,
        index: "magic:" + x.index,
        kind: "magic",
        zh: translations[x.index],
      }) as Entry,
  ),
];
export const allEntries = [...spells, ...items];
const integer = (min: number, max: number) =>
  z.number().int().min(min).max(max);
const scores = z.object({
  str: integer(1, 30),
  dex: integer(1, 30),
  con: integer(1, 30),
  int: integer(1, 30),
  wis: integer(1, 30),
  cha: integer(1, 30),
});
const bagSchema = z.object({
  id: z.string().max(200),
  qty: integer(1, 9999),
  equipped: z.boolean(),
  name: z.string().max(120).optional(),
  note: z.string().max(10000).optional(),
  weight: z.number().min(0).max(100000).optional(),
});
const customSchema = z.object({
  index: z.string().max(200),
  name: z.string().min(1).max(120),
  kind: z.literal("custom"),
  level: integer(0, 9).optional(),
  desc: z.array(z.string().max(10000)).max(20),
  weight: z.number().min(0).max(100000).optional(),
});
export const characterSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(80),
  race: z
    .string()
    .max(80)
    .refine((id) => races.some((r) => r.index === id), "不支持的种族"),
  classId: z
    .string()
    .max(80)
    .refine((id) => classes.some((c) => c.index === id), "不支持的职业"),
  background: z.string().max(120),
  level: integer(1, 20),
  scores,
  skillProfs: z.array(z.string().max(80)).max(18),
  expertise: z.array(z.string().max(80)).max(18),
  saveProfs: z.array(z.enum(abilities)).max(6),
  hp: integer(0, 9999),
  tempHp: integer(0, 9999),
  hpOverride: integer(1, 9999).nullable(),
  acOverride: integer(0, 99).nullable(),
  initiativeOverride: integer(-30, 99).nullable(),
  hitDice: integer(0, 20),
  deathSuccess: integer(0, 3),
  deathFailure: integer(0, 3),
  conditions: z.array(z.string().max(100)).max(30),
  notes: z.string().max(50000),
  inventory: z.array(bagSchema).max(1000),
  coins: z.object({
    cp: integer(0, 999999),
    sp: integer(0, 999999),
    ep: integer(0, 999999),
    gp: integer(0, 999999),
    pp: integer(0, 999999),
  }),
  spellIds: z.array(z.string().max(200)).max(1000),
  prepared: z.array(z.string().max(200)).max(1000),
  slotsUsed: z.record(z.string(), integer(0, 99)),
  slotOverrides: z.record(z.string(), integer(0, 99)),
  custom: z.array(customSchema).max(500),
});
export type Character = z.infer<typeof characterSchema>;
export const stateSchema = z
  .object({
    version: z.literal(1),
    characters: z.array(characterSchema).max(100),
    activeId: z.string().nullable(),
  })
  .superRefine((s, ctx) => {
    if (new Set(s.characters.map((c) => c.id)).size !== s.characters.length)
      ctx.addIssue({ code: "custom", message: "角色 ID 重复" });
    if (s.activeId !== null && !s.characters.some((c) => c.id === s.activeId))
      ctx.addIssue({ code: "custom", message: "当前角色不存在" });
  });
export type State = z.infer<typeof stateSchema>;
export const emptyState: State = { version: 1, characters: [], activeId: null };
export const STORAGE_KEY = "wayfarer-5e-v1";
export const mod = (score: number) => Math.floor((score - 10) / 2);
export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
export const proficiency = (level: number) => 2 + Math.floor((level - 1) / 4);
export const pointCost = (n: number) =>
  ({ 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 })[n] ?? Infinity;
export const pointTotal = (values: number[]) =>
  values.reduce((s, n) => s + pointCost(n), 0);
export function validateAbilities(values: number[], mode: "array" | "point") {
  return (
    values.length === 6 &&
    (mode === "array"
      ? [...values].sort((a, b) => a - b).join(",") === "8,10,12,13,14,15"
      : values.every((v) => Number.isInteger(v) && v >= 8 && v <= 15) &&
        pointTotal(values) <= 27)
  );
}
export function createCharacter(
  name: string,
  race: string,
  classId: string,
  base: Record<Ability, number>,
  skillProfs: string[] = [],
): Character {
  const raceObj = races.find((r) => r.index === race),
    cls = classes.find((c) => c.index === classId) ?? classes[4];
  const scores = { ...base };
  for (const b of raceObj?.ability_bonuses ?? [])
    scores[b.ability_score.index as Ability] += b.bonus;
  const c: Character = {
    id: crypto.randomUUID(),
    name: name.trim() || "无名旅人",
    race,
    classId,
    background: "侍僧 Acolyte",
    level: 1,
    scores,
    skillProfs: [...new Set(["insight", "religion", ...skillProfs])],
    expertise: [],
    saveProfs: cls.saving_throws.map((x) => x.index as Ability),
    hp: 1,
    tempHp: 0,
    hpOverride: null,
    acOverride: null,
    initiativeOverride: null,
    hitDice: 1,
    deathSuccess: 0,
    deathFailure: 0,
    conditions: [],
    notes: "",
    inventory: [],
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    spellIds: [],
    prepared: [],
    slotsUsed: {},
    slotOverrides: {},
    custom: [],
  };
  c.hp = maxHP(c);
  return c;
}
export const classOf = (c: Character) =>
  classes.find((x) => x.index === c.classId) ?? classes[4];
export function maxHP(c: Character) {
  return (
    c.hpOverride ??
    Math.max(1, classOf(c).hit_die + mod(c.scores.con)) +
      (c.level - 1) *
        Math.max(1, Math.floor(classOf(c).hit_die / 2) + 1 + mod(c.scores.con))
  );
}
export function armorClass(c: Character) {
  if (c.acOverride !== null) return c.acOverride;
  const dex = mod(c.scores.dex);
  let ac = 10 + dex;
  let shield = false;
  const armors: number[] = [];
  for (const bag of c.inventory.filter((i) => i.equipped)) {
    const item = items.find((i) => i.index === bag.id);
    if (!item?.armor_class) continue;
    if (item.armor_category === "Shield") {
      shield = true;
      continue;
    }
    armors.push(
      item.armor_class.base +
        (item.armor_class.dex_bonus
          ? Math.min(dex, item.armor_class.max_bonus ?? 99)
          : 0),
    );
  }
  if (armors.length) ac = Math.max(...armors);
  else if (c.classId === "barbarian") ac += mod(c.scores.con);
  else if (c.classId === "monk" && !shield) ac += mod(c.scores.wis);
  return ac + (shield ? 2 : 0);
}
export function skillBonus(c: Character, id: string) {
  const skill = skills.find((s) => s.index === id);
  return (
    mod(c.scores[(skill?.ability_score.index ?? "wis") as Ability]) +
    proficiency(c.level) *
      (c.skillProfs.includes(id) ? (c.expertise.includes(id) ? 2 : 1) : 0)
  );
}
export function slots(c: Character): Record<string, number> {
  const row = levelData.find((x) => x.index === `${c.classId}-${c.level}`);
  const result: Record<string, number> = {};
  const casting = row?.spellcasting as Record<string, number> | undefined;
  for (let i = 1; i <= 9; i++) {
    const n = casting?.[`spell_slots_level_${i}`] ?? 0;
    if (n) result[String(i)] = n;
  }
  return { ...result, ...c.slotOverrides };
}
export const castingAbility = (c: Character): Ability =>
  (
    ({
      wizard: "int",
      cleric: "wis",
      druid: "wis",
      ranger: "wis",
      bard: "cha",
      paladin: "cha",
      sorcerer: "cha",
      warlock: "cha",
    }) as Record<string, Ability>
  )[c.classId] ?? "int";
export function damage(c: Character, amount: number): Character {
  const n = Math.max(0, Math.floor(amount));
  return {
    ...c,
    tempHp: Math.max(0, c.tempHp - n),
    hp: Math.max(0, c.hp - Math.max(0, n - c.tempHp)),
  };
}
export function heal(c: Character, amount: number): Character {
  return {
    ...c,
    hp: Math.min(maxHP(c), c.hp + Math.max(0, Math.floor(amount))),
    ...(c.hp === 0 && amount > 0 ? { deathSuccess: 0, deathFailure: 0 } : {}),
  };
}
export function shortRest(
  c: Character,
  dice: number,
  rolledTotal: number,
): Character {
  const spend = Math.max(0, Math.min(c.hitDice, Math.floor(dice)));
  return {
    ...heal(c, spend > 0 ? Math.max(0, Math.floor(rolledTotal)) : 0),
    hitDice: c.hitDice - spend,
    slotsUsed: c.classId === "warlock" ? {} : c.slotsUsed,
  };
}
export function longRest(c: Character): Character {
  return {
    ...c,
    hp: maxHP(c),
    tempHp: 0,
    hitDice: Math.min(
      c.level,
      c.hitDice + Math.max(1, Math.floor(c.level / 2)),
    ),
    slotsUsed: {},
    deathSuccess: 0,
    deathFailure: 0,
  };
}
export function parseBackup(text: string): State {
  if (text.length > 5_000_000) throw Error("文件超过 5 MB");
  const raw = JSON.parse(text);
  if (raw.version !== 1) throw Error("不支持的备份版本（仅支持 v1）");
  return stateSchema.parse(raw);
}
export function loadState(): { state: State; warning: string } {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return { state: text ? parseBackup(text) : { ...emptyState }, warning: "" };
  } catch {
    return {
      state: { ...emptyState },
      warning:
        "本地存档无法读取。为保护原始数据，已暂停自动保存。请先下载损坏存档，再导入有效备份或明确重置。",
    };
  }
}
export function persist(state: State) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateSchema.parse(state)));
}
