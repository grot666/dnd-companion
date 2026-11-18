import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Dices,
  Library,
  Menu,
  NotebookPen,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  categoryNames,
  categoryOrder,
  entries,
  getEntry,
  searchEntries,
} from "./wb/entries";
import { searchThemes, themeMap, themes } from "./wb/themes";
import { licenseLabel, sources } from "./wb/sources";
import type { Entry, Theme } from "./wb/types";
import {
  href,
  navigate,
  seriesRoute,
  seriesTabs,
  useRoute,
  type Route,
} from "./wb/router";
import { useWorkbench, type WorkbenchApi } from "./wb/store";
import {
  addAdoption,
  decisionNames,
  SAVE_LABEL,
  WB_KEY,
  type Series,
} from "./wb/series";
import { SeriesActions, SeriesRow, SeriesView } from "./wb/SeriesView";
import classes from "./data/Classes.json";

const App = lazy(() => import("./App"));

const BASE = import.meta.env.BASE_URL;
export const asset = (p: string) => `${BASE}${p}`;

export function Art({
  src,
  focus,
  alt,
  className = "",
}: {
  src: string;
  focus: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={`wb-art ${className}`}
      src={asset(src)}
      alt={alt}
      style={{ objectPosition: focus }}
      loading="lazy"
      decoding="async"
    />
  );
}

function readPref(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

export default function Workbench() {
  const route = useRoute();
  const wb = useWorkbench();
  const [collapsed, setCollapsed] = useState(() =>
    readPref("wb-sidebar-collapsed", false),
  );
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("wb-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    drawer.current?.open && drawer.current.close();
    document.title = pageTitle(route, wb.state.series) + " · D&D 系列创作";
  }, [route, wb.state.series]);

  return (
    <div className={`wb ${collapsed ? "wb-collapsed" : ""}`}>
      <aside className="wb-sidebar" aria-label="主导航">
        <div className="wb-brand">
          <BookOpen size={22} aria-hidden="true" />
          <span className="wb-brand-text">D&amp;D 系列创作</span>
        </div>
        <Nav route={route} series={wb.state.series} />
        <button
          className="wb-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          title={collapsed ? "展开侧栏" : "收起侧栏"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span className="wb-nav-label">收起侧栏</span>
        </button>
      </aside>
      <header className="wb-topbar">
        <button
          className="wb-icon-btn"
          aria-label="打开菜单"
          onClick={() => drawer.current?.showModal()}
        >
          <Menu size={22} />
        </button>
        <a className="wb-topbar-title" href="#/">
          D&amp;D 系列创作
        </a>
      </header>
      <dialog
        ref={drawer}
        className="wb-drawer"
        aria-label="菜单"
        onClick={(e) => e.target === drawer.current && drawer.current?.close()}
      >
        <div className="wb-drawer-inner">
          <div className="wb-drawer-head">
            <span>菜单</span>
            <button
              className="wb-icon-btn"
              aria-label="关闭菜单"
              onClick={() => drawer.current?.close()}
            >
              <X size={20} />
            </button>
          </div>
          <Nav route={route} series={wb.state.series} />
        </div>
      </dialog>
      <main className="wb-main" id="main">
        {wb.warning && (
          <div className="wb-alert" role="alert">
            {wb.warning}
            {wb.blocked && (
              <span className="wb-alert-actions">
                <button
                  className="wb-btn"
                  onClick={() =>
                    download(
                      "dnd-workbench-raw-backup.json",
                      localStorage.getItem(WB_KEY) ?? "",
                      "application/json",
                    )
                  }
                >
                  导出原始存档
                </button>
                <button className="wb-btn" onClick={wb.resumeSaving}>
                  以当前内容恢复保存
                </button>
              </span>
            )}
          </div>
        )}
        {wb.notice && (
          <div className="wb-notice" role="status">
            {wb.notice}
            <button className="wb-btn wb-btn-small" onClick={wb.dismissNotice}>
              知道了
            </button>
          </div>
        )}
        <Page route={route} wb={wb} />
        <footer className="wb-footer">
          <p>
            参考资料的规则内容来自 <a href={sources.srd51.url}>SRD 5.1</a> 与{" "}
            <a href={sources.srd521.url}>SRD 5.2.1</a>（CC-BY-4.0，Wizards of
            the
            Coast）；其余为中文独立摘要，附官方来源链接。插图为本站生成的原创数字绘画。
            <a href={asset("attribution.html")}>署名与许可</a>
          </p>
          <p>本站与 Wizards of the Coast 无关联。系列与收藏{SAVE_LABEL}。</p>
        </footer>
      </main>
    </div>
  );
}

function pageTitle(r: Route, series: Series[]) {
  switch (r.name) {
    case "home":
      return "我的系列";
    case "series": {
      const s = series.find((x) => x.id === r.id);
      return `${s?.name ?? "系列"} · ${seriesTabs.find(([t]) => t === r.tab)?.[1] ?? ""}`;
    }
    case "library":
      return r.cat === "fav"
        ? "收藏"
        : r.cat
          ? (categoryNames[r.cat as keyof typeof categoryNames] ?? "资料条目")
          : "资料条目";
    case "entry":
      return getEntry(r.slug)?.zh ?? "条目";
    case "themes":
      return "主题索引";
    case "theme":
      return themeMap.get(r.slug)?.zh ?? "主题";
    case "drafts":
      return "核实草稿";
    case "tools":
      return "跑团工具";
  }
}

function Nav({ route, series }: { route: Route; series: Series[] }) {
  const is = (...names: Route["name"][]) => names.includes(route.name);
  const item = (
    to: string,
    icon: ReactNode,
    label: string,
    active: boolean,
    sub = false,
  ) => (
    <a
      key={to}
      href={to}
      className={`wb-nav-item ${sub ? "wb-nav-sub" : ""} ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      {icon}
      <span className="wb-nav-label">{label}</span>
    </a>
  );
  return (
    <nav className="wb-nav">
      <span className="wb-nav-caption">创作</span>
      {item("#/", <NotebookPen size={19} />, "我的系列", is("home"))}
      {series.map((s) =>
        item(
          href(seriesRoute(s.id)),
          <span className="wb-nav-dot" aria-hidden="true" />,
          s.name,
          route.name === "series" && route.id === s.id,
          true,
        ),
      )}
      <div className="wb-nav-sep" role="separator" />
      <span className="wb-nav-caption">参考资料</span>
      {item(
        "#/library",
        <Library size={19} />,
        "资料条目",
        is("library", "entry", "drafts"),
      )}
      {item(
        "#/themes",
        <Compass size={19} />,
        "主题索引",
        is("themes", "theme"),
      )}
      <div className="wb-nav-sep" role="separator" />
      <span className="wb-nav-caption">辅助</span>
      {item("#/tools", <Dices size={19} />, "跑团工具", is("tools"))}
    </nav>
  );
}

function Page({ route, wb }: { route: Route; wb: WorkbenchApi }) {
  switch (route.name) {
    case "home":
      return <HomePage wb={wb} />;
    case "series": {
      const s = wb.state.series.find((x) => x.id === route.id);
      return s ? (
        <SeriesView key={s.id} series={s} route={route} wb={wb} />
      ) : (
        <NotFound what="系列" />
      );
    }
    case "library":
      return <LibraryPage cat={route.cat} q={route.q} wb={wb} />;
    case "entry": {
      const e = getEntry(route.slug);
      return e ? (
        <EntryPage key={e.slug} entry={e} tab={route.tab} wb={wb} />
      ) : (
        <NotFound what="条目" />
      );
    }
    case "themes":
      return <ThemesPage q={route.q} />;
    case "theme": {
      const t = themeMap.get(route.slug);
      return t ? <ThemePage theme={t} /> : <NotFound what="主题" />;
    }
    case "drafts":
      return <DraftsPage />;
    case "tools":
      return <ToolsPage view={route.view} q={route.q} />;
  }
}

function NotFound({ what }: { what: string }) {
  return (
    <section className="wb-page wb-narrow">
      <h1>找不到这个{what}</h1>
      <p>链接可能已失效，或该内容只保存在另一个浏览器中。</p>
      <a className="wb-btn" href="#/">
        返回我的系列
      </a>
    </section>
  );
}

// ---------------- Home: my series ----------------
function HomePage({ wb }: { wb: WorkbenchApi }) {
  const list = [...wb.state.series].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return (
    <div className="wb-page">
      <header className="wb-page-head wb-home-head">
        <div>
          <h1>我的系列</h1>
          <p className="wb-lede">
            每个系列包含一个世界和多部故事。人物、地点与势力在故事之间共享，并记录每部故事中的状态。
          </p>
        </div>
        <SeriesActions wb={wb} />
      </header>
      {list.length ? (
        <div className="wb-project-list wb-series-list">
          {list.map((s) => (
            <SeriesRow key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <p className="wb-empty">还没有系列。点“新建系列”开始。</p>
      )}
      <p className="wb-save-note">{SAVE_LABEL}</p>
      <section className="wb-block wb-home-ref">
        <h2>参考资料</h2>
        <p className="wb-muted">
          D&amp;D
          第五版的职业、概念、位面与势力条目，附官方来源。可以把条目加入某个系列的“采用的设定”，再写下本系列自己的版本。
          <a href="#/library">打开资料条目</a>
        </p>
      </section>
    </div>
  );
}

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};

// ---------------- Cards ----------------
export function EntryCard({ entry, note }: { entry: Entry; note?: string }) {
  return (
    <a
      className={`wb-card ${entry.image ? "" : "wb-card-text"}`}
      href={href({ name: "entry", slug: entry.slug, tab: "body" })}
    >
      {entry.image && (
        <Art
          src={entry.image.src}
          focus={entry.image.focus}
          alt={entry.image.alt}
          className="wb-card-art"
        />
      )}
      <span className="wb-card-body">
        <span className="wb-card-kicker">
          {categoryNames[entry.category]}
          {entry.depth === "catalog" && " · 简要"}
        </span>
        <span className="wb-card-title">
          {entry.zh} <span className="wb-en">{entry.en}</span>
        </span>
        <span className="wb-card-summary">{note ?? entry.summary}</span>
      </span>
    </a>
  );
}

// ---------------- Library ----------------
function LibraryPage({
  cat,
  q,
  wb,
}: {
  cat: string;
  q: string;
  wb: WorkbenchApi;
}) {
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  const fav = cat === "fav";
  const results = useMemo(
    () =>
      fav
        ? (wb.state.favorites.map(getEntry).filter(Boolean) as Entry[])
        : searchEntries(q, cat || undefined),
    [q, cat, fav, wb.state.favorites],
  );
  const themeHits = useMemo(() => (fav ? [] : searchThemes(q)), [q, fav]);
  const update = (next: { cat?: string; q?: string }, replace = true) =>
    navigate(href({ name: "library", cat: next.cat ?? cat, q: next.q ?? q }), {
      replace,
    });
  const deep = results.filter((e) => e.depth === "deep");
  const brief = results.filter((e) => e.depth === "catalog");
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>资料条目</h1>
        <p className="wb-lede">
          创作时参考的 D&amp;D
          第五版设定：职业、概念、生物、位面与势力。每个条目附官方来源。
        </p>
      </header>
      <div className="wb-search" role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={text}
          aria-label="搜索资料"
          placeholder="搜索名称、英文名或标签"
          onChange={(e) => {
            setText(e.target.value);
            update({ q: e.target.value, cat: fav ? "" : cat });
          }}
        />
        {text && (
          <button
            className="wb-icon-btn"
            aria-label="清除搜索"
            onClick={() => (setText(""), update({ q: "" }))}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="wb-chips" role="group" aria-label="分类">
        <button
          className={`wb-chip ${!cat ? "active" : ""}`}
          aria-pressed={!cat}
          onClick={() => update({ cat: "" }, false)}
        >
          全部
        </button>
        {categoryOrder.map((c) => (
          <button
            key={c}
            className={`wb-chip ${cat === c ? "active" : ""}`}
            aria-pressed={cat === c}
            onClick={() => update({ cat: c }, false)}
          >
            {categoryNames[c]}
          </button>
        ))}
        <button
          className={`wb-chip ${fav ? "active" : ""}`}
          aria-pressed={fav}
          onClick={() => update({ cat: "fav", q: "" }, false)}
        >
          <Bookmark size={14} aria-hidden="true" /> 收藏
        </button>
        <a
          className="wb-chip wb-chip-link"
          href={href({ name: "tools", view: "spells", q: "" })}
        >
          法术目录（SRD）
        </a>
        <a
          className="wb-chip wb-chip-link"
          href={href({ name: "tools", view: "items", q: "" })}
        >
          物品目录（SRD）
        </a>
      </div>
      <p className="wb-result-count" aria-live="polite">
        {results.length} 个条目{q && `，搜索“${q}”`}
      </p>
      {themeHits.length > 0 && (
        <section className="wb-block wb-theme-hits">
          <h2>主题索引中的匹配</h2>
          {themeHits.map(({ theme, scenario }) => (
            <a
              key={theme.slug + scenario.title}
              className="wb-scenario-link"
              href={href({ name: "theme", slug: theme.slug })}
            >
              <strong>{scenario.title}</strong>
              <span className="wb-muted">{theme.zh}</span>
            </a>
          ))}
        </section>
      )}
      {deep.length > 0 && (
        <div className="wb-grid">
          {deep.map((e) => (
            <EntryCard key={e.slug} entry={e} />
          ))}
        </div>
      )}
      {brief.length > 0 && (
        <section className="wb-block">
          <h2>简要条目</h2>
          <p className="wb-muted">SRD 收录的其他职业与种族，只有简要整理。</p>
          <div className="wb-grid wb-grid-compact">
            {brief.map((e) => (
              <EntryCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}
      <p className="wb-muted wb-small">
        少数说法目前找不到可公开查阅的一手出处，没有写进正文，集中列在
        <a href="#/drafts">核实草稿</a>中。
      </p>
      {results.length === 0 &&
        (fav ? (
          <p className="wb-empty">
            还没有收藏。条目页的“收藏”按钮会把条目加入这里。
          </p>
        ) : (
          <p className="wb-empty">
            没有匹配的条目。法术与物品可在{" "}
            <a href={href({ name: "tools", view: "spells", q })}>
              SRD 法术目录
            </a>{" "}
            或 <a href={href({ name: "tools", view: "items", q })}>物品目录</a>{" "}
            中搜索。
          </p>
        ))}
    </div>
  );
}

// ---------------- Entry ----------------
/** Assign footnote numbers to every distinct citation, in reading order. */
function useFootnotes(entry: Entry) {
  return useMemo(() => {
    const list: [string, string][] = [];
    const num = (c: [string, string]) => {
      let i = list.findIndex(([a, b]) => a === c[0] && b === c[1]);
      if (i < 0) i = list.push(c) - 1;
      return i + 1;
    };
    const sections = entry.sections.map((s) => ({
      title: s.title,
      facts: s.blocks
        .filter((b) => b.p === "source")
        .map((b) => ({ b, n: (b.cite ?? []).map(num) })),
      notes: s.blocks
        .filter((b) => b.p === "editorial")
        .map((b) => ({ b, n: (b.cite ?? []).map(num) })),
    }));
    return { sections, list };
  }, [entry]);
}

function FnRefs({ n }: { n: number[] }) {
  if (!n.length) return null;
  return (
    <sup className="wb-fn-refs">
      {n.map((i) => (
        <button
          key={i}
          className="wb-fn-ref"
          aria-label={`出处 ${i}`}
          onClick={() =>
            document
              .getElementById(`fn-${i}`)
              ?.scrollIntoView({ block: "center", behavior: "smooth" })
          }
        >
          [{i}]
        </button>
      ))}
    </sup>
  );
}

function SourceLine({ id, loc }: { id: string; loc: string }) {
  const s = sources[id];
  if (!s) return <span>{id}</span>;
  return (
    <>
      {s.url ? (
        <a href={s.url} target="_blank" rel="noreferrer">
          {s.title}
        </a>
      ) : (
        <strong>{s.title}</strong>
      )}
      {loc && `，${loc}`}
    </>
  );
}

function EntryPage({
  entry,
  tab,
  wb,
}: {
  entry: Entry;
  tab: string;
  wb: WorkbenchApi;
}) {
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ text: string; to: string } | null>(null);
  const fn = useFootnotes(entry);
  const classRow =
    entry.category === "class"
      ? (classes as unknown as { index: string; hit_die: number }[]).find(
          (c) => c.index === entry.slug,
        )
      : undefined;
  const rules = entry.rules
    ? {
        ...entry.rules,
        items:
          classRow && !entry.rules.items.some(([k]) => k === "生命骰")
            ? [
                ["生命骰", `d${classRow.hit_die}`] as [string, string],
                ...entry.rules.items,
              ]
            : entry.rules.items,
      }
    : undefined;
  const tabs: [string, string][] = [
    ["body", "正文"],
    ...(rules ? [["rules", "规则与数值"] as [string, string]] : []),
    ["sources", "来源"],
  ];
  const active = tabs.some(([t]) => t === tab) ? tab : "body";
  const inSeries = wb.state.series.filter((s) =>
    s.adoptions.some((a) => a.entrySlug === entry.slug),
  );
  const related = entry.related.map(getEntry).filter(Boolean) as Entry[];
  const isFav = wb.state.favorites.includes(entry.slug);
  return (
    <article className="wb-page wb-entry">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/library">资料条目</a> /{" "}
        <a href={href({ name: "library", cat: entry.category, q: "" })}>
          {categoryNames[entry.category]}
        </a>
      </nav>
      <header className={`wb-entry-head ${entry.image ? "has-art" : ""}`}>
        {entry.image && (
          <Art
            src={entry.image.src}
            focus={entry.image.focus}
            alt={entry.image.alt}
            className="wb-entry-art"
          />
        )}
        <div className="wb-entry-title">
          <p className="wb-kicker">{categoryNames[entry.category]}</p>
          <h1>
            {entry.zh} <span className="wb-en">{entry.en}</span>
          </h1>
          <p className="wb-lede">{entry.summary}</p>
          <dl className="wb-meta">
            <div>
              <dt>版本</dt>
              <dd>{entry.edition}</dd>
            </div>
            <div>
              <dt>世界观</dt>
              <dd>{entry.setting}</dd>
            </div>
          </dl>
          <div className="wb-actions">
            <button
              className="wb-btn wb-btn-primary"
              onClick={() => setAdding(true)}
            >
              <Plus size={16} aria-hidden="true" /> 加入系列设定
            </button>
            <button
              className="wb-btn"
              aria-pressed={isFav}
              onClick={() =>
                wb.setState((s) => ({
                  ...s,
                  favorites: isFav
                    ? s.favorites.filter((f) => f !== entry.slug)
                    : [...s.favorites, entry.slug],
                }))
              }
            >
              <Bookmark size={16} aria-hidden="true" />{" "}
              {isFav ? "已收藏" : "收藏"}
            </button>
          </div>
          {inSeries.length > 0 && (
            <p className="wb-muted">
              已加入：
              {inSeries.map((s, i) => {
                const a = s.adoptions.find((x) => x.entrySlug === entry.slug)!;
                return (
                  <span key={s.id}>
                    {i > 0 && "、"}
                    <a href={href(seriesRoute(s.id, "adoptions", entry.slug))}>
                      {s.name}
                    </a>
                    （{decisionNames[a.decision]}）
                  </span>
                );
              })}
            </p>
          )}
          {toast && (
            <p className="wb-toast" role="status">
              {toast.text} <a href={toast.to}>打开采用的设定</a>
            </p>
          )}
        </div>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="条目内容">
        {tabs.map(([t, label]) => (
          <a
            key={t}
            role="tab"
            aria-selected={active === t}
            className={`wb-tab ${active === t ? "active" : ""}`}
            href={href({ name: "entry", slug: entry.slug, tab: t })}
            onClick={(e) => (
              e.preventDefault(),
              navigate(href({ name: "entry", slug: entry.slug, tab: t }), {
                replace: true,
              })
            )}
          >
            {label}
          </a>
        ))}
      </div>
      <div className="wb-entry-layout">
        <div className="wb-reading" role="tabpanel" data-testid="reading">
          {active === "body" && (
            <>
              {fn.sections.length ? (
                fn.sections.map((s) => (
                  <section key={s.title} className="wb-section">
                    <h2>{s.title}</h2>
                    {s.facts.map(({ b, n }, i) => (
                      <p key={i}>
                        {b.text}
                        <FnRefs n={n} />
                      </p>
                    ))}
                    {s.notes.length > 0 && (
                      <aside className="wb-interp" aria-label="解读">
                        <span className="wb-interp-label">解读</span>
                        {s.notes.map(({ b, n }, i) => (
                          <p key={i}>
                            {b.text}
                            <FnRefs n={n} />
                          </p>
                        ))}
                      </aside>
                    )}
                  </section>
                ))
              ) : (
                <p className="wb-muted">本条目暂无正文，可查看来源页。</p>
              )}
              {fn.list.length > 0 && (
                <section className="wb-footnotes" aria-label="出处">
                  <h2>出处</h2>
                  <ol>
                    {fn.list.map(([id, loc], i) => (
                      <li key={id + loc} id={`fn-${i + 1}`}>
                        <SourceLine id={id} loc={loc} />
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
          {active === "rules" && rules && (
            <section className="wb-section">
              <h2>规则与数值</h2>
              <p className="wb-muted">2014 版规则（SRD 5.1）摘要，仅供查阅。</p>
              <dl className="wb-rules">
                {rules.items.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="wb-muted">
                出处：
                {rules.cite.map(([id, loc], i) => (
                  <span key={id + loc}>
                    {i > 0 && "；"}
                    <SourceLine id={id} loc={loc} />
                  </span>
                ))}
              </p>
              {entry.category === "class" && (
                <p>
                  <a href="#/tools">在跑团工具中建立角色卡</a>
                </p>
              )}
            </section>
          )}
          {active === "sources" && (
            <section className="wb-section">
              <h2>来源</h2>
              <ul className="wb-source-list">
                {entry.sources.map(([id, loc]) => {
                  const s = sources[id];
                  if (!s) return null;
                  return (
                    <li key={id + loc}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title}
                        </a>
                      ) : (
                        <strong>{s.title}</strong>
                      )}
                      <span className="wb-muted">
                        {" "}
                        · {s.edition}
                        {loc && ` · ${loc}`}
                      </span>
                      <p className="wb-muted">
                        使用方式：{licenseLabel[s.license]}。{s.note}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="wb-muted">
                正文是依据上列来源写成的中文摘要，不是原文翻译。“解读”框中是本站的整理与归纳。
              </p>
            </section>
          )}
        </div>
        <aside className="wb-side">
          {related.length > 0 && (
            <section>
              <h2>相关条目</h2>
              <ul className="wb-link-list">
                {related.map((r) => (
                  <li key={r.slug}>
                    <a
                      href={href({ name: "entry", slug: r.slug, tab: "body" })}
                    >
                      {r.zh} <span className="wb-en">{r.en}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {entry.themes.length > 0 && (
            <section>
              <h2>所属主题</h2>
              <ul className="wb-link-list">
                {entry.themes.map((t) => (
                  <li key={t}>
                    <a href={href({ name: "theme", slug: t })}>
                      {themeMap.get(t)?.zh}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {entry.tags.length > 0 && (
            <section>
              <h2>标签</h2>
              <p className="wb-tags">
                {entry.tags.map((t) => (
                  <a
                    key={t}
                    className="wb-tag"
                    href={href({ name: "library", cat: "", q: t })}
                  >
                    {t}
                  </a>
                ))}
              </p>
            </section>
          )}
        </aside>
      </div>
      {adding && (
        <AddToSeries
          entry={entry}
          wb={wb}
          onClose={() => setAdding(false)}
          onDone={(s) => {
            setAdding(false);
            setToast({
              text: `已加入“${s.name}”的采用的设定。`,
              to: href(seriesRoute(s.id, "adoptions", entry.slug)),
            });
          }}
        />
      )}
    </article>
  );
}

function AddToSeries({
  entry,
  wb,
  onClose,
  onDone,
}: {
  entry: Entry;
  wb: WorkbenchApi;
  onClose: () => void;
  onDone: (s: Series) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState(wb.state.series[0]?.id ?? "");
  useEffect(() => ref.current?.showModal(), []);
  return (
    <dialog
      ref={ref}
      className="wb-modal"
      aria-labelledby="add-title"
      onClose={onClose}
    >
      <h2 id="add-title">加入系列设定</h2>
      <p className="wb-muted">
        “{entry.zh}
        ”会加入系列的“采用的设定”，决定默认为“未决定”。参考条目本身不会改变。
      </p>
      {wb.state.series.length === 0 ? (
        <p>还没有系列，请先在“我的系列”中新建。</p>
      ) : (
        <fieldset className="wb-radio-list">
          <legend>选择系列</legend>
          {wb.state.series.map((s) => (
            <label key={s.id}>
              <input
                type="radio"
                name="series"
                value={s.id}
                checked={choice === s.id}
                onChange={() => setChoice(s.id)}
              />
              {s.name}
              {s.adoptions.some((a) => a.entrySlug === entry.slug) && (
                <span className="wb-muted">（已加入）</span>
              )}
            </label>
          ))}
        </fieldset>
      )}
      <div className="wb-modal-actions">
        <button className="wb-btn" onClick={() => ref.current?.close()}>
          取消
        </button>
        <button
          className="wb-btn wb-btn-primary"
          disabled={!choice}
          onClick={() => {
            const s = wb.state.series.find((x) => x.id === choice);
            if (!s) return;
            wb.updateSeries(s.id, (x) => addAdoption(x, entry.slug));
            onDone(s);
          }}
        >
          确认加入
        </button>
      </div>
    </dialog>
  );
}

// ---------------- Drafts (author-facing) ----------------
function DraftsPage() {
  const withDrafts = entries.filter((e) => e.drafts?.length);
  const total = withDrafts.reduce((n, e) => n + (e.drafts?.length ?? 0), 0);
  return (
    <div className="wb-page">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/library">资料条目</a> / 核实草稿
      </nav>
      <header className="wb-page-head">
        <h1>核实草稿</h1>
        <p className="wb-lede">
          以下 {total}{" "}
          条说法目前找不到可以公开查阅的一手出处，因此没有写进条目正文。每条列出已找到的线索、缺少的资料和原因。
        </p>
      </header>
      {withDrafts.map((e) => (
        <section key={e.slug} className="wb-section wb-draft-group">
          <h2>
            <a href={href({ name: "entry", slug: e.slug, tab: "body" })}>
              {e.zh}
            </a>{" "}
            <span className="wb-en">{e.en}</span>
          </h2>
          {e.drafts!.map((d, i) => (
            <article key={i} className="wb-draft" data-testid="draft">
              <h3>{d.claim}</h3>
              <dl className="wb-profile">
                {d.located.length > 0 && (
                  <div>
                    <dt>已找到的线索</dt>
                    <dd>
                      {d.located.map(([id, loc], j) => (
                        <span key={id + loc}>
                          {j > 0 && "；"}
                          <SourceLine id={id} loc={loc} />
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>缺少的资料</dt>
                  <dd>{d.missing}</dd>
                </div>
                <div>
                  <dt>原因</dt>
                  <dd>{d.blocker}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

// ---------------- Themes ----------------
function ThemesPage({ q }: { q: string }) {
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  const hits = useMemo(() => searchThemes(q), [q]);
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>主题索引</h1>
        <p className="wb-lede">
          按叙事主题组织的编辑索引，连接相关设定条目。主题说明属于编辑解读，事实内容以各条目及其来源为准。
        </p>
      </header>
      <div className="wb-search" role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={text}
          aria-label="按情境检索主题"
          placeholder="按情境检索，例如：秘密、交易、复活"
          onChange={(e) => {
            setText(e.target.value);
            navigate(href({ name: "themes", q: e.target.value }), {
              replace: true,
            });
          }}
        />
      </div>
      {q && (
        <section className="wb-block">
          <h2>匹配的情境</h2>
          {hits.length ? (
            hits.map(({ theme, scenario }) => (
              <Scenario
                key={theme.slug + scenario.title}
                s={scenario}
                theme={theme}
              />
            ))
          ) : (
            <p className="wb-muted">
              没有匹配的情境。检索使用人工标注的标签，不使用在线 AI。
            </p>
          )}
        </section>
      )}
      <div className="wb-theme-grid">
        {themes.map((t) => (
          <a
            key={t.slug}
            className="wb-theme-tile"
            href={href({ name: "theme", slug: t.slug })}
          >
            <Art
              src={t.image.src}
              focus={t.image.focus}
              alt={t.image.alt}
              className="wb-theme-tile-art"
            />
            <span className="wb-theme-tile-body">
              <strong>
                {t.zh} <span className="wb-en">{t.en}</span>
              </strong>
              <span>{t.intro}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Scenario({
  s,
  theme,
}: {
  s: Theme["scenarios"][number];
  theme?: Theme;
}) {
  return (
    <div className="wb-scenario">
      <h3>
        {s.title}
        {theme && (
          <a
            className="wb-muted wb-scenario-theme"
            href={href({ name: "theme", slug: theme.slug })}
          >
            {theme.zh}
          </a>
        )}
      </h3>
      <p>{s.note}</p>
      <p className="wb-tags">
        {s.entries.map((slug) => {
          const e = getEntry(slug);
          return e ? (
            <a
              key={slug}
              className="wb-tag wb-tag-entry"
              href={href({ name: "entry", slug, tab: "body" })}
            >
              {e.zh}
            </a>
          ) : null;
        })}
      </p>
    </div>
  );
}

function ThemePage({ theme }: { theme: Theme }) {
  return (
    <article className="wb-page wb-entry">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/themes">主题索引</a> / {theme.zh}
      </nav>
      <header className="wb-theme-hero">
        <Art
          src={theme.image.src}
          focus={theme.image.focus}
          alt={theme.image.alt}
          className="wb-theme-hero-art"
        />
      </header>
      <div className="wb-entry-layout">
        <div className="wb-reading">
          <p className="wb-kicker">主题</p>
          <h1>
            {theme.zh} <span className="wb-en">{theme.en}</span>
          </h1>
          <p className="wb-lede">{theme.intro}</p>
          <section className="wb-section">
            <h2>适用条件</h2>
            <ul className="wb-list">
              {theme.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
          <section className="wb-section">
            <h2>情境索引</h2>
            {theme.scenarios.map((s) => (
              <Scenario key={s.title} s={s} />
            ))}
          </section>
          <section className="wb-section">
            <h2>相关条目</h2>
            <div className="wb-grid wb-grid-2">
              {theme.entries.map(({ slug, why }) => {
                const e = getEntry(slug);
                return e ? <EntryCard key={slug} entry={e} note={why} /> : null;
              })}
            </div>
          </section>
        </div>
        <aside className="wb-side">
          <section>
            <h2>相邻主题</h2>
            <ul className="wb-link-list">
              {theme.adjacent.map((t) => (
                <li key={t}>
                  <a href={href({ name: "theme", slug: t })}>
                    {themeMap.get(t)?.zh}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}

// ---------------- Tools (secondary) ----------------
function ToolsPage({
  view,
  q,
}: {
  view: "sheet" | "spells" | "items";
  q: string;
}) {
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>跑团工具</h1>
        <p className="wb-lede">
          角色卡、法术目录与物品目录（2014 版规则，SRD
          5.1）。角色卡沿用原有的本地存档（wayfarer-5e-v1），与系列创作分开保存，未同步到
          GitHub。
        </p>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="工具">
        {(
          [
            ["sheet", "角色卡"],
            ["spells", "法术目录"],
            ["items", "物品目录"],
          ] as const
        ).map(([v, label]) => (
          <a
            key={v}
            role="tab"
            aria-selected={view === v}
            className={`wb-tab ${view === v ? "active" : ""}`}
            href={href({ name: "tools", view: v, q: "" })}
          >
            {label}
          </a>
        ))}
      </div>
      <div
        className={`legacy-tools ${view !== "sheet" ? "g-catalog-embed" : ""}`}
      >
        <Suspense fallback={<p className="wb-muted">正在载入工具…</p>}>
          <App
            key={`${view}-${q}`}
            initialView={view}
            initialQuery={q}
            onNavigate={(v) =>
              navigate(
                href({
                  name: "tools",
                  view:
                    v === "spells"
                      ? "spells"
                      : v === "items"
                        ? "items"
                        : "sheet",
                  q: "",
                }),
              )
            }
          />
        </Suspense>
      </div>
    </div>
  );
}

export function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
