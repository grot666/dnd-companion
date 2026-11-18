import type { Block, Category, Entry } from "./types";
import classes from "../data/Classes.json";
import races from "../data/Races.json";
import { classNames, raceNames } from "../names";

const S = (text: string, ...cite: [string, string][]): Block => ({ p: "source", text, cite });
const E = (text: string): Block => ({ p: "editorial", text });
const U = (text: string, ...cite: [string, string][]): Block => ({ p: "unverified", text, cite });
const art = (name: string, focus: string, alt: string) => ({ src: `art/${name}.webp`, focus, alt });

export const categoryNames: Record<Category, string> = {
  class: "职业",
  race: "种族",
  background: "背景",
  concept: "概念",
  creature: "生物",
  plane: "位面",
  faction: "势力",
  setting: "设定",
};
export const categoryOrder: Category[] = [
  "class",
  "concept",
  "creature",
  "plane",
  "faction",
  "setting",
  "race",
  "background",
];

const SRD14 = "2014 · SRD 5.1";
const GENERIC = "通用（不限定世界观）";
const FR = "被遗忘的国度（Forgotten Realms）";

const deep: Entry[] = [
  {
    slug: "warlock",
    zh: "邪术师",
    en: "Warlock",
    category: "class",
    depth: "deep",
    summary: "通过与异界存在订立交易而获得法术的施法者。力量有明确的给予者，这段关系本身就是角色身份的一部分。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-warlock", "45% 22%", "废弃礼拜堂中举手燃起紫色火焰的邪术师，身后破窗外有一只巨大的眼睛"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S(
            "邪术师在 1 级时与一位自选的异界存在订立交易。SRD 5.1 列出三类恩主：大妖精（Archfey）、邪魔（Fiend）与旧日支配者（Great Old One），恩主在 1、6、10、14 级各提供一项特性。",
            ["srd51", "第 46 页"],
          ),
          E("与靠学习积累的法师、靠信仰获得神力的牧师不同，邪术师的力量来自一段持续存在的关系：有给予者，也就有追问、索取或背弃的可能。"),
        ],
      },
      {
        title: "力量来源",
        blocks: [
          S("这一职业的施法特性称为“契约魔法”（Pact Magic），文本将其归因于奥术研究与恩主赐予的魔力两者。", ["srd51", "第 46 页"]),
          S("3 级时恩主赐予“契约恩赐”（Pact Boon），形式为锁链（使魔）、刃（契约武器）或典籍（影之书）三者之一。", ["srd51", "第 47 页"]),
          S(
            "邪魔恩主来自下层位面，其目的是邪恶的，即便邪术师本人与之对抗；这类存在渴望一切事物的腐化或毁灭，最终也包括邪术师自己。能够订立契约的邪魔包括恶魔领主（如 Demogorgon、Orcus）、大魔鬼（如 Asmodeus、Dispater、Mephistopheles、Belial），以及特别强大的坑魔与炎魔。",
            ["srd51", "第 50 页"],
          ),
        ],
      },
      {
        title: "条件与限制",
        blocks: [
          E("SRD 5.1 描述了交易的存在及其带来的特性，但没有规定条款、代价、期限，也没有统一的“违约收回力量”规则。这些内容通常由战役设定或主持人决定。"),
          U("常见说法“邪术师不服从恩主就会失去法术”，在 SRD 5.1 中没有找到对应规则；是否出自其他书目，待核实。"),
        ],
      },
      {
        title: "社会与组织",
        blocks: [
          S("侍奉同一恩主的邪术师可能把彼此视为盟友、手足或对手。", ["srd51", "第 50 页"]),
          E("邪术师在社会中的处境常取决于恩主的名声：与魔鬼立约者容易被教会和圣武士视为威胁，与妖精立约者则可能卷入人情与承诺的往来。这是常见的叙事处理，不是规则。"),
        ],
      },
    ],
    rules: {
      items: [
        ["施法属性", "魅力"],
        ["法术位", "契约魔法：法术位数量少，环级随等级统一提升，短休或长休后全部恢复"],
        ["2 级", "魔能祈唤（Eldritch Invocations）"],
        ["11 级起", "秘法奥义（Mystic Arcanum）：每日一次施放 6–9 环法术"],
      ],
      cite: [["srd51", "第 46–48 页"]],
    },
    sources: [["srd51", "第 46–50 页（邪术师、邪魔恩主）"]],
    related: ["pact", "devils", "nine-hells", "true-name", "paladin", "soul-death"],
    themes: ["pact", "power", "secrets"],
    tags: ["恩主", "契约", "交易", "依附", "力量代价", "魔鬼"],
  },
  {
    slug: "paladin",
    zh: "圣武士",
    en: "Paladin",
    category: "class",
    depth: "deep",
    summary: "以神圣誓言定义自身的战士兼施法者。誓言决定其能力方向，违背誓言是这一身份最直接的危机。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-paladin", "40% 55%", "身披板甲的女骑士单膝跪在石祭坛前，双手扶着拄地的长剑立誓"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S(
            "圣武士在 3 级立下神圣誓言（Sacred Oath）。此前处于预备阶段，已投身这条道路但尚未宣誓；誓言立下后，将其永远束缚为圣武士。誓言提供誓言法术与引导神力选项，并在 7、15、20 级继续提供特性。",
            ["srd51", "第 32 页"],
          ),
        ],
      },
      {
        title: "力量来源",
        blocks: [
          E("在 SRD 5.1 的结构里，誓言而非某位特定神祇决定圣武士的子职业与能力方向。圣武士可以与神庙关系密切，但文本没有要求其力量必须来自神祇。"),
          U("“圣武士的力量来自对誓言的坚守本身”这一说法通常引自 Player's Handbook（2014）的职业介绍，本站未对照原书，待核实。", ["phb2014", "圣武士章节，页码待核实"]),
        ],
      },
      {
        title: "誓言条件",
        blocks: [
          S(
            "SRD 5.1 收录奉献之誓（Oath of Devotion）。不同圣武士的誓词措辞不同，但共享五条信条：诚实、勇气、怜悯、荣誉、职责。",
            ["srd51", "第 33 页"],
          ),
          S(
            "“违背誓言”一节承认圣武士会犯错：正确的道路可能过于艰难，局面可能只能两害相权取其轻，激动之下也可能越界。违誓者通常向同一信仰的牧师或同一骑士团的圣武士寻求赦免，以彻夜祈祷或禁食表示忏悔，经过忏悔与宽恕的仪式后重新开始。",
            ["srd51", "第 33–34 页"],
          ),
          S("若圣武士故意违誓且毫无悔意，后果会更严重：由主持人裁定，可能被迫放弃这一职业。", ["srd51", "第 34 页"]),
        ],
      },
      {
        title: "组织与传统",
        blocks: [
          E("违誓一节提到“同一骑士团”（order）与“同一信仰”，说明文本默认圣武士常属于某个骑士团或宗教团体。誓言是个人承诺，赦免却依赖他人，这使圣武士与组织之间存在依赖关系。"),
        ],
      },
    ],
    rules: {
      items: [
        ["施法属性", "魅力"],
        ["1 级", "神圣感知、圣疗（Lay on Hands）"],
        ["2 级", "战斗风格、施法、至圣斩（Divine Smite）"],
        ["6 级", "守护灵光（Aura of Protection）"],
      ],
      cite: [["srd51", "第 30–33 页"]],
    },
    sources: [["srd51", "第 30–34 页（圣武士、奉献之誓、违背誓言）"]],
    related: ["oath", "cleric", "celestials", "pact", "acolyte"],
    themes: ["faith", "pact", "secrets"],
    tags: ["誓言", "骑士团", "信条", "违誓", "忏悔"],
  },
  {
    slug: "cleric",
    zh: "牧师",
    en: "Cleric",
    category: "class",
    depth: "deep",
    summary: "经由神祇获得神力的施法者。神力以“神圣领域”的形式体现，牧师与神庙、信众之间有明确的义务关系。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-cleric", "55% 35%", "神庙临时病房里，年轻牧师把发光的手掌放在发烧孩子的额头上"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("牧师选择一个与其神祇相关的神圣领域（Divine Domain）。领域提供常备的领域法术，并在 2、6、8、17 级扩展引导神力与其他能力。SRD 5.1 收录生命领域（Life Domain）。", ["srd51", "第 16–17 页"]),
        ],
      },
      {
        title: "力量来源",
        blocks: [
          S("10 级起，牧师可以通过“神圣干预”（Divine Intervention）直接向神祇求助。", ["srd51", "第 17 页"]),
          S("SRD 的侍僧背景特别说明：主持宗教仪式与引导神力并不是一回事，侍僧不一定是牧师。", ["srd51", "第 60 页"]),
          E("因此“信徒”“神职人员”“牧师”是三个层次：信仰本身、宗教中的职位、以及实际被授予神力的人。"),
        ],
      },
      {
        title: "社会与组织",
        blocks: [
          S("侍僧背景描述了在神庙中侍奉特定神祇或神系、作为神圣领域与凡人世界之间中介的人。", ["srd51", "第 60 页"]),
          E("牧师通常与神庙、教阶、信众相连。这些关系带来庇护与资源，也带来义务：服从上级、守护圣地、执行教义，以及在信仰与个人判断冲突时做出选择。"),
        ],
      },
      {
        title: "条件与限制",
        blocks: [
          U("神祇是否会因牧师违背教义而收回神力，SRD 5.1 没有统一规则；不同战役设定的处理方式不同，待核实。"),
        ],
      },
    ],
    rules: {
      items: [
        ["施法属性", "感知；每日从牧师法术列表中准备法术"],
        ["2 级", "引导神力（Channel Divinity），短休或长休恢复"],
        ["5 级起", "摧毁不死生物（Destroy Undead）"],
        ["10 级", "神圣干预"],
      ],
      cite: [["srd51", "第 15–17 页"]],
    },
    sources: [
      ["srd51", "第 15–17 页（牧师、生命领域）"],
      ["srd51", "第 60 页（侍僧背景）"],
    ],
    related: ["paladin", "acolyte", "celestials", "oath", "soul-death"],
    themes: ["faith", "death"],
    tags: ["神祇", "神庙", "教阶", "义务", "治疗"],
  },
  {
    slug: "wizard",
    zh: "法师",
    en: "Wizard",
    category: "class",
    depth: "deep",
    summary: "以研究与记录掌握奥术的施法者。法术书是其力量的载体，也是可以被偷走、复制或继承的实物。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-wizard", "45% 35%", "塔楼书房中年长的女法师俯身抄写法术书，书页上浮着蓝色符文"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("法师在 1 级拥有一本记录六道 1 环法术的法术书，每升一级可加入两道。法术书是除戏法外所有已知法术的存放处。", ["srd51", "第 52 页"]),
          S("法师还可以把在卷轴或其他法术书中找到的法术抄进自己的法术书，抄录需要时间与材料费用。", ["srd51", "第 54 页"]),
        ],
      },
      {
        title: "力量来源",
        blocks: [
          E("法师的力量来自理解与记录，没有授予者。这意味着法术是一种可以传授、交换、垄断的知识。"),
          S("“奥术恢复”（Arcane Recovery）通过研读法术书在短休后恢复部分法术位。", ["srd51", "第 52 页"]),
        ],
      },
      {
        title: "组织与传统",
        blocks: [
          S("法师在 2 级选择奥术传承（Arcane Tradition），SRD 5.1 收录塑能学派（School of Evocation）。", ["srd51", "第 53–54 页"]),
          E("学派、导师与藏书构成法师的社会网络。抄录许可、未公开的法术与遗失的手稿，常常成为法师之间的人情与债务。"),
        ],
      },
    ],
    rules: {
      items: [
        ["施法属性", "智力；每日从法术书中准备法术"],
        ["1 级", "法术书、奥术恢复"],
        ["18 级", "法术精通（Spell Mastery）"],
      ],
      cite: [["srd51", "第 52–54 页"]],
    },
    sources: [["srd51", "第 52–54 页（法师、法术书、塑能学派）"]],
    related: ["lich", "true-name", "soul-death", "warlock"],
    themes: ["power", "secrets"],
    tags: ["法术书", "学派", "知识", "抄录"],
  },
  {
    slug: "rogue",
    zh: "游荡者",
    en: "Rogue",
    category: "class",
    depth: "deep",
    summary: "依靠训练、技巧与情报行事的角色。SRD 中的游荡者掌握一种用于传递暗语的秘密行话。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-rogue", "40% 30%", "月夜屋顶上蹲着的半精灵游荡者，举起一把偷来的铜钥匙端详"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S(
            "游荡者在训练中学会盗贼黑话（Thieves' Cant）：一种混合方言、行话与暗号的秘密语言，可以把消息藏在看似普通的对话中，只有同样懂黑话的人才能理解。用黑话传达一条消息，所需时间是直接说出的四倍。",
            ["srd51", "第 39 页"],
          ),
        ],
      },
      {
        title: "力量来源",
        blocks: [
          E("游荡者不依赖超自然来源。SRD 5.1 的“专精”（Expertise）、“灵巧动作”（Cunning Action）等特性都指向技能与时机，力量来自经验和准备。"),
        ],
      },
      {
        title: "组织与传统",
        blocks: [
          S("SRD 5.1 收录的游荡者范型为盗贼（Thief）。", ["srd51", "第 40 页"]),
          E("盗贼黑话预设了一个共享语言的群体，例如盗贼公会、走私网络或情报组织。SRD 5.1 没有描述具体组织；被遗忘的国度中的散塔林会、竖琴手都是可参照的官方设定。"),
        ],
      },
    ],
    rules: {
      items: [
        ["1 级", "专精、偷袭（Sneak Attack）、盗贼黑话"],
        ["2 级", "灵巧动作：以附赠动作疾走、撤离或躲藏"],
        ["3 级", "游荡者范型"],
      ],
      cite: [["srd51", "第 39–40 页"]],
    },
    sources: [["srd51", "第 39–40 页（游荡者、盗贼黑话、盗贼范型）"]],
    related: ["zhentarim", "harpers", "true-name"],
    themes: ["secrets", "power"],
    tags: ["黑话", "情报", "暗号", "公会"],
  },
  {
    slug: "pact",
    zh: "契约",
    en: "Pact",
    category: "concept",
    depth: "deep",
    summary: "一方以服务、物品或承诺换取另一方力量或帮助的约定。规则文本中最典型的是邪术师与恩主的交易，以及召唤与束缚类法术。",
    edition: SRD14,
    setting: GENERIC,
    image: art("theme-pact", "40% 50%", "烛光下年轻女子用发光的羽毛笔签署羊皮契约，桌对面一个长角的身影俯身按住契约"),
    sections: [
      {
        title: "是什么",
        blocks: [
          E("本站把“契约”作为概念条目，汇总规则文本中出现的几类约定：邪术师与恩主的交易、以魔法强制的服从，以及设定中魔鬼对契约的偏好。三者的约束力来源不同，不宜混为一谈。"),
        ],
      },
      {
        title: "规则文本中的契约",
        blocks: [
          S("邪术师在 1 级与异界存在订立交易（bargain），由此获得契约魔法。", ["srd51", "第 46 页"]),
          S("异界束缚（Planar Binding）尝试将一个天界生物、元素、妖精或邪魔束缚为施法者服务，持续时间随法术环级增长。", ["srd51", "第 168 页"]),
          S("约束术（Geas）对一个生物施加魔法命令，生物每次直接违背命令都会受到心灵伤害（每天至多一次）。", ["srd51", "第 148 页"]),
          E("前者是双方的交易，后两者是单方面的强制。叙事上，“自愿订立”与“被迫服从”会导向完全不同的人物关系。"),
        ],
      },
      {
        title: "契约条件",
        blocks: [
          S("SRD 5.1 中所有魔鬼数据块的阵营都是守序邪恶。", ["srd51", "第 274–278 页"]),
          U("“魔鬼重视契约、以合约换取凡人灵魂”是 D&D 中广为人知的形象，主要见于 Monster Manual（2014）魔鬼条目等非开放书目；SRD 5.1 没有相应描述，具体表述待核实。", ["mm2014", "魔鬼条目，页码待核实"]),
          E("规则文本很少写明契约条款。一份契约在叙事上通常包括：双方是谁、交换什么、期限、违约后果，以及谁有权解释条款。"),
        ],
      },
    ],
    sources: [
      ["srd51", "第 46、148、168、274–278 页"],
      ["mm2014", "魔鬼条目（未核对原文）"],
    ],
    related: ["warlock", "devils", "oath", "true-name", "soul-death", "nine-hells"],
    themes: ["pact", "power"],
    tags: ["交易", "束缚", "约束术", "条款", "违约"],
  },
  {
    slug: "oath",
    zh: "誓言",
    en: "Oath",
    category: "concept",
    depth: "deep",
    summary: "对原则的庄严承诺。与契约不同，誓言不一定有交易对象，约束力来自立誓者自身与见证它的团体。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-oath", "50% 45%", "烛光下老骑士与年轻侍从戴着护手紧握双手立誓，桌上摊开典籍与长剑"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("规则中最明确的誓言是圣武士的神圣誓言：3 级立下后，将其永远束缚为圣武士。", ["srd51", "第 32 页"]),
          E("誓言与契约的区别在于对象：契约有相对方，誓言约束的是立誓者自己。誓言被违背时，受损的首先是身份与信誉。"),
        ],
      },
      {
        title: "誓言条件",
        blocks: [
          S("奉献之誓的五条信条为：诚实、勇气、怜悯、荣誉、职责。", ["srd51", "第 33 页"]),
          S("违誓者通常向同信仰的牧师或同骑士团的圣武士寻求赦免；故意违誓且不悔改者，可能由主持人裁定放弃职业。", ["srd51", "第 33–34 页"]),
        ],
      },
      {
        title: "关联",
        blocks: [E("誓言常与信仰团体、骑士团绑定，因而与“信仰与义务”“权力与依附”两个主题都有关：誓言的解释权与赦免权往往掌握在组织手中。")],
      },
    ],
    sources: [["srd51", "第 32–34 页"]],
    related: ["paladin", "pact", "cleric", "celestials"],
    themes: ["faith", "pact", "secrets"],
    tags: ["承诺", "信条", "违誓", "赦免"],
  },
  {
    slug: "soul-death",
    zh: "灵魂与死亡",
    en: "Soul & Death",
    category: "concept",
    depth: "deep",
    summary: "在 SRD 规则中，灵魂主要出现在复活、附身与不死类内容里：死者能否回来，取决于灵魂是否自由且愿意。",
    edition: SRD14,
    setting: GENERIC,
    image: art("theme-death", "35% 50%", "灰色雾岸，提灯的摆渡人站在船上，一列半透明的灵魂在水边等待"),
    sections: [
      {
        title: "是什么",
        blocks: [
          E("SRD 5.1 没有单独的“灵魂”章节。本条汇总规则文本中涉及灵魂的条目，并把设定书中的说法单独列为待核实。"),
        ],
      },
      {
        title: "规则文本中的灵魂",
        blocks: [
          S("死者复活（Raise Dead）、转生术（Reincarnate）、复生术（Resurrection）、完全复生术（True Resurrection）与克隆术（Clone）都以死者灵魂“自由且愿意”返回为条件。", ["srd51", "第 125、173–175、189 页"]),
          S("魔魂壶（Magic Jar）让施法者的灵魂离开身体进入一个容器，并可尝试占据他人的身体。", ["srd51", "第 160 页"]),
          S("位面附录描述星界（Astral Plane）为思想与梦境之境，旅行者以脱离肉体的灵魂形态经由星界前往神圣与恶魔的位面。", ["srd51", "第 364 页"]),
          S("不死生物是因死灵魔法或邪恶诅咒而进入不死状态的曾经活着的生物，包括吸血鬼、僵尸等行尸，以及幽灵等无形之灵。", ["srd51", "第 255 页"]),
        ],
      },
      {
        title: "条件与限制",
        blocks: [
          E("“自由且愿意”这一条件意味着：灵魂可能不自由（被囚禁、被交易、被束缚），也可能不愿意回来。这两种情况在规则上会让复活失败。"),
          U("死后灵魂前往其信仰的神祇所在位面等说法属于设定内容，主要见于 Dungeon Master's Guide（2014）等书目，本站未对照原文，待核实。", ["dmg2014", "位面相关章节，页码待核实"]),
        ],
      },
    ],
    sources: [
      ["srd51", "第 125、160、173–175、189、255、364 页"],
      ["dmg2014", "位面相关章节（未核对原文）"],
    ],
    related: ["lich", "shadowfell", "celestials", "cleric", "pact", "devils"],
    themes: ["death", "pact", "faith"],
    tags: ["复活", "灵魂", "不死", "附身", "来世"],
  },
  {
    slug: "true-name",
    zh: "真名",
    en: "True Name",
    category: "concept",
    depth: "deep",
    summary: "“掌握真名就能控制对方”不是 D&D 的通用规则。本条是一份核实记录：真名在哪个版本、哪些生物上被提及，哪些已确认、哪些待核实。",
    edition: "2014（SRD 5.1 已核对；2024 未核对）",
    setting: GENERIC,
    image: art("entry-true-name", "50% 50%", "学者跪坐在粉笔法阵中，用放大镜审视卷轴上一行发光的符号"),
    sections: [
      {
        title: "核实结果",
        blocks: [
          E("截至 2026 年 11 月的整理：SRD 5.1 全文没有出现 “true name” 一词；能定位到的 5e 相关文本只涉及恶魔，且来自非开放书目，本站尚未对照原书。真名不应写成适用于所有生物的规则。"),
        ],
      },
      {
        title: "SRD 5.1 中的相关规则",
        blocks: [
          S("异界之门（Gate）施法时可以说出某个特定生物的名字——化名、头衔或绰号无效。若该生物在另一个位面，传送门会在其身边打开并把它拉过来。", ["srd51", "第 148 页"]),
          E("这条规则要求的是“真实的名字”而非称号，但没有使用“真名”一词，也没有说知道名字就能控制对方。"),
        ],
      },
      {
        title: "非开放书目中的提及",
        blocks: [
          U("据二手资料引述，Monster Manual（2014）恶魔条目有一则侧栏：恶魔领主与 1–6 型恶魔各有一个保密的真名；被魅惑时可能被迫说出；得知真名的凡人可以借强力召唤魔法把恶魔从深渊召来，并在一定程度上控制它。", ["mm2014", "恶魔条目侧栏，约第 53 页（据二手资料）"], ["seTrueName", "问答中的原书引文"]),
          U("据同一二手资料，Xanathar's Guide to Everything 的召唤高等恶魔（Summon Greater Demon）规定：说出恶魔的真名，会使其维持服从的魅力豁免处于劣势。", ["xgte", "召唤高等恶魔，页码待核实"], ["seTrueName", "问答中的原书引文"]),
        ],
      },
      {
        title: "适用范围",
        blocks: [
          E("已定位的提及只针对恶魔（demon）。魔鬼、妖精、天界生物与凡人的真名，在已核对的资料中没有找到规则依据。"),
          U("2024 版规则（SRD 5.2.1）中是否有真名相关文本，本站尚未核对，待核实。", ["srd521", "未逐条核对"]),
          E("在创作中把真名扩展到其他存在，属于原创改编。本站的“收藏到项目”会把这类改动写在“本项目采用/改动”中，与来源内容分开保存。"),
        ],
      },
    ],
    sources: [
      ["srd51", "第 148 页（异界之门）；全文检索无 “true name”"],
      ["mm2014", "恶魔条目侧栏（未核对原文）"],
      ["xgte", "召唤高等恶魔（未核对原文）"],
      ["seTrueName", "二手资料，仅用于定位"],
    ],
    related: ["demons", "devils", "pact", "warlock", "wizard"],
    themes: ["secrets", "power", "pact"],
    tags: ["名字", "控制", "召唤", "秘密", "核实案例"],
  },
  {
    slug: "devils",
    zh: "魔鬼",
    en: "Devils",
    category: "creature",
    depth: "deep",
    summary: "原生于下层位面、阵营守序邪恶的邪魔。SRD 给出了它们的数据与阵营；“精于契约”的形象主要来自非开放书目。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-devil", "55% 28%", "炼狱档案厅里，红皮肤长角的魔鬼在铁讲台前阅读账册，小魔鬼书记在旁执笔"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("邪魔（Fiends）是原生于下层位面的邪恶生物。少数侍奉神祇，更多在大魔鬼与恶魔王子的统领下行事；邪魔包括恶魔、魔鬼、地狱犬、罗刹（rakshasa）与魔鬼佣兵（yugoloth）。", ["srd51", "第 254 页"]),
          S("SRD 5.1 收录的魔鬼（如坑魔 Pit Fiend、劣魔 Lemure、胡须魔 Bearded Devil）阵营均为守序邪恶，使用炼狱语（Infernal）。", ["srd51", "第 59、274–278 页"]),
        ],
      },
      {
        title: "力量来源与限制",
        blocks: [
          S("劣魔若死在九层地狱，会在 1d10 天后复活，除非被善良阵营生物以祝福术处理，或其遗骸被洒上圣水。", ["srd51", "第 278 页"]),
          E("这条规则说明魔鬼与九层地狱这一位面紧密绑定：在本位面被消灭，并不等于真正的终结。"),
        ],
      },
      {
        title: "社会与组织",
        blocks: [
          S("邪术师邪魔恩主一节把 Asmodeus、Dispater、Mephistopheles、Belial 列为大魔鬼的例子。", ["srd51", "第 50 页"]),
          U("九层地狱森严的等级与晋升、魔鬼以契约收集灵魂等设定，主要来自 Monster Manual（2014）等书目，本站未转载，待核实具体表述。", ["mm2014", "魔鬼条目，页码待核实"]),
        ],
      },
    ],
    sources: [
      ["srd51", "第 50、59、254、274–278 页"],
      ["mm2014", "魔鬼条目（未核对原文）"],
    ],
    related: ["nine-hells", "pact", "warlock", "demons", "true-name"],
    themes: ["pact", "power"],
    tags: ["邪魔", "守序邪恶", "下层位面", "等级"],
  },
  {
    slug: "demons",
    zh: "恶魔",
    en: "Demons",
    category: "creature",
    depth: "deep",
    summary: "与魔鬼同属邪魔，但阵营为混乱邪恶，来自深渊。已定位的“真名”提及只针对恶魔。",
    edition: SRD14,
    setting: GENERIC,
    sections: [
      {
        title: "是什么",
        blocks: [
          S("邪魔包括恶魔与魔鬼等，同属下层位面的邪恶生物。", ["srd51", "第 254 页"]),
          S("SRD 5.1 收录的恶魔（如炎魔 Balor、弗洛魔 Vrock）阵营为混乱邪恶，文本中与深渊（Abyss）相关联。", ["srd51", "第 270–274 页"]),
        ],
      },
      {
        title: "与魔鬼的区别",
        blocks: [
          E("魔鬼守序、恶魔混乱。对创作来说，这意味着与魔鬼的关系更像交易与等级，与恶魔的关系更像失控与吞噬。这是编辑归纳，不是规则原文。"),
        ],
      },
      {
        title: "真名",
        blocks: [U("恶魔拥有保密真名的说法来自 Monster Manual（2014），本站只经二手资料定位，详见“真名”核实条目。", ["mm2014", "恶魔条目侧栏（未核对原文）"])],
      },
    ],
    sources: [
      ["srd51", "第 254、270–274 页"],
      ["mm2014", "恶魔条目（未核对原文）"],
    ],
    related: ["devils", "true-name", "warlock"],
    themes: ["power", "secrets"],
    tags: ["邪魔", "混乱邪恶", "深渊"],
  },
  {
    slug: "celestials",
    zh: "天界生物",
    en: "Celestials",
    category: "creature",
    depth: "deep",
    summary: "原生于上层位面、本性善良的生物，许多是神祇的使者或代理人。偏离善良的天界生物被视为骇人的罕事。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-celestial", "38% 30%", "残破的大教堂中，有翼的天界使者低头注视坐在碎石上的疲惫士兵"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("天界生物原生于上层位面，许多是神祇的仆从，在凡世与诸位面中担任信使或代理人。它们本性善良，偏离善良阵营的天界生物是骇人的罕事。天界生物包括天使、羽蛇（couatl）与飞马。", ["srd51", "第 254 页"]),
          S("SRD 5.1 收录的天使为神使（Deva）、星辉使者（Planetar）与日耀天使（Solar）。", ["srd51", "第 261–263 页"]),
        ],
      },
      {
        title: "社会与组织",
        blocks: [
          E("作为神祇的使者，天界生物把神意带到凡间，也因此与牧师、圣武士的义务直接相关。一位“堕落”的天界生物同时触及信仰、身份与秘密三个主题。"),
        ],
      },
    ],
    sources: [["srd51", "第 254、261–263 页"]],
    related: ["cleric", "paladin", "oath", "soul-death"],
    themes: ["faith", "secrets"],
    tags: ["天使", "上层位面", "神使", "堕落"],
  },
  {
    slug: "lich",
    zh: "巫妖",
    en: "Lich",
    category: "creature",
    depth: "deep",
    summary: "以命匣维系存在的强大不死施法者。命匣把巫妖的弱点变成了一个可以被藏匿、守护或夺取的物件。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-lich", "40% 35%", "地下墓室的石座上，戴王冠的骷髅巫妖举起一只发出青光的银质圣物匣"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("SRD 5.1 的巫妖是 18 级施法者，以智力施展法师法术，并拥有传奇抗性与传奇动作。", ["srd51", "第 324–325 页"]),
          S("不死生物是因死灵魔法或邪恶诅咒进入不死状态的曾经活着的生物。", ["srd51", "第 255 页"]),
        ],
      },
      {
        title: "力量来源与限制",
        blocks: [
          S("“复生”（Rejuvenation）特性：若巫妖拥有命匣（phylactery），被摧毁后会在 1d10 天内获得新躯体并恢复全部生命，新躯体出现在命匣 5 尺之内。", ["srd51", "第 325 页"]),
          E("规则只写了命匣带来的复生，没有写命匣如何制作或摧毁。对叙事而言，命匣的所在地就是巫妖的秘密。"),
          U("巫妖通过仪式把灵魂寄存于命匣、需要以灵魂供养命匣等设定，见 Monster Manual（2014）巫妖条目，本站未对照原文，待核实。", ["mm2014", "巫妖条目，页码待核实"]),
        ],
      },
    ],
    sources: [
      ["srd51", "第 255、324–325 页"],
      ["mm2014", "巫妖条目（未核对原文）"],
    ],
    related: ["soul-death", "wizard", "shadowfell"],
    themes: ["death", "secrets"],
    tags: ["不死", "命匣", "永生", "施法者"],
  },
  {
    slug: "nine-hells",
    zh: "九层地狱",
    en: "The Nine Hells",
    category: "plane",
    depth: "deep",
    summary: "分为九层的下层位面，魔鬼的居所。SRD 中零散提及层数、狄斯帕特的宫殿与劣魔的复活。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-nine-hells", "62% 50%", "赤红天空下熔岩平原边的巨大铁色要塞，一列被锁住的身影沿道路走向城门"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("位面附录在说明外层位面距离难以捉摸时举例：如果地狱的掌权者愿意，可能一天之内导览九层地狱从第一层到第九层；否则穿越其中一层就可能要数周。", ["srd51", "第 364 页"]),
          S("带有邪恶性质的外层位面称为下层位面，恶魔与魔鬼等邪魔居住于此。", ["srd51", "第 364 页"]),
          S("位面转移（Plane Shift）的说明以“九层地狱第二层的狄斯帕特宫殿”作为可指定的目的地之一。", ["srd51", "第 169 页"]),
        ],
      },
      {
        title: "条件与限制",
        blocks: [
          S("劣魔死在九层地狱会复活，除非满足特定条件。", ["srd51", "第 278 页"]),
          U("九层地狱为守序邪恶的外层位面、各层领主与 Asmodeus 的统治等详细设定，见 Dungeon Master's Guide（2014）等书目，本站未对照原文，待核实。", ["dmg2014", "外层位面章节，页码待核实"]),
        ],
      },
    ],
    sources: [
      ["srd51", "第 169、278、364 页"],
      ["dmg2014", "外层位面章节（未核对原文）"],
    ],
    related: ["devils", "pact", "warlock", "outer-planes"],
    themes: ["pact", "power"],
    tags: ["下层位面", "地狱", "魔鬼", "层级"],
  },
  {
    slug: "shadowfell",
    zh: "堕影冥界",
    en: "Shadowfell",
    category: "plane",
    depth: "deep",
    summary: "与不死生物和阴影物质相关的位面。SRD 只在法术中提及它，详细面貌来自非开放书目。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-shadowfell", "35% 50%", "灰暗无日的荒原上，提灯的旅人站在山坡回望枯林与灰色城堡废墟"),
    sections: [
      {
        title: "规则文本中的堕影冥界",
        blocks: [
          S("解除邪恶与善良（Dispel Evil and Good）的驱逐效果会把不在原生位面的不死生物送往堕影冥界，把妖精送往妖精荒野（Feywild）。", ["srd51", "第 136 页"]),
          S("造物术（Creation）从堕影冥界抽取阴影物质来制造物体。", ["srd51", "第 132 页"]),
          S("禁制术（Forbiddance）阻止生物经由星界、以太界、妖精荒野、堕影冥界或位面转移进入受保护区域。", ["srd51", "第 146 页"]),
        ],
      },
      {
        title: "待核实",
        blocks: [
          U("堕影冥界作为物质位面的阴暗回响、令人消沉的环境等描述，见 Dungeon Master's Guide（2014）位面章节，本站未对照原文，待核实。", ["dmg2014", "位面章节，页码待核实"]),
        ],
      },
    ],
    sources: [
      ["srd51", "第 132、136、146 页"],
      ["dmg2014", "位面章节（未核对原文）"],
    ],
    related: ["soul-death", "lich", "outer-planes"],
    themes: ["death"],
    tags: ["阴影", "不死", "位面"],
  },
  {
    slug: "outer-planes",
    zh: "外层位面",
    en: "Outer Planes",
    category: "plane",
    depth: "deep",
    summary: "思想与精神的领域，也是神祇与邪魔的居所。SRD 位面附录给出了物质位面、过渡位面、内层与外层位面的整体结构。",
    edition: SRD14,
    setting: GENERIC,
    image: art("entry-outer-planes", "45% 55%", "银色星界虚空中，旅人站在漂浮岩块上，远处一侧是金色城市，另一侧是泛红的要塞"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("SRD 5.1 位面附录把宇宙分为物质位面、过渡位面（以太界、星界）、内层位面（四元素位面与元素混沌）、外层位面以及半位面。", ["srd51", "第 363–365 页"]),
          S("外层位面是思想与精神的领域，其面貌可能随强大存在的意志改变；最为人知的是对应八种阵营（中立除外）及其过渡的十六个位面。", ["srd51", "第 364 页"]),
          S("带有善良性质的称为上层位面，天界生物居住于此；带有邪恶性质的称为下层位面，邪魔居住于此。阵营与位面不符的人会感到强烈的不协调，例如邪恶生物造访中立善良的极乐境（Elysium）。", ["srd51", "第 364 页"]),
        ],
      },
    ],
    sources: [["srd51", "第 363–365 页（附录：位面）"]],
    related: ["nine-hells", "shadowfell", "celestials", "devils", "soul-death"],
    themes: ["death", "faith"],
    tags: ["宇宙结构", "阵营", "上层位面", "下层位面"],
  },
  {
    slug: "harpers",
    zh: "竖琴手",
    en: "Harpers",
    category: "faction",
    depth: "deep",
    summary: "被遗忘的国度中的隐秘情报网络，由施法者与密探组成，在幕后对抗暴政、扶助弱者。",
    edition: "2014 · 官方免费资料",
    setting: FR,
    image: art("entry-factions", "30% 55%", "边境酒馆里吟游诗人把一枚银色徽针推给年轻游侠，吧台边一群黑衣佣兵在监视"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("竖琴手是由施法者与密探组成的隐秘网络，致力于让局势向无辜者、弱者与穷人倾斜。成员以不受腐蚀的善良捍卫者自居，偏好在幕后行动：挫败暴君、推翻统治者、阻止被传为邪恶的势力壮大。", ["basicFactions", "Harpers 一节"]),
        ],
      },
      {
        title: "组织与传统",
        blocks: [
          S("竖琴手特工常独自行动，依靠机智与广泛的情报网络；资深成员可以使用遍布费伦的秘密知识藏所与各大城镇的可靠线人。组织持续搜寻强大的物品以免其落入恶人之手，特工为此使用各种伪装与身份接近严密保护的秘密。", ["basicFactions", "Harpers 一节"]),
          S("官方文章把竖琴手描述为一个有千年历史的组织，散塔林会、塞尔的红袍法师与龙之教派的目标都与其相冲突。", ["harpersPost", "全文"]),
        ],
      },
      {
        title: "关联",
        blocks: [E("竖琴手同时涉及“身份与秘密”（伪装、线人、秘密藏所）和“权力与依附”（以情报影响统治者）。")],
      },
    ],
    sources: [
      ["basicFactions", "Harpers 一节"],
      ["harpersPost", "全文"],
    ],
    related: ["zhentarim", "rogue", "forgotten-realms"],
    themes: ["secrets", "power"],
    tags: ["情报", "伪装", "密探", "被遗忘的国度"],
  },
  {
    slug: "zhentarim",
    zh: "散塔林会",
    en: "Zhentarim（Black Network）",
    category: "faction",
    depth: "deep",
    summary: "被遗忘的国度中的“黑网”，以财富为权力，提供佣兵与护卫，奖励个人野心，行事游走在法律边缘。",
    edition: "2014 · 官方免费资料",
    setting: FR,
    image: art("entry-factions", "80% 40%", "酒馆吧台边身着黑衣的佣兵与富商注视着角落里的交易"),
    sections: [
      {
        title: "是什么",
        blocks: [
          S("散塔林会又称黑网（Black Network）。成员在法律的字面边缘行事，不回避可疑交易或非法活动；对散塔林会而言，财富就是权力。", ["basicFactions", "Zhentarim 一节"]),
        ],
      },
      {
        title: "组织与传统",
        blocks: [
          S("商人需要商队护卫、贵族需要保镖、城市需要守军时，散塔林会提供“用钱能买到的最好战士”。组织鼓励个人野心，奖励自行其是的创新者，只看结果；一无所有的人也能凭本事成为其中的要角。", ["basicFactions", "Zhentarim 一节"]),
          S("其目标与竖琴手相冲突。", ["harpersPost", "全文"]),
        ],
      },
      {
        title: "关联",
        blocks: [E("散塔林会以雇佣、债务与利益交换维系成员，是“权力与依附”主题中组织性依附的典型；它与竖琴手的对立也提供了现成的阵营冲突。")],
      },
    ],
    sources: [
      ["basicFactions", "Zhentarim 一节"],
      ["harpersPost", "全文"],
    ],
    related: ["harpers", "rogue", "forgotten-realms", "pact"],
    themes: ["power", "secrets"],
    tags: ["佣兵", "财富", "野心", "黑网", "被遗忘的国度"],
  },
  {
    slug: "forgotten-realms",
    zh: "被遗忘的国度",
    en: "Forgotten Realms",
    category: "setting",
    depth: "deep",
    summary: "D&D 历史最悠久的官方设定之一，以魔法世界费伦（Faerûn）为中心。竖琴手、散塔林会等势力属于这一设定。",
    edition: "2014 · 官方免费资料",
    setting: FR,
    sections: [
      {
        title: "是什么",
        blocks: [
          S("被遗忘的国度是 D&D 历史最悠久的设定之一，涵盖费伦（Faerûn）这片有繁忙商路与危险边疆的魔法世界。官方站点推荐以免费冒险 Lost Mine of Phandelver 入门，其舞台剑湾（Sword Coast）有深水城（Waterdeep）、无冬城（Neverwinter）、博德之门（Baldur's Gate）等城市。", ["realmsResource", "全文"]),
          S("第五版设定书 Sword Coast Adventurer's Guide 的序言说明，该书概述费伦与托瑞尔（Toril）世界，并重点介绍剑湾与北地（the North）。", ["scagPreface", "序言"]),
          E("本站其他条目默认不限定世界观；标注了“被遗忘的国度”的条目只在这一设定中成立。把这些势力移入原创世界时，应在项目里记为改编。"),
        ],
      },
    ],
    sources: [
      ["realmsResource", "全文"],
      ["scagPreface", "序言"],
    ],
    related: ["harpers", "zhentarim"],
    themes: ["power"],
    tags: ["官方设定", "费伦", "剑湾"],
  },
  {
    slug: "acolyte",
    zh: "侍僧",
    en: "Acolyte",
    category: "background",
    depth: "deep",
    summary: "在神庙中侍奉神祇、作为神圣与凡世之间中介的人。SRD 特别指出：主持仪式不等于引导神力。",
    edition: SRD14,
    setting: GENERIC,
    sections: [
      {
        title: "是什么",
        blocks: [
          S("侍僧一生侍奉某位神祇或神系的神庙，作为神圣领域与凡人世界之间的中介，主持圣礼、献祭，引导信众接近神明。", ["srd51", "第 60 页"]),
          S("侍僧不一定是牧师：主持宗教仪式与引导神力不是一回事。", ["srd51", "第 60 页"]),
        ],
      },
      {
        title: "社会与组织",
        blocks: [E("侍僧的身份来自所属神庙与教阶，能在同信仰的神殿获得庇护，也受其约束。这让侍僧天然处在“信仰与义务”主题之中。")],
      },
    ],
    rules: {
      items: [
        ["技能熟练", "洞悉、宗教"],
        ["特性", "信仰庇护（Shelter of the Faithful）"],
      ],
      cite: [["srd51", "第 60–61 页"]],
    },
    sources: [["srd51", "第 60–61 页"]],
    related: ["cleric", "paladin", "celestials"],
    themes: ["faith", "secrets"],
    tags: ["神庙", "教阶", "信众"],
  },
];

// Short original summaries for SRD classes without a deep entry. Mechanics come from the SRD data snapshot.
const classNotes: Record<string, { summary: string; power: string; subclass: string; page: string }> = {
  barbarian: { summary: "以狂暴（Rage）为核心的战士。力量来自身体与情绪，而非魔法或授予者。", power: "1 级特性“狂暴”让其在战斗中进入强化状态；SRD 5.1 收录的道途为狂战士道途（Path of the Berserker）。", subclass: "狂战士道途", page: "第 8–9 页" },
  bard: { summary: "以音乐、言辞与知识施法的角色。SRD 中的诗人学院以收集知识为传统。", power: "诗人以魅力施法，通过“诗人激励”（Bardic Inspiration）影响同伴；SRD 5.1 收录逸闻学院（College of Lore）。", subclass: "逸闻学院", page: "第 11–13 页" },
  druid: { summary: "与自然力量相连的施法者，拥有属于德鲁伊的秘密语言。", power: "德鲁伊懂得德鲁伊语（Druidic）这一秘密语言，以感知施法；SRD 5.1 收录大地结社（Circle of the Land）。", subclass: "大地结社", page: "第 19–21 页" },
  fighter: { summary: "以武器训练与战术见长的战士，不依赖超自然力量。", power: "力量来自训练与经验；SRD 5.1 收录勇士范型（Champion）。", subclass: "勇士", page: "第 24–25 页" },
  monk: { summary: "通过修行掌控体内“气”（Ki）的武者，常与寺院传统相连。", power: "2014 版规则中的武僧以“气”驱动特殊能力；SRD 5.1 收录散手之道（Way of the Open Hand）。", subclass: "散手之道", page: "第 26–28 页" },
  ranger: { summary: "在荒野中追踪特定敌人、熟悉特定地形的战士兼施法者。", power: "1 级特性“宿敌”（Favored Enemy）与“自然探索者”体现其经验来源；SRD 5.1 收录猎人（Hunter）。", subclass: "猎人", page: "第 35–38 页" },
  sorcerer: { summary: "魔力来自自身血脉或先天来源的施法者，不需要学习或授予。", power: "1 级选择术法起源（Sorcerous Origin）；SRD 5.1 收录龙族血脉（Draconic Bloodline）。", subclass: "龙族血脉", page: "第 42–44 页" },
};

const raceNotes: Record<string, string> = {
  dragonborn: "带有龙族血统的类人种族，血统决定吐息与抗性的伤害类型。",
  dwarf: "体格坚韧、与石头和工艺传统相关的种族，适应地下环境。",
  elf: "感官敏锐、寿命漫长的种族，带有妖精血统，以出神代替睡眠。",
  gnome: "体型小巧、好奇心强的种族，SRD 版本拥有抵抗魔法心灵影响的狡黠。",
  "half-elf": "兼有人类与精灵血统的种族，常被描写为跨越两个群体之间的人。",
  "half-orc": "兼有人类与兽人血统的种族，基础特性偏向力量与坚韧。",
  halfling: "体型小巧、以幸运和勇气著称的种族。",
  human: "适应力强、分布最广的种族，SRD 版本六项属性均衡提升。",
  tiefling: "带有炼狱血统的种族，拥有火焰抗性与先天法术“炼狱遗赠”。",
};
const raceTraits: Record<string, string> = {
  human: "六项属性各 +1；速度 30 尺。",
  dwarf: "体质 +2；速度 25 尺；黑暗视觉、矮人韧性、石工知识。",
  elf: "敏捷 +2；速度 30 尺；黑暗视觉、敏锐感官、妖精血统、出神。",
  halfling: "敏捷 +2；速度 25 尺；小型；幸运、勇气、半身人灵巧。",
  dragonborn: "力量 +2、魅力 +1；速度 30 尺；龙族血统、吐息、伤害抗性。",
  gnome: "智力 +2；速度 25 尺；小型；黑暗视觉、侏儒狡黠。",
  "half-elf": "魅力 +2，另选两项属性各 +1；速度 30 尺；黑暗视觉、妖精血统、技能多才。",
  "half-orc": "力量 +2、体质 +1；速度 30 尺；黑暗视觉、威吓熟练、坚韧不屈、凶蛮攻击。",
  tiefling: "智力 +1、魅力 +2；速度 30 尺；黑暗视觉、火焰抗性、炼狱遗赠。",
};

const abilityZh: Record<string, string> = { STR: "力量", DEX: "敏捷", CON: "体质", INT: "智力", WIS: "感知", CHA: "魅力" };

type ClassRow = { index: string; name: string; hit_die: number; saving_throws?: { index?: string; name: string }[] };
const catalogClasses: Entry[] = (classes as unknown as ClassRow[])
  .filter((c) => !deep.some((d) => d.slug === c.index))
  .map((c) => {
    const n = classNotes[c.index];
    return {
      slug: c.index,
      zh: classNames[c.index] ?? c.name,
      en: c.name,
      category: "class" as const,
      depth: "catalog" as const,
      summary: n?.summary ?? "SRD 5.1 收录的职业。",
      edition: SRD14,
      setting: GENERIC,
      sections: n
        ? [{ title: "力量来源", blocks: [S(n.power, ["srd51", n.page]), E("本条目前只有简要整理，深入的组织、传统与社会关系内容尚未编写。")] }]
        : [],
      rules: {
        items: [
          ["生命骰", `d${c.hit_die}`],
          ["豁免熟练", (c.saving_throws ?? []).map((s) => abilityZh[s.name] ?? s.name).join("、")],
          ["SRD 子职业", n?.subclass ?? "—"],
        ],
        cite: [["data5ebits", "Classes.json"]],
      },
      sources: [["srd51", n?.page ?? "职业章节"], ["data5ebits", "Classes.json"]],
      related: [],
      themes: [],
      tags: [],
    } satisfies Entry;
  });

type RaceRow = { index: string; name: string };
const catalogRaces: Entry[] = (races as unknown as RaceRow[]).map((r) => ({
  slug: `race-${r.index}`,
  zh: raceNames[r.index] ?? r.name,
  en: r.name,
  category: "race" as const,
  depth: "catalog" as const,
  summary: raceNotes[r.index] ?? "SRD 5.1 收录的种族。",
  edition: SRD14,
  setting: GENERIC,
  sections: [{ title: "是什么", blocks: [E(raceNotes[r.index] ?? ""), E("本条目前只有简要整理，文化、社会与历史内容尚未编写。")] }],
  rules: { items: [["种族特性", raceTraits[r.index] ?? "见 SRD"]], cite: [["srd51", "第 3–7 页"], ["data5ebits", "Races.json"]] },
  sources: [["srd51", "第 3–7 页（种族）"], ["data5ebits", "Races.json"]],
  related: r.index === "tiefling" ? ["devils", "nine-hells"] : [],
  themes: r.index === "tiefling" || r.index === "half-elf" ? ["secrets"] : [],
  tags: [],
}));

export const entries: Entry[] = [...deep, ...catalogClasses, ...catalogRaces];
export const entryMap = new Map(entries.map((e) => [e.slug, e]));
export const getEntry = (slug: string) => entryMap.get(slug);

export function searchEntries(q: string, cat?: string) {
  const term = q.trim().toLowerCase();
  return entries.filter((e) => {
    if (cat && e.category !== cat) return false;
    if (!term) return true;
    const hay = [e.zh, e.en, e.summary, e.setting, ...e.tags, categoryNames[e.category]].join(" ").toLowerCase();
    return term.split(/\s+/).every((t) => hay.includes(t));
  });
}
