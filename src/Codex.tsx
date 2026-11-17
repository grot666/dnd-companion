import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Swords,
  Axe,
  WandSparkles,
  Shield,
  Flame,
  Music,
  Leaf,
  Hand,
  Sparkles,
  Eye,
  TreePine,
  BookOpen,
  Compass,
  Globe2,
  Users,
  Backpack,
  ScrollText,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Check,
  ExternalLink,
  Dice5,
  Target,
  GraduationCap,
  MapPin,
  Castle,
  Mountain,
  Anchor,
  Navigation,
  Orbit,
  Heart,
  Lightbulb,
} from "lucide-react";
import App from "./App";
import * as R from "./rules";
import {
  classGuides,
  raceGuides,
  sourceLinks,
  starterSections,
  spellLessons,
} from "./guide-data";
import type { ClassGuide } from "./guide-data";
import "./codex.css";
type SectionId =
  | "start"
  | "classes"
  | "races"
  | "backgrounds"
  | "spells"
  | "equipment"
  | "world"
  | "tools";
const sections: {
  id: SectionId;
  name: string;
  en: string;
  icon: typeof Swords;
}[] = [
  { id: "start", name: "快速入门", en: "START HERE", icon: GraduationCap },
  { id: "classes", name: "职业", en: "CLASSES", icon: Swords },
  { id: "races", name: "种族", en: "RACES", icon: Users },
  { id: "backgrounds", name: "背景", en: "BACKGROUNDS", icon: ScrollText },
  { id: "spells", name: "法术", en: "SPELLS", icon: WandSparkles },
  { id: "equipment", name: "装备与魔法物品", en: "EQUIPMENT", icon: Backpack },
  { id: "world", name: "地理与世界", en: "WORLDS", icon: Globe2 },
  { id: "tools", name: "角色工具", en: "CHARACTER TOOLS", icon: Dice5 },
];
const icons: Record<string, typeof Swords> = {
  fighter: Swords,
  wizard: WandSparkles,
  rogue: Eye,
  cleric: Shield,
  barbarian: Axe,
  bard: Music,
  druid: Leaf,
  monk: Hand,
  paladin: Sparkles,
  ranger: TreePine,
  sorcerer: Flame,
  warlock: Orbit,
};
const titles: Record<SectionId, [string, string]> = {
  start: [
    "先会玩，再开始冒险。",
    "从一次掷骰，到你的第一个回合。用最少的术语，理解 D&D 的核心。",
  ],
  classes: [
    "找到你的冒险方式。",
    "12 种职业，12 种解决问题的方式。先看玩法，再看规则。",
  ],
  races: [
    "你从哪里来？",
    "种族提供特性，不替你决定个性。了解 2014 版的基础差异与亚种族。",
  ],
  backgrounds: [
    "成为冒险者之前。",
    "背景回答「你曾经是谁」，也为技能、语言和故事提供出发点。",
  ],
  spells: [
    "魔法，先看懂再施放。",
    "先分清环阶、法术位与专注，再查找适合你的那一道法术。",
  ],
  equipment: [
    "让装备服务你的玩法。",
    "武器、护甲、冒险用品与魔法物品。先理解用途，不急着比较价格。",
  ],
  world: [
    "规则之外，是世界。",
    "区分游戏系统、战役设定与冒险地点。地图不止一张，故事也不止一种。",
  ],
  tools: [
    "把想法写成角色。",
    "已保存的角色仍在这里。创建、管理与备份工具，不影响百科阅读。",
  ],
};
const tabSets: Record<SectionId, string[]> = {
  start: ["游戏怎么玩", "掷骰与检定", "战斗速读"],
  classes: ["职业介绍", "核心特点", "玩法与成长"],
  races: ["种族概览", "属性与亚种族"],
  backgrounds: ["背景是什么", "侍僧背景", "自定义背景"],
  spells: ["施法入门", "法术速查"],
  equipment: ["装备入门", "物品速查"],
  world: ["认识世界", "位面速览", "原创地区地图"],
  tools: ["角色管理"],
};
function readPref<T>(key: string, fallback: T): T {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    return typeof data === typeof fallback ? data : fallback;
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Character save errors are handled independently by the character tools. */
  }
}
function Source({ world = false }: { world?: boolean }) {
  return (
    <div className="g-source">
      <BookOpen size={14} />
      <span>
        {world
          ? "资料边界：设定介绍为自行撰写的事实摘要；并非 SRD 地理全文。"
          : "规则依据：2014 · SRD 5.1。中文为本项目编写的非官方导读，不取代完整规则。"}
      </span>
      <a
        href={world ? sourceLinks.realms : sourceLinks.srd}
        target="_blank"
        rel="noreferrer"
      >
        阅读来源 <ArrowUpRight size={13} />
      </a>
    </div>
  );
}
function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="g-note">
      <Lightbulb size={20} />
      <div>
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    </aside>
  );
}
function Art({ guide, large = false }: { guide: ClassGuide; large?: boolean }) {
  const Icon = icons[guide.id];
  return (
    <div
      className={`g-art ${large ? "g-art-large" : ""}`}
      aria-hidden="true"
      style={{ "--class-color": guide.color } as CSSProperties}
    >
      <svg viewBox="0 0 300 240" className="g-art-lines">
        <path d="M150 12 260 72v110l-110 50-110-50V72Z" />
        <circle cx="150" cy="121" r="80" />
        <circle cx="150" cy="121" r="101" strokeDasharray="2 14" />
        <path d="m150 26 84 95-84 95-84-95zM27 121h246M150 1v238" />
        <path d="m55 40 5 12 12 5-12 5-5 12-5-12-12-5 12-5zm196 125 5 12 12 5-12 5-5 12-5-12-12-5 12-5z" />
      </svg>
      <div className="g-class-sigil">
        <Icon strokeWidth={1.05} />
      </div>
      <span className="g-art-word">{guide.id.toUpperCase()}</span>
    </div>
  );
}
export default function Codex() {
  const initialHash = location.hash.slice(1) as SectionId;
  const [section, setSection] = useState<SectionId>(
    sections.some((s) => s.id === initialHash) ? initialHash : "classes",
  );
  const [tab, setTab] = useState(0),
    [selected, setSelected] = useState(() => {
      const id = readPref("codex-class", "fighter");
      return classGuides.some((c) => c.id === id) ? id : "fighter";
    }),
    [collapsed, setCollapsed] = useState(() =>
      readPref("codex-sidebar-collapsed", false),
    ),
    [drawer, setDrawer] = useState(false),
    [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [catalogQuery, setCatalogQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null),
    drawerRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    document.body.classList.add("codex-body");
    return () => document.body.classList.remove("codex-body");
  }, []);
  useEffect(() => writePref("codex-sidebar-collapsed", collapsed), [collapsed]);
  useEffect(() => writePref("codex-class", selected), [selected]);
  useEffect(() => {
    const fn = () => {
      const id = location.hash.slice(1) as SectionId;
      if (sections.some((s) => s.id === id)) {
        setSection(id);
        setTab(0);
      }
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (drawer) drawerRef.current?.showModal();
    else drawerRef.current?.close();
  }, [drawer]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  function navigate(id: SectionId, nextTab = 0, q = "") {
    setSection(id);
    setTab(nextTab);
    setDrawer(false);
    setSearchOpen(false);
    setCatalogQuery(q);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(".g-search"))
        setSearchOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);
  const active = sections.find((s) => s.id === section)!;
  const selectedGuide = classGuides.find((c) => c.id === selected)!;
  const searchRecords = [
    ...sections.map((s) => ({
      label: s.name,
      sub: "百科栏目",
      section: s.id,
      tab: 0,
    })),
    ...classGuides.map((c) => ({
      label: R.classNames[c.id] + " " + c.id,
      sub: c.role,
      keywords: c.intro + " " + c.features.flat().join(" "),
      section: "classes" as SectionId,
      tab: 0,
      classId: c.id,
    })),
    ...R.races.map((r) => ({
      label: R.raceNames[r.index] + " " + r.name,
      sub: "种族",
      section: "races" as SectionId,
      tab: 0,
    })),
    ...starterSections.map((s, i) => ({
      label: s.title,
      sub: "入门知识",
      section: "start" as SectionId,
      tab: i === 0 ? 0 : i < 5 ? 1 : 2,
    })),
    ...spellLessons.map((s) => ({
      label: s[0],
      sub: "施法入门",
      section: "spells" as SectionId,
      tab: 0,
    })),
    ...R.spells.map((s) => ({
      label: (s.zh ? s.zh + " · " : "") + s.name,
      sub: `法术 · ${s.level === 0 ? "戏法" : s.level + "环"}`,
      section: "spells" as SectionId,
      tab: 1,
      q: s.name,
    })),
    ...R.items.map((i) => ({
      label: (i.zh ? i.zh + " · " : "") + i.name,
      sub: "物品",
      section: "equipment" as SectionId,
      tab: 1,
      q: i.name,
    })),
  ];
  const results = query.trim()
    ? searchRecords
        .filter((r) =>
          (r.label + " " + r.sub + " " + ("keywords" in r ? r.keywords : ""))
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 12)
    : [];
  function nav(mobile = false) {
    return (
      <nav className="g-nav" aria-label={mobile ? "移动百科导航" : "百科导航"}>
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={section === s.id ? "g-active" : ""}
            onClick={() => navigate(s.id)}
            aria-current={section === s.id ? "page" : undefined}
            aria-label={s.name}
            title={s.name}
          >
            <s.icon size={20} />
            <span>{s.name}</span>
            <small>{String(i + 1).padStart(2, "0")}</small>
          </button>
        ))}
      </nav>
    );
  }
  return (
    <div className={`g-shell ${collapsed ? "g-collapsed" : ""}`}>
      <aside className="g-sidebar">
        <a
          href="#classes"
          className="g-brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("classes");
          }}
          aria-label="D&D 探索手册首页"
        >
          <Dice5 />
          <span>
            D&D <b>CODEX</b>
            <small>探索手册</small>
          </span>
        </a>
        <div className="g-nav-heading">
          探索 D&D<span>2014 · 5E</span>
        </div>
        {nav()}
        <div className="g-sidebar-bottom">
          <div className="g-version-dot" />
          <span>
            2014 版开放规则<small>SRD 5.1 · 非官方中文导读</small>
          </span>
        </div>
        <button
          className="g-collapse"
          aria-label={collapsed ? "展开侧边菜单" : "收起侧边菜单"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "展开侧边菜单" : "收起侧边菜单"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
          <span>收起菜单</span>
          <kbd>[</kbd>
        </button>
      </aside>
      <div className="g-workspace">
        <header className="g-topbar">
          <button
            className="g-mobile-menu"
            aria-label="打开导航"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Menu size={21} />
          </button>
          <div className="g-breadcrumb">
            探索手册 <ChevronRight size={12} />
            <span>{active.name}</span>
          </div>
          <div className="g-search">
            <Search size={16} />
            <input
              ref={searchRef}
              aria-label="搜索百科、法术与物品"
              placeholder="搜索职业、规则、法术…"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
            />
            <kbd>⌘ K</kbd>
            {searchOpen && query && (
              <div className="g-search-results">
                <div className="g-search-caption">
                  跨栏目搜索
                  <button
                    aria-label="关闭搜索结果"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X size={15} />
                  </button>
                </div>
                {results.length ? (
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if ("classId" in r && typeof r.classId === "string")
                          setSelected(r.classId);
                        navigate(
                          r.section,
                          r.tab,
                          "q" in r && typeof r.q === "string" ? r.q : "",
                        );
                        setQuery("");
                      }}
                    >
                      <Search size={14} />
                      <span>
                        {r.label}
                        <small>{r.sub}</small>
                      </span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))
                ) : (
                  <p>没有找到。试试「法师」「专注」或英文名称。</p>
                )}
              </div>
            )}
          </div>
          <span className="g-edition">
            5E <b>2014</b>
          </span>
          <a
            className="g-github"
            href="https://github.com/grot666/dnd-companion"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 项目源码"
          >
            <ExternalLink size={17} />
          </a>
        </header>
        <main className="g-main">
          <div className="g-page-title">
            <div>
              <span className="g-eyebrow">EXPLORER’S CODEX / {active.en}</span>
              <h1>
                {active.name}
                <span aria-hidden="true">
                  {section === "classes"
                    ? "12"
                    : section === "races"
                      ? "09"
                      : null}
                </span>
              </h1>
              <p>{titles[section][1]}</p>
            </div>
            {section !== "tools" && (
              <button
                className="g-start-link"
                onClick={() =>
                  navigate(section === "start" ? "classes" : "start")
                }
              >
                {section === "start" ? "选择一个职业" : "第一次接触 D&D？"}{" "}
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          <div
            className="g-tabs"
            role="tablist"
            aria-label={`${active.name}内容分类`}
            onKeyDown={(e) => {
              const count = tabSets[section].length;
              let next = tab;
              if (e.key === "ArrowRight") next = (tab + 1) % count;
              else if (e.key === "ArrowLeft") next = (tab - 1 + count) % count;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = count - 1;
              else return;
              e.preventDefault();
              setTab(next);
              document.getElementById(`g-tab-${section}-${next}`)?.focus();
            }}
          >
            {tabSets[section].map((t, i) => (
              <button
                key={t}
                role="tab"
                id={`g-tab-${section}-${i}`}
                aria-controls={`g-panel-${section}`}
                tabIndex={tab === i ? 0 : -1}
                aria-selected={tab === i}
                className={tab === i ? "g-tab-active" : ""}
                onClick={() => setTab(i)}
              >
                {t}
                {section === "spells" && i === 1 && <small>319</small>}
              </button>
            ))}
          </div>
          <div
            className="g-panel"
            id={`g-panel-${section}`}
            aria-labelledby={`g-tab-${section}-${tab}`}
            role="tabpanel"
            aria-label={tabSets[section][tab]}
          >
            {section === "classes" && (
              <Classes
                guide={selectedGuide}
                tab={tab}
                onSelect={(id) => {
                  setSelected(id);
                  document
                    .querySelector(".g-class-hero")
                    ?.scrollIntoView({ behavior: "auto", block: "start" });
                }}
                onTab={setTab}
              />
            )}
            {section === "start" && (
              <Starter tab={tab} onGo={() => navigate("classes")} />
            )}
            {section === "races" && <Races tab={tab} />}
            {section === "backgrounds" && <Background tab={tab} />}
            {section === "world" && <World tab={tab} />}
            {section === "spells" &&
              (tab === 0 ? (
                <>
                  <div className="g-lead-panel">
                    <div className="g-lead-icon violet">
                      <WandSparkles size={40} />
                    </div>
                    <div>
                      <span className="g-eyebrow">SPELLCASTING ESSENTIALS</span>
                      <h2>先分清资源，再选择魔法。</h2>
                      <p>
                        法术条目告诉你「做什么」；职业告诉你「如何获得与施放」。下面这
                        8 件事，比记住法术名字更重要。
                      </p>
                    </div>
                  </div>
                  <div className="g-info-grid">
                    {spellLessons.map(([title, text], i) => (
                      <article className="g-info" key={title}>
                        <span className="g-step">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </article>
                    ))}
                  </div>
                  <button className="g-button" onClick={() => setTab(1)}>
                    查找 319 道开放法术 <ArrowRight size={17} />
                  </button>
                  <Source />
                </>
              ) : (
                <div className="legacy-tools g-catalog-embed">
                  <App
                    key={`spells-${catalogQuery}`}
                    initialView="spells"
                    initialQuery={catalogQuery}
                    onNavigate={(v) =>
                      navigate(
                        v === "sheet"
                          ? "tools"
                          : v === "spells"
                            ? "spells"
                            : "equipment",
                        v === "sheet" ? 0 : 1,
                      )
                    }
                  />
                </div>
              ))}
            {section === "equipment" &&
              (tab === 0 ? (
                <Equipment onCatalog={() => setTab(1)} />
              ) : (
                <div className="legacy-tools g-catalog-embed">
                  <App
                    key={`items-${catalogQuery}`}
                    initialView="items"
                    initialQuery={catalogQuery}
                    onNavigate={(v) =>
                      navigate(
                        v === "sheet"
                          ? "tools"
                          : v === "spells"
                            ? "spells"
                            : "equipment",
                        v === "sheet" ? 0 : 1,
                      )
                    }
                  />
                </div>
              ))}
            {section === "tools" && (
              <>
                <Note title="你原来的角色数据没有搬家">
                  继续使用相同的浏览器本地存档。角色工具是辅助功能；阅读百科不需要先创建角色。清理站点数据前，请导出备份。
                </Note>
                <div className="legacy-tools">
                  <App
                    key="characters"
                    onNavigate={(v) =>
                      navigate(
                        v === "sheet"
                          ? "tools"
                          : v === "spells"
                            ? "spells"
                            : "equipment",
                        v === "sheet" ? 0 : 1,
                      )
                    }
                  />
                </div>
              </>
            )}
          </div>
          <footer className="g-footer">
            <span>
              <Dice5 size={14} /> D&D CODEX <i>理解规则，开始冒险。</i>
            </span>
            <div>
              <a href="https://grot666.github.io/">
                返回博客 <ArrowUpRight size={12} />
              </a>
              <a
                href={`${import.meta.env.BASE_URL}attribution.html`}
                target="_blank"
                rel="noreferrer"
              >
                来源与许可
              </a>
              <span>2014 / SRD 5.1</span>
            </div>
          </footer>
        </main>
      </div>
      <dialog
        ref={drawerRef}
        className="g-drawer"
        onCancel={() => setDrawer(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawer(false);
        }}
      >
        <div className="g-drawer-head">
          <span>
            <Dice5 size={22} /> D&D 探索手册
          </span>
          <button aria-label="关闭导航" onClick={() => setDrawer(false)}>
            <X size={21} />
          </button>
        </div>
        {nav(true)}
        <p>
          2014 · SRD 5.1
          <br />
          非官方中文导读 · 角色数据仅存本机
        </p>
      </dialog>
    </div>
  );
}
function Classes({
  guide,
  tab,
  onSelect,
  onTab,
}: {
  guide: ClassGuide;
  tab: number;
  onSelect: (id: string) => void;
  onTab: (n: number) => void;
}) {
  const Icon = icons[guide.id];
  return (
    <>
      {tab !== 0 && (
        <div className="g-class-picker" aria-label="切换职业">
          {classGuides.map((c) => {
            const I = icons[c.id];
            return (
              <button
                key={c.id}
                aria-pressed={guide.id === c.id}
                className={guide.id === c.id ? "selected" : ""}
                onClick={() => onSelect(c.id)}
                style={{ "--class-color": c.color } as CSSProperties}
              >
                <I size={15} />
                {R.classNames[c.id]}
              </button>
            );
          })}
        </div>
      )}
      <section
        className="g-class-hero"
        style={{ "--class-color": guide.color } as CSSProperties}
      >
        <div className="g-class-hero-copy">
          <span className="g-class-label">
            <span />
            {tab === 0 ? "当前探索" : "职业档案"} / {guide.tag}
          </span>
          <div className="g-class-name">
            <h2>{R.classNames[guide.id]}</h2>
            <span>{guide.id.toUpperCase()}</span>
          </div>
          <p>{guide.intro}</p>
          <div className="g-class-facts">
            <span>
              <Target size={15} />
              {guide.role}
            </span>
            <span>
              <Dice5 size={15} />
              {guide.ability}
            </span>
          </div>
          {tab === 0 && (
            <button className="g-button" onClick={() => onTab(1)}>
              了解核心特点 <ArrowRight size={16} />
            </button>
          )}
        </div>
        <Art guide={guide} large />
        <span className="g-hero-index">
          CLASS / {String(classGuides.indexOf(guide) + 1).padStart(2, "0")}
        </span>
      </section>
      {tab === 0 ? (
        <>
          <div className="g-section-title">
            <div>
              <span className="g-eyebrow">CHOOSE YOUR PLAYSTYLE</span>
              <h2>不只是职业，更是玩法。</h2>
            </div>
            <span>点击切换 · 共 12 种职业</span>
          </div>
          <div className="g-class-grid">
            {classGuides.map((c) => {
              const I = icons[c.id];
              return (
                <button
                  className={`g-class-card ${guide.id === c.id ? "is-selected" : ""}`}
                  style={{ "--class-color": c.color } as CSSProperties}
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  aria-pressed={guide.id === c.id}
                >
                  <div className="g-class-card-art">
                    <Art guide={c} />
                    <span className="g-card-top-tag">{c.tag}</span>
                    {guide.id === c.id && (
                      <span className="g-selected-check">
                        <Check size={13} />
                      </span>
                    )}
                  </div>
                  <div className="g-class-card-body">
                    <div className="g-card-heading">
                      <I size={20} />
                      <h3>
                        {R.classNames[c.id]}
                        <small>{c.id.toUpperCase()}</small>
                      </h3>
                      <ChevronRight size={16} />
                    </div>
                    <p>{c.hook}</p>
                    <div className="g-card-chips">
                      <span>{c.role.split(" · ")[0]}</span>
                      <span>
                        {c.difficulty === 1
                          ? "易上手"
                          : c.difficulty === 2
                            ? "需要练习"
                            : "选择较多"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Note title="不知道先选谁？">
            想少管理资源，从战士开始；喜欢技能与侦察，看看游荡者；想研究法术组合，试试法师。上手难度是本项目的编辑建议，不是官方强度评级，也不代表职业高低。
          </Note>
        </>
      ) : tab === 1 ? (
        <>
          <div className="g-section-title">
            <div>
              <span className="g-eyebrow">CLASS FEATURES</span>
              <h2>{R.classNames[guide.id]}如何发挥作用？</h2>
            </div>
            <span>基础机制 · 2014</span>
          </div>
          <div className="g-feature-grid">
            {guide.features.map(([title, text], i) => (
              <article
                className="g-feature"
                key={title}
                style={{ "--class-color": guide.color } as CSSProperties}
              >
                <span className="g-feature-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <section className="g-rule-example">
            <div>
              <Dice5 size={21} />
              <h3>带入一幕，理解规则</h3>
            </div>
            <p>{guide.example}</p>
          </section>
          <Note title="开放子职示例">
            {guide.subclass}。SRD
            仅开放部分子职；这不是该职业的全部可选项。本页聚焦新手理解，不逐条列出完整职业规则。
            <a href={sourceLinks.srd} target="_blank" rel="noreferrer">
              {" "}
              查阅完整 SRD ↗
            </a>
          </Note>
        </>
      ) : (
        <>
          <div className="g-growth-layout">
            <section>
              <div className="g-section-title">
                <div>
                  <span className="g-eyebrow">LEVEL UP</span>
                  <h2>成长路标</h2>
                </div>
              </div>
              <div className="g-timeline">
                {guide.growth.map(([title, text], i) => (
                  <article key={title}>
                    <span>{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="g-advice">
              <span className="g-eyebrow">FIELD NOTES</span>
              <h2>第一次玩{R.classNames[guide.id]}</h2>
              {guide.advice.map((t, i) => (
                <div key={t}>
                  <b>0{i + 1}</b>
                  <p>{t}</p>
                </div>
              ))}
              <span className="g-difficulty">
                上手复杂度：{"●".repeat(guide.difficulty)}
                {"○".repeat(3 - guide.difficulty)}
                <small>编辑建议 · 不是强度排行</small>
              </span>
            </section>
          </div>
        </>
      )}
      <Source />
    </>
  );
}
function Starter({ tab, onGo }: { tab: number; onGo: () => void }) {
  const ids =
    tab === 0
      ? ["table", "dice"]
      : tab === 1
        ? ["checks", "advantage", "abilities"]
        : ["combat", "actions", "magic"];
  return (
    <>
      <section className="g-start-banner">
        <div>
          <span className="g-eyebrow">NO EXPERIENCE REQUIRED</span>
          <h2>
            {tab === 0
              ? "一张桌子，一群朋友，一个共同的故事。"
              : tab === 1
                ? "别急着掷骰，先问这次在做什么。"
                : "先说行动，再处理动作与骰子。"}
          </h2>
          <p>
            {tab === 0
              ? "你描述角色的选择，DM 回应世界，骰子让未知发生。目标是一起创造有趣的经历，而不只是赢过别人。"
              : "这里使用 2014 版基础规则。职业特性、法术和 DM 裁定可能改变一般情况。"}
          </p>
        </div>
        <Dice5 size={110} strokeWidth={0.8} />
      </section>
      <div className="g-lesson-list">
        {starterSections
          .filter((s) => ids.includes(s.id))
          .map((s, i) => (
            <article className="g-lesson" key={s.id}>
              <span className="g-step">0{i + 1}</span>
              <div>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                <div className="g-example">
                  <span>例如</span>
                  {s.example}
                </div>
              </div>
            </article>
          ))}
      </div>
      {tab === 0 && (
        <div className="g-prep-grid">
          {[
            ["玩家", "准备一个角色，描述尝试，尊重同桌玩家的选择。"],
            [
              "DM / 地下城主",
              "准备情境、扮演世界、给出 DC 或其他裁定，不是必须击败玩家的对手。",
            ],
            [
              "开团前",
              "和大家确认题材、边界、规则版本、时长与不想出现的内容。",
            ],
          ].map(([t, d]) => (
            <article key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      )}
      <button className="g-button" onClick={onGo}>
        看看哪种职业适合你 <ArrowRight size={16} />
      </button>
      <Source />
    </>
  );
}
function Races({ tab }: { tab: number }) {
  return (
    <>
      {tab === 0 ? (
        <>
          <Note title="先分清：种族与职业">
            种族提供一组天生或文化相关的规则特性；职业决定主要能力与成长。任何开放种族都可以选择任何职业。这里采用
            2014 的固定属性加值，不混入后续替换方案。
          </Note>
          <div className="g-race-grid">
            {R.races.map((r, i) => {
              const g = raceGuides[r.index];
              return (
                <article className="g-race-card" key={r.index}>
                  <span className="g-race-symbol">
                    {["◇", "✧", "❖", "✦", "⬡", "⊹", "◈", "⟐", "⟡"][i]}
                  </span>
                  <div className="g-race-title">
                    <h2>
                      {R.raceNames[r.index]}
                      <small>{r.name}</small>
                    </h2>
                    <span>{g.theme}</span>
                  </div>
                  <p>{g.intro}</p>
                  <div className="g-traits">{g.traits}</div>
                  <details>
                    <summary>亚种族 / 使用提醒</summary>
                    <p>{g.note}</p>
                  </details>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="g-table-wrap">
            <table className="g-comparison">
              <caption>2014 SRD 基础种族 · 不含亚种族额外加值</caption>
              <thead>
                <tr>
                  <th>种族</th>
                  <th>基础属性加值</th>
                  <th>速度</th>
                  <th>体型</th>
                </tr>
              </thead>
              <tbody>
                {R.races.map((r) => (
                  <tr key={r.index}>
                    <th>{R.raceNames[r.index]}</th>
                    <td>
                      {r.ability_bonuses
                        .map(
                          (b) =>
                            `${R.abilityNames[b.ability_score.index as R.Ability]} +${b.bonus}`,
                        )
                        .join("，")}
                      {r.index === "half-elf" ? "；另选两项各 +1" : ""}
                    </td>
                    <td>{r.speed} 尺</td>
                    <td>{r.size === "Small" ? "小型" : "中型"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="g-info-grid">
            {Object.entries(raceGuides).map(([id, g]) => (
              <article className="g-info" key={id}>
                <h3>{R.raceNames[id]} · 补充说明</h3>
                <p>{g.note}</p>
              </article>
            ))}
          </div>
        </>
      )}
      <Source />
    </>
  );
}
function Background({ tab }: { tab: number }) {
  return (
    <>
      {tab === 0 ? (
        <>
          <div className="g-lead-panel">
            <div className="g-lead-icon gold">
              <ScrollText size={40} />
            </div>
            <div>
              <span className="g-eyebrow">A LIFE BEFORE ADVENTURE</span>
              <h2>职业是你现在怎么冒险，背景是你过去怎么生活。</h2>
              <p>
                战士也可能曾是侍僧，法师也可以有与学术无关的成长经历。背景帮助你把数值与世界连接起来。
              </p>
            </div>
          </div>
          <div className="g-feature-grid">
            {[
              [
                "技能与其他熟练",
                "背景通常提供两项技能熟练，还可能提供工具熟练或额外语言。若从不同来源得到相同熟练，按规则换成同类的另一项。",
              ],
              [
                "背景特性与装备",
                "背景特性通常用于叙事与社会联系，不是战斗子职。装备与金币要按背景与所选建卡方式处理。",
              ],
              [
                "四个扮演锚点",
                "性格特点描述习惯；理念回答你相信什么；羁绊连接重要的人或物；缺点让你有真实的局限。",
              ],
            ].map(([t, d], i) => (
              <article className="g-feature" key={t}>
                <span className="g-feature-number">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <Note title="为什么背景列表只有侍僧？">
            SRD 5.1 只开放了侍僧（Acolyte）这一完整背景，不等于整个 D&D
            只有一个背景。本项目不复制未开放的付费背景；你可以按开放的自定义背景规则与
            DM 合作。
          </Note>
        </>
      ) : tab === 1 ? (
        <>
          <div className="g-lead-panel">
            <div className="g-lead-icon gold">
              <Shield size={40} />
            </div>
            <div>
              <span className="g-eyebrow">ACOLYTE / SRD BACKGROUND</span>
              <h2>侍僧 · 曾经侍奉神殿的人</h2>
              <p>
                你曾参与宗教仪式、照顾信众或研读信仰传统。这不要求你一定是牧师，也不自动让你能施法。
              </p>
            </div>
          </div>
          <div className="g-info-grid">
            <article className="g-info">
              <h3>技能与语言</h3>
              <p>
                洞悉、宗教熟练；自选两种额外语言。和职业熟练重复时，按同类替换规则处理。
              </p>
            </article>
            <article className="g-info">
              <h3>起始物品</h3>
              <p>
                圣徽、祈祷书或转经轮、5 根熏香、祭袍、一套普通衣物，以及装有 15
                gp
                的腰包。若改用购买起始装备的方式，需依相应规则选择，不能两套都拿。
              </p>
            </article>
            <article className="g-info">
              <h3>信仰庇护</h3>
              <p>
                同一信仰的神殿通常可提供特定帮助与简朴生活支持；治疗材料仍可能需要你提供。是否有可求助的神殿与帮助是否危险，由世界与
                DM 裁定。
              </p>
            </article>
            <article className="g-info">
              <h3>一个原创扮演问题</h3>
              <p>
                你为什么离开神殿？是为了找回圣物、帮助陌生人，还是重新理解自己的信仰？这是写作提示，不是官方背景效果。
              </p>
            </article>
          </div>
        </>
      ) : (
        <>
          <section className="g-start-banner">
            <div>
              <span className="g-eyebrow">CUSTOM BACKGROUND / 2014</span>
              <h2>先写来历，再与 DM 对齐规则。</h2>
              <p>
                自定义不是随意增加额外加值。SRD
                提供组合既有元素的方法，而不是免费获得一个新子职。
              </p>
            </div>
            <FeatherIcon />
          </section>
          <div className="g-lesson-list">
            {[
              [
                "选两项技能",
                "选择任意两项技能熟练。语言与工具熟练的总数按规则组合为两项；不要把它读成每种各两项。",
              ],
              [
                "选背景特性",
                "可使用已有背景特性；若找不到匹配的特性，与 DM 一起设计。新特性的效果必须共同确认。",
              ],
              [
                "处理装备与人格",
                "选用相应背景的装备方案，或按规则使用金币购买起始装备；补全性格、理念、羁绊与缺点，给 DM 一条故事线索。",
              ],
            ].map(([title, text], i) => (
              <article className="g-lesson" key={title}>
                <span className="g-step">0{i + 1}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <Source />
    </>
  );
}
function FeatherIcon() {
  return <ScrollText size={100} strokeWidth={0.8} />;
}
function Equipment({ onCatalog }: { onCatalog: () => void }) {
  return (
    <>
      <div className="g-feature-grid">
        {[
          [
            "武器",
            "先看你是否熟练，再看使用力量还是敏捷、近战还是远程、是否需要双手。熟练通常加在攻击检定上，不直接加到伤害。",
          ],
          [
            "护甲与盾牌",
            "护甲决定 AC 计算方式。轻甲通常加完整敏捷，中甲通常敏捷最多 +2，重甲通常不加敏捷；盾牌通常 +2 AC。还需核对熟练与使用条件。",
          ],
          [
            "冒险用品",
            "绳索、光源、背包、口粮与工具能解决法术以外的问题。先向 DM 说明怎么使用，再判断需不需要检定。",
          ],
        ].map(([t, d], i) => (
          <article className="g-feature" key={t}>
            <span className="g-feature-number">0{i + 1}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
      <section className="g-rule-example">
        <div>
          <Sparkles size={23} />
          <h3>魔法物品：拥有，不等于已经能用。</h3>
        </div>
        <p>
          有些物品要求同调，通常需要一次专门专注于该物品的短休；一个生物通常最多同调三件物品。物品还可能有职业、种族、命令语、充能或其他前提。先读完整条目，再把加值写进角色卡。
        </p>
      </section>
      <div className="g-info-grid">
        <article className="g-info">
          <h3>金币换算</h3>
          <p>
            1 gp = 10 sp = 100 cp；1 ep = 5 sp；1 pp = 10
            gp。魔法物品没有统一公开售价时，不要把空白价格当成免费。
          </p>
        </article>
        <article className="g-info">
          <h3>攻击与伤害的区别</h3>
          <p>
            例如熟练长剑的力量战士：攻击通常为 d20 + 力量调整值 +
            熟练加值；单手命中伤害通常为 1d8 +
            力量调整值。命中与造成多少伤害是两次不同的结算。
          </p>
        </article>
      </div>
      <button className="g-button" onClick={onCatalog}>
        打开装备与魔法物品速查 <ArrowRight size={16} />
      </button>
      <Source />
    </>
  );
}
const places = [
  {
    id: "harbor",
    name: "潮灯港",
    x: 190,
    y: 295,
    tag: "社交 / 补给",
    text: "来自不同地方的商队停靠在此。可以用一次询问消息的场景，练习描述意图、说服或洞悉检定。不是每次对话都需要掷骰。",
  },
  {
    id: "forest",
    name: "雾杉林",
    x: 400,
    y: 160,
    tag: "探索 / 导航",
    text: "林间道路在薄雾中分叉。用此处学习行进、观察与追踪：先问角色具体怎么做，再由 DM 判断使用感知（求生）或其他合适检定。",
  },
  {
    id: "ruins",
    name: "观星遗址",
    x: 575,
    y: 95,
    tag: "调查 / 秘密",
    text: "倾斜的观星塔刻着古老符号。它可以是一段调查或奥秘线索，而不是见到谜题就直接进入战斗。",
  },
  {
    id: "pass",
    name: "灰脊隘口",
    x: 580,
    y: 315,
    tag: "遭遇 / 站位",
    text: "一条狭窄山道连接内陆。想象队伍在这里遭遇危险：掩护、距离与地形会改变选择。地图不提供固定敌人或强制战斗。",
  },
];
function World({ tab }: { tab: number }) {
  const [place, setPlace] = useState(places[0]);
  return (
    <>
      {tab === 0 ? (
        <>
          <div className="g-world-intro">
            <div>
              <span className="g-eyebrow">SYSTEM ≠ SETTING</span>
              <h2>
                D&D 是规则，
                <br />
                不是只有一张世界地图。
              </h2>
              <p>
                同一套 5e 规则可以用于不同的战役世界，包括 DM
                自创世界。先问你的团发生在哪里，再决定角色认识哪些地名、神祇与势力。
              </p>
            </div>
            <Globe2 size={150} strokeWidth={0.6} />
          </div>
          <div className="g-world-chain">
            {[
              "D&D 5e · 游戏规则",
              "被遗忘的国度 · 战役设定",
              "托瑞尔 Toril · 世界",
              "费伦 Faerûn · 大陆",
              "剑湾 Sword Coast · 地区",
            ].map((s, i) => (
              <div key={s}>
                <span>0{i + 1}</span>
                {s}
                {i < 4 && <ChevronRight size={15} />}
              </div>
            ))}
          </div>
          <div className="g-section-title">
            <div>
              <span className="g-eyebrow">
                A CORNER OF THE FORGOTTEN REALMS
              </span>
              <h2>如果你的冒险发生在剑湾</h2>
            </div>
          </div>
          <p className="g-prose">
            剑湾位于费伦西部，是很多官方冒险和衍生作品会出现的地区。下面只提供定位用的简短事实，不复制设定书正文、城市地图或专属冒险。
          </p>
          <div className="g-feature-grid">
            {[
              [
                "无冬城 Neverwinter",
                "剑湾与北地的重要城市之一。名字常见于游戏与冒险标题；它不是整个 D&D 世界的名称。",
                Castle,
              ],
              [
                "深水城 Waterdeep",
                "剑湾的重要城邦，许多城市题材冒险以这里为舞台。角色可能从街区、人际关系与城市秘密开始探索。",
                Anchor,
              ],
              [
                "博德之门 Baldur’s Gate",
                "剑湾另一座重要城市，也是同名游戏系列所使用的地名。玩过游戏可以帮助建立印象，但桌面团的故事由本团决定。",
                Shield,
              ],
            ].map(([t, d, I]) => {
              const Icon = I as typeof Castle;
              return (
                <article className="g-feature g-city" key={t as string}>
                  <Icon size={29} />
                  <h3>{t as string}</h3>
                  <p>{d as string}</p>
                </article>
              );
            })}
          </div>
          <Note title="设定知识和规则许可分开看">
            被遗忘的国度与剑湾不是 SRD 5.1
            开放规则地理章节。本页只自行概述少量公开可核验事实；官方设定素材保留其权利。
            <a href={sourceLinks.scag} target="_blank" rel="noreferrer">
              {" "}
              官方《剑湾冒险者指南》公开前言 ↗
            </a>
          </Note>
          <Source world />
        </>
      ) : tab === 1 ? (
        <>
          <div className="g-lead-panel">
            <div className="g-lead-icon blue">
              <Orbit size={40} />
            </div>
            <div>
              <span className="g-eyebrow">PLANES OF EXISTENCE / SRD 5.1</span>
              <h2>位面不是另一块普通大陆。</h2>
              <p>
                位面是不同层次的存在。以下依据 SRD 5.1 附录 PH-C（363–365
                页）概述，示意分类不表示地理距离或必须采用的世界观。
              </p>
            </div>
          </div>
          <div className="g-plane-grid">
            {[
              [
                "物质位面",
                "Material Plane",
                "大部分常规冒险的起点，容纳多种奇幻世界。城市、森林与海洋通常位于你们战役采用的物质世界。",
              ],
              [
                "以太位面",
                "Ethereal Plane",
                "过渡位面之一；边境以太与物质位面和内层位面的区域重叠。进入与交互须依相关能力规则。",
              ],
              [
                "星界",
                "Astral Plane",
                "另一个过渡位面，在 SRD 中与思想、灵魂及通向外层位面的旅行相连。不是普通夜空中的星系地图。",
              ],
              [
                "内层位面",
                "Inner Planes",
                "以气、土、火、水四元素位面及元素混沌等概念描述物质与能量的根源，极端区域对普通旅人很危险。",
              ],
              [
                "外层位面",
                "Outer Planes",
                "更多与思想、精神、神祇以及阵营概念相关。不是靠常规走路就能量出彼此距离的一组国家。",
              ],
              [
                "半位面",
                "Demiplanes",
                "具有自身规则的小型异次元空间，可能由魔法或其他力量形成。能否进入与如何离开需要具体规则支持。",
              ],
            ].map(([t, en, d], i) => (
              <article className="g-plane" key={t}>
                <Orbit size={25} />
                <span>0{i + 1}</span>
                <h3>
                  {t}
                  <small>{en}</small>
                </h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <Source />
        </>
      ) : (
        <>
          <Note title="原创教学地图 · 星潮海岸">
            这张地图及地名是本项目原创示例，既不是费伦也不是官方 D&D
            地图。它用来说明港口、荒野、遗址与山道如何组织成一个小型冒险地区；非比例尺地图。
          </Note>
          <div className="g-map-layout">
            <div className="g-map">
              <svg
                viewBox="0 0 720 420"
                role="img"
                aria-label="星潮海岸原创示意图：西侧海岸、中央森林与东侧山脉"
              >
                <defs>
                  <pattern
                    id="mapgrid"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M30 0H0v30" fill="none" stroke="#ffffff05" />
                  </pattern>
                </defs>
                <rect width="720" height="420" fill="#14232c" />
                <path
                  d="M145 0Q210 80 155 140T200 270 170 420H720V0Z"
                  fill="#242e2d"
                  stroke="#607f7b"
                />
                <rect width="720" height="420" fill="url(#mapgrid)" />
                <path
                  d="m565 48 28-40 24 40m-8 32 29-45 24 45m-112 220 27-42 28 42m12 35 26-45 31 45"
                  fill="none"
                  stroke="#9fa48c"
                  strokeWidth="2"
                  opacity=".6"
                />
                <path
                  d="M190 295Q240 210 400 160T575 95M190 295Q385 355 580 315"
                  fill="none"
                  stroke="#c3aa6c"
                  strokeWidth="2"
                  strokeDasharray="7 7"
                  opacity=".65"
                />
                {[290, 320, 350, 380, 410, 440, 470].map((x, i) => (
                  <path
                    key={x}
                    d={`m${x} ${110 + (i % 3) * 24} -9 18h18z`}
                    fill="#537b64"
                    opacity=".65"
                  />
                ))}
                <text
                  x="40"
                  y="220"
                  fill="#668a9a"
                  fontSize="15"
                  letterSpacing="8"
                  transform="rotate(-90 40 220)"
                >
                  星 潮 海
                </text>
                <text x="650" y="385" fill="#8c9b91" fontSize="12">
                  N ↑
                </text>
                {places.map((p) => (
                  <g key={p.id} onClick={() => setPlace(p)}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="13"
                      fill={place.id === p.id ? "#cfb982" : "#182a2d"}
                      stroke="#cfb982"
                      strokeWidth="2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill={place.id === p.id ? "#1c2525" : "#cfb982"}
                    />
                    <text x={p.x + 20} y={p.y + 5} fill="#d2d7cb" fontSize="14">
                      {p.name}
                    </text>
                  </g>
                ))}
              </svg>
              <span className="g-map-credit">
                ORIGINAL REGION · NOT A CANON MAP
              </span>
            </div>
            <aside className="g-map-detail">
              <span className="g-eyebrow">EXPLORE A LOCATION</span>
              <div className="g-map-buttons">
                {places.map((p) => (
                  <button
                    className={p.id === place.id ? "selected" : ""}
                    aria-pressed={p.id === place.id}
                    key={p.id}
                    onClick={() => setPlace(p)}
                  >
                    <MapPin size={14} />
                    {p.name}
                  </button>
                ))}
              </div>
              <h2>{place.name}</h2>
              <span className="g-map-tag">{place.tag}</span>
              <p>{place.text}</p>
            </aside>
          </div>
          <p className="g-prose">
            你可以让队伍从港口出发，在森林发现线索，再去观星遗址调查。探索、社交与战斗是不同场景，不必把每个地点都变成一场战斗。
          </p>
        </>
      )}
    </>
  );
}
