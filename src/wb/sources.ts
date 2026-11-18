// Source registry. Every URL here was opened and checked on 2026-11-18 (Asia/Singapore).
// Books without an open URL are cited by title only and never quoted.
export type SourceKind = "open" | "official-free" | "book" | "secondary";
export type Source = {
  id: string;
  title: string;
  kind: SourceKind;
  edition: string;
  url?: string;
  note: string;
};

export const sources: Record<string, Source> = {
  srd51: {
    id: "srd51",
    title: "System Reference Document 5.1（SRD 5.1）",
    kind: "open",
    edition: "2014 版规则",
    url: "https://www.dndbeyond.com/attachments/39j2li89/SRD5.1-CCBY4.0_License_live%20links.pdf",
    note: "Wizards of the Coast 以 CC-BY-4.0 发布。本站标注的页码对应该 PDF。",
  },
  srd521: {
    id: "srd521",
    title: "System Reference Document v5.2.1（SRD 5.2.1）",
    kind: "open",
    edition: "2024 版规则",
    url: "https://www.dndbeyond.com/srd",
    note: "2024 版规则的开放文档。本站尚未逐条对照 5.2.1，引用处会单独说明。",
  },
  srdHub: {
    id: "srdHub",
    title: "Wizards of the Coast：Systems Reference Document 说明页",
    kind: "official-free",
    edition: "通用",
    url: "https://dnd.wizards.com/resources/systems-reference-document",
    note: "官方对 SRD 授权与版本的说明。",
  },
  data5ebits: {
    id: "data5ebits",
    title: "5e-bits/5e-srd-api 中的 2014 英文 JSON（固定提交 3b6da29）",
    kind: "open",
    edition: "2014 版规则",
    url: "https://github.com/5e-bits/5e-srd-api/tree/3b6da29a45b3b328c2409cf97a14e2507e291bf8/packages/5e-database/src/2014/en",
    note: "法术、物品、职业与种族目录的数据来源；数据本身来自 SRD 5.1。",
  },
  basicFactions: {
    id: "basicFactions",
    title: "D&D Basic Rules（2014）附录 C：五大派系",
    kind: "official-free",
    edition: "2014 版 · 被遗忘的国度",
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-c-the-five-factions",
    note: "官方免费规则中的派系介绍，设定为被遗忘的国度（Forgotten Realms）。",
  },
  harpersPost: {
    id: "harpersPost",
    title: "D&D Beyond：Getting the Most From the Harpers in Your Forgotten Realms Campaign",
    kind: "official-free",
    edition: "被遗忘的国度",
    url: "https://www.dndbeyond.com/posts/1486-getting-the-most-from-the-harpers-in-your",
    note: "官方站点文章，介绍竖琴手的历史定位与常见对手。",
  },
  realmsResource: {
    id: "realmsResource",
    title: "D&D Beyond：The Forgotten Realms",
    kind: "official-free",
    edition: "被遗忘的国度",
    url: "https://www.dndbeyond.com/resources/2037-the-forgotten-realms",
    note: "官方站点的被遗忘的国度设定概览。",
  },
  scagPreface: {
    id: "scagPreface",
    title: "Sword Coast Adventurer's Guide 序言（官方免费 PDF）",
    kind: "official-free",
    edition: "2014 版 · 被遗忘的国度",
    url: "https://media.wizards.com/2015/downloads/dnd/SCAG_Preface_3ms9.pdf",
    note: "剑湾设定书的官方免费序言。",
  },
  mm2014: {
    id: "mm2014",
    title: "Monster Manual（2014）",
    kind: "book",
    edition: "2014 版",
    note: "非开放内容，只列书名与位置，不转载原文。",
  },
  dmg2014: {
    id: "dmg2014",
    title: "Dungeon Master's Guide（2014）",
    kind: "book",
    edition: "2014 版",
    note: "非开放内容，只列书名与位置，不转载原文。",
  },
  phb2014: {
    id: "phb2014",
    title: "Player's Handbook（2014）",
    kind: "book",
    edition: "2014 版",
    note: "非开放内容，只列书名与位置，不转载原文。",
  },
  xgte: {
    id: "xgte",
    title: "Xanathar's Guide to Everything（2017）",
    kind: "book",
    edition: "2014 版规则扩展",
    note: "非开放内容，只列书名与位置，不转载原文。",
  },
  seTrueName: {
    id: "seTrueName",
    title: "RPG Stack Exchange：I have a demon's true name. Now what?",
    kind: "secondary",
    edition: "二手资料",
    url: "https://rpg.stackexchange.com/questions/137721/i-have-a-demons-true-name-now-what",
    note: "社区问答，引用了 Monster Manual 的相关段落。只用于定位原书位置，不作为最终依据。",
  },
};

export const kindLabel: Record<SourceKind, string> = {
  open: "开放文档",
  "official-free": "官方免费资料",
  book: "书目（未转载）",
  secondary: "二手资料",
};
