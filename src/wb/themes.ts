import type { Theme } from "./types";

const art = (name: string, focus: string, alt: string) => ({ src: `art/${name}.webp`, focus, alt });

// Editorial theme index. Intros, conditions and scenario notes are editorial interpretation;
// every factual claim lives in the linked entries with its own source.
export const themes: Theme[] = [
  {
    slug: "power",
    zh: "权力与依附",
    en: "Power & Dependence",
    image: art("theme-power", "60% 40%", "昏暗议事厅中，银须贵族坐在高背椅上递出蜡封信件，年轻信使跪在地上"),
    intro:
      "一方掌握另一方需要的东西——力量、庇护、金钱、赦免或沉默——便形成依附。D&D 资料中，依附既可以是邪术师与恩主之间的超自然关系，也可以是佣兵组织、骑士团或神庙中的世俗关系。",
    conditions: [
      "被依附的一方掌握无法轻易替代的资源：法术来源、赦免权、财富或情报。",
      "依附者离开的代价高于留下：失去力量、身份、庇护或安全。",
      "关系中有一方可以单方面解释规则或条款。",
    ],
    scenarios: [
      {
        title: "掌握他人的秘密而获得影响力",
        tags: ["秘密", "要挟", "情报", "影响力"],
        entries: ["true-name", "zhentarim", "harpers", "pact", "warlock", "rogue"],
        note: "资料中可参照的结构：散塔林会以利益交换维系影响；竖琴手以情报网络影响统治者；邪术师的契约本身也可能成为被他人掌握的秘密；异界之门只认真实的名字，名字因此可能值得隐藏。",
      },
      {
        title: "力量有给予者，也就能被收回或被要挟",
        tags: ["恩主", "交易", "代价"],
        entries: ["warlock", "pact", "devils"],
        note: "邪术师的力量来自恩主；SRD 没有统一的“收回”规则，具体条款属于设定或原创。",
      },
      {
        title: "组织以金钱与机会换取忠诚",
        tags: ["佣兵", "野心", "债务"],
        entries: ["zhentarim", "forgotten-realms"],
        note: "散塔林会提供护卫与佣兵，奖励个人野心——依附建立在利益之上。",
      },
    ],
    entries: [
      { slug: "warlock", why: "力量来自恩主，关系不对等。" },
      { slug: "zhentarim", why: "以财富和雇佣维系成员与客户。" },
      { slug: "harpers", why: "以情报在幕后影响统治者。" },
      { slug: "true-name", why: "“知道名字即获得控制”的出处与适用范围。" },
      { slug: "devils", why: "下层位面的等级与统领关系。" },
      { slug: "paladin", why: "赦免依赖骑士团与同信仰的神职人员。" },
    ],
    adjacent: ["pact", "secrets"],
  },
  {
    slug: "pact",
    zh: "契约与束缚",
    en: "Pacts & Bindings",
    image: art("theme-pact", "45% 50%", "烛光下签署契约的年轻女子与桌对面长角的身影"),
    intro:
      "契约是双方的交易，束缚是单方面的强制。规则文本中两者都存在：邪术师与恩主订立交易，约束术与异界束缚则以魔法强迫服从。誓言约束立誓者本人，是第三种形式。",
    conditions: [
      "有明确的双方，或一方对另一方施加的强制。",
      "交换内容可以被说清：服务、物品、力量、时间或灵魂。",
      "违背时有后果：伤害、失去力量、身份危机，或由他方裁定。",
    ],
    scenarios: [
      {
        title: "为救一个人而订立代价未明的交易",
        tags: ["交易", "代价", "恩主"],
        entries: ["warlock", "pact", "devils", "soul-death"],
        note: "SRD 写明了邪魔恩主的目的是邪恶的；条款与代价需由设定或原创补足。",
      },
      {
        title: "被魔法命令约束的人",
        tags: ["约束术", "强制", "服从"],
        entries: ["pact"],
        note: "约束术在每次直接违背命令时造成伤害，是规则化的束缚。",
      },
      {
        title: "誓言与契约冲突",
        tags: ["誓言", "违誓", "交易"],
        entries: ["oath", "paladin", "warlock"],
        note: "圣武士的违誓有明确的赦免途径与后果；与邪魔的交易则没有统一规则。",
      },
    ],
    entries: [
      { slug: "pact", why: "规则文本中契约与束缚的汇总。" },
      { slug: "warlock", why: "以交易获得力量的职业。" },
      { slug: "oath", why: "约束自身的承诺。" },
      { slug: "devils", why: "守序邪恶的邪魔，与九层地狱紧密绑定。" },
      { slug: "nine-hells", why: "魔鬼所在的下层位面。" },
      { slug: "true-name", why: "召唤与控制中名字的作用。" },
    ],
    adjacent: ["power", "death"],
  },
  {
    slug: "secrets",
    zh: "身份与秘密",
    en: "Identity & Secrets",
    image: art("theme-secrets", "50% 60%", "雨夜小巷里戴面罩的兜帽人把折好的纸条递给紧张的市民，阳台上有人在看"),
    intro:
      "身份可以被隐藏、伪造或暴露；秘密一旦被他人掌握，就可能转化为影响力。资料中与之相关的有：竖琴手的伪装与线人、游荡者的黑话、巫妖的命匣所在地，以及关于真名的有限出处。",
    conditions: [
      "有一件被刻意隐藏的事：契约、出身、命匣、真实名字或所属组织。",
      "至少有一方知道而另一方不知道。",
      "秘密暴露会改变关系：失去信任、身份、庇护或安全。",
    ],
    scenarios: [
      {
        title: "掌握他人的秘密而获得影响力",
        tags: ["秘密", "要挟", "情报", "影响力"],
        entries: ["true-name", "zhentarim", "harpers", "pact", "warlock", "rogue"],
        note: "与“权力与依附”共享这一索引：秘密是影响力的来源之一。",
      },
      {
        title: "用暗语在众人面前传递消息",
        tags: ["黑话", "暗号"],
        entries: ["rogue", "harpers"],
        note: "盗贼黑话可把消息藏在普通对话中，所需时间是直说的四倍。",
      },
      {
        title: "隐藏的弱点",
        tags: ["命匣", "弱点"],
        entries: ["lich", "soul-death"],
        note: "巫妖的命匣使其可以复生；命匣所在地本身就是秘密。",
      },
    ],
    entries: [
      { slug: "true-name", why: "异界之门只认真实的名字，化名与头衔无效。" },
      { slug: "harpers", why: "伪装、身份与情报网络。" },
      { slug: "rogue", why: "盗贼黑话与情报。" },
      { slug: "lich", why: "命匣所在地即是秘密。" },
      { slug: "warlock", why: "契约本身可能需要隐瞒。" },
      { slug: "celestials", why: "偏离善良的天界生物是骇人的罕事。" },
    ],
    adjacent: ["power", "faith"],
  },
  {
    slug: "faith",
    zh: "信仰与义务",
    en: "Faith & Duty",
    image: art("theme-faith", "45% 55%", "黎明的山间神龛前，灰袍牧师跪着为疲惫的旅人包扎手臂"),
    intro:
      "SRD 区分了信仰的几个层次：侍奉神庙的侍僧、由神祇授予神力的牧师、以誓言定义自身的圣武士。神力与身份都伴随着义务，而义务的解释权常在组织手中。",
    conditions: [
      "角色的力量或身份与某位神祇、教团或誓言相连。",
      "组织或信条对行为提出要求。",
      "个人判断与义务可能冲突，并有可见的后果。",
    ],
    scenarios: [
      {
        title: "违背誓言之后",
        tags: ["违誓", "忏悔", "赦免"],
        entries: ["paladin", "oath", "cleric"],
        note: "SRD 写明了寻求赦免的途径，以及不悔改时可能被迫放弃职业。",
      },
      {
        title: "主持仪式的人不一定拥有神力",
        tags: ["侍僧", "神职", "神力"],
        entries: ["acolyte", "cleric"],
        note: "侍僧背景明确区分了宗教职位与被授予的神力。",
      },
    ],
    entries: [
      { slug: "cleric", why: "神力来自神祇，并以领域体现。" },
      { slug: "paladin", why: "誓言、信条与违誓。" },
      { slug: "acolyte", why: "宗教职位与神力的区别。" },
      { slug: "celestials", why: "神祇的使者。" },
      { slug: "oath", why: "约束自身的承诺。" },
    ],
    adjacent: ["pact", "death"],
  },
  {
    slug: "death",
    zh: "死亡与灵魂",
    en: "Death & Souls",
    image: art("theme-death", "40% 50%", "雾中灰岸，提灯摆渡人与等待渡河的一列灵魂"),
    intro:
      "规则文本中，死亡并非绝对终结：复活取决于灵魂是否自由且愿意，巫妖以命匣复生，劣魔在九层地狱中复活。灵魂被囚禁、交易或不愿回来，都会改变一个故事的走向。",
    conditions: [
      "有人死去，或有人试图逃避死亡。",
      "灵魂的去向或状态成为问题：被束缚、被交易、不愿返回。",
      "有可以改变结果的力量：复活法术、命匣、契约或神祇。",
    ],
    scenarios: [
      {
        title: "复活失败的原因",
        tags: ["复活", "灵魂", "自由且愿意"],
        entries: ["soul-death", "cleric"],
        note: "复活类法术都以灵魂自由且愿意为条件。",
      },
      {
        title: "以代价逃避死亡",
        tags: ["不死", "命匣", "永生"],
        entries: ["lich", "soul-death", "pact"],
        note: "巫妖的命匣让其在被摧毁后复生。",
      },
    ],
    entries: [
      { slug: "soul-death", why: "规则文本中的灵魂汇总。" },
      { slug: "lich", why: "以命匣维系存在。" },
      { slug: "shadowfell", why: "与不死生物相关的位面。" },
      { slug: "outer-planes", why: "灵魂经由星界前往的诸位面。" },
      { slug: "cleric", why: "复活类法术的主要施法者。" },
    ],
    adjacent: ["pact", "faith"],
  },
];

export const themeMap = new Map(themes.map((t) => [t.slug, t]));

export function searchThemes(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const out: { theme: Theme; scenario: Theme["scenarios"][number] }[] = [];
  for (const theme of themes)
    for (const scenario of theme.scenarios) {
      const hay = [scenario.title, ...scenario.tags, theme.zh].join(" ").toLowerCase();
      if (term.split(/\s+/).every((t) => hay.includes(t))) out.push({ theme, scenario });
    }
  return out;
}
