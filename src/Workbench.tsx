import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Dices,
  FolderOpen,
  Home,
  Library,
  Menu,
  Search,
  X,
} from "lucide-react";
import { categoryNames, categoryOrder, entries, getEntry, searchEntries } from "./wb/entries";
import { searchThemes, themeMap, themes } from "./wb/themes";
import { sources, kindLabel } from "./wb/sources";
import type { Block, Entry, Theme } from "./wb/types";
import { href, navigate, useRoute, type Route } from "./wb/router";
import { useWorkbench, type WorkbenchApi } from "./wb/store";
import { addAdaptation, now, SAVE_LABEL, uid, type Project } from "./wb/project";
import { ProjectsPage, ProjectView } from "./wb/ProjectView";
import classes from "./data/Classes.json";

const App = lazy(() => import("./App"));

const BASE = import.meta.env.BASE_URL;
export const asset = (p: string) => `${BASE}${p}`;

export function Art({ src, focus, alt, className = "" }: { src: string; focus: string; alt: string; className?: string }) {
  return <img className={`wb-art ${className}`} src={asset(src)} alt={alt} style={{ objectPosition: focus }} loading="lazy" decoding="async" />;
}

const featured = ["warlock", "pact", "true-name", "paladin", "devils", "lich", "zhentarim", "shadowfell"];

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
  const [collapsed, setCollapsed] = useState(() => readPref("wb-sidebar-collapsed", false));
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
    document.title = pageTitle(route, wb.state.projects) + " · D&D 设定资料库";
  }, [route, wb.state.projects]);

  return (
    <div className={`wb ${collapsed ? "wb-collapsed" : ""}`}>
      <aside className="wb-sidebar" aria-label="主导航">
        <div className="wb-brand">
          <BookOpen size={22} aria-hidden="true" />
          <span className="wb-brand-text">D&amp;D 设定资料库</span>
        </div>
        <Nav route={route} />
        <button className="wb-collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "展开侧栏" : "收起侧栏"} title={collapsed ? "展开侧栏" : "收起侧栏"}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span className="wb-nav-label">收起侧栏</span>
        </button>
      </aside>
      <header className="wb-topbar">
        <button className="wb-icon-btn" aria-label="打开菜单" onClick={() => drawer.current?.showModal()}>
          <Menu size={22} />
        </button>
        <a className="wb-topbar-title" href="#/">
          D&amp;D 设定资料库
        </a>
      </header>
      <dialog ref={drawer} className="wb-drawer" aria-label="菜单" onClick={(e) => e.target === drawer.current && drawer.current?.close()}>
        <div className="wb-drawer-inner">
          <div className="wb-drawer-head">
            <span>菜单</span>
            <button className="wb-icon-btn" aria-label="关闭菜单" onClick={() => drawer.current?.close()}>
              <X size={20} />
            </button>
          </div>
          <Nav route={route} />
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
                  onClick={() => {
                    const raw = localStorage.getItem("dnd-workbench-v1") ?? "";
                    download("dnd-workbench-raw-backup.json", raw, "application/json");
                  }}
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
        <Page route={route} wb={wb} />
        <footer className="wb-footer">
          <p>
            规则内容来自 <a href={sources.srd51.url}>SRD 5.1</a>（CC-BY-4.0，Wizards of the Coast）；派系与设定内容为原创中文摘要，附官方来源链接。插图为本站生成的原创数字绘画。
            <a href={asset("attribution.html")}>署名与许可</a>
          </p>
          <p>本站与 Wizards of the Coast 无关联。项目与收藏{SAVE_LABEL}。</p>
        </footer>
      </main>
    </div>
  );
}

function pageTitle(r: Route, projects: Project[]) {
  switch (r.name) {
    case "home":
      return "首页";
    case "browse":
      return r.cat ? categoryNames[r.cat as keyof typeof categoryNames] ?? "浏览资料" : "浏览资料";
    case "entry":
      return getEntry(r.slug)?.zh ?? "条目";
    case "themes":
      return "主题索引";
    case "theme":
      return themeMap.get(r.slug)?.zh ?? "主题";
    case "projects":
      return "我的项目";
    case "project":
      return projects.find((p) => p.id === r.id)?.name ?? "项目";
    case "favorites":
      return "收藏";
    case "tools":
      return "跑团工具";
  }
}

function Nav({ route }: { route: Route }) {
  const is = (...names: Route["name"][]) => names.includes(route.name);
  const item = (to: string, icon: ReactNode, label: string, active: boolean) => (
    <a href={to} className={`wb-nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} title={label}>
      {icon}
      <span className="wb-nav-label">{label}</span>
    </a>
  );
  return (
    <nav className="wb-nav">
      {item("#/", <Home size={19} />, "首页", is("home"))}
      {item("#/browse", <Library size={19} />, "浏览资料", is("browse", "entry"))}
      {item("#/themes", <Compass size={19} />, "主题索引", is("themes", "theme"))}
      {item("#/projects", <FolderOpen size={19} />, "我的项目", is("projects", "project"))}
      {item("#/favorites", <Bookmark size={19} />, "收藏", is("favorites"))}
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
    case "browse":
      return <BrowsePage cat={route.cat} q={route.q} />;
    case "entry": {
      const e = getEntry(route.slug);
      return e ? <EntryPage key={e.slug} entry={e} tab={route.tab} wb={wb} /> : <NotFound what="条目" />;
    }
    case "themes":
      return <ThemesPage q={route.q} />;
    case "theme": {
      const t = themeMap.get(route.slug);
      return t ? <ThemePage theme={t} /> : <NotFound what="主题" />;
    }
    case "projects":
      return <ProjectsPage wb={wb} />;
    case "project": {
      const p = wb.state.projects.find((x) => x.id === route.id);
      return p ? <ProjectView key={p.id} project={p} tab={route.tab} item={route.item} wb={wb} /> : <NotFound what="项目" />;
    }
    case "favorites":
      return <FavoritesPage wb={wb} />;
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
        返回首页
      </a>
    </section>
  );
}

// ---------------- Home ----------------
function HomePage({ wb }: { wb: WorkbenchApi }) {
  const recent = [...wb.state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  return (
    <div className="wb-page">
      <section className="wb-hero">
        <Art src="art/banner-archive.webp" focus="70% 40%" alt="黄昏时分的奥术档案馆，档案员站在梯子上取下一本旧书" className="wb-hero-art" />
        <div className="wb-hero-text">
          <h1>D&amp;D 设定资料库</h1>
          <p>D&amp;D 第五版的职业、契约、信仰、位面与势力资料，按来源标注；可收藏到创作项目，记录角色、关系与情节。</p>
          <form
            className="wb-search wb-hero-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString() ?? "";
              navigate(href({ name: "browse", cat: "", q }));
            }}
          >
            <Search size={18} aria-hidden="true" />
            <input name="q" placeholder="搜索设定，例如：契约、魔鬼、誓言" aria-label="搜索设定" />
            <button className="wb-btn wb-btn-primary">搜索</button>
          </form>
        </div>
      </section>

      <section className="wb-block">
        <div className="wb-block-head">
          <h2>主题索引</h2>
          <a href="#/themes">全部主题</a>
        </div>
        <div className="wb-theme-strip">
          {themes.map((t) => (
            <ThemeCard key={t.slug} theme={t} />
          ))}
        </div>
      </section>

      <section className="wb-block">
        <div className="wb-block-head">
          <h2>精选条目</h2>
          <a href="#/browse">浏览全部资料</a>
        </div>
        <div className="wb-grid">
          {featured.map((s) => {
            const e = getEntry(s);
            return e ? <EntryCard key={s} entry={e} /> : null;
          })}
        </div>
      </section>

      <section className="wb-block">
        <div className="wb-block-head">
          <h2>最近编辑的项目</h2>
          <a href="#/projects">我的项目</a>
        </div>
        {recent.length ? (
          <div className="wb-project-list">
            {recent.map((p) => (
              <ProjectRow key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <p className="wb-muted">还没有项目。</p>
        )}
        <p className="wb-save-note">{SAVE_LABEL}</p>
      </section>
    </div>
  );
}

export function ProjectRow({ p }: { p: Project }) {
  return (
    <a className="wb-project-row" href={href({ name: "project", id: p.id, tab: "overview", item: "" })}>
      {p.image ? <Art src={p.image} focus="50% 60%" alt="" className="wb-project-thumb" /> : <span className="wb-project-thumb wb-thumb-empty" aria-hidden="true" />}
      <span className="wb-project-meta">
        <strong>{p.name}</strong>
        {p.example && <span className="wb-badge wb-badge-original">原创示例</span>}
        <span className="wb-muted">
          {p.characters.length} 个角色 · {p.relationships.length} 条关系 · {p.plots.length} 条情节 · 更新于 {fmtDate(p.updatedAt)}
        </span>
      </span>
    </a>
  );
}

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

// ---------------- Cards ----------------
export function EntryCard({ entry, note }: { entry: Entry; note?: string }) {
  return (
    <a className={`wb-card ${entry.image ? "" : "wb-card-text"}`} href={href({ name: "entry", slug: entry.slug, tab: "body" })}>
      {entry.image && <Art src={entry.image.src} focus={entry.image.focus} alt={entry.image.alt} className="wb-card-art" />}
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

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <a className="wb-theme-card" href={href({ name: "theme", slug: theme.slug })}>
      <Art src={theme.image.src} focus={theme.image.focus} alt={theme.image.alt} className="wb-theme-art" />
      <span className="wb-theme-label">
        <strong>{theme.zh}</strong>
        <span>{theme.en}</span>
      </span>
    </a>
  );
}

// ---------------- Browse ----------------
function BrowsePage({ cat, q }: { cat: string; q: string }) {
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  const results = useMemo(() => searchEntries(q, cat || undefined), [q, cat]);
  const themeHits = useMemo(() => searchThemes(q), [q]);
  const update = (next: { cat?: string; q?: string }, replace = true) =>
    navigate(href({ name: "browse", cat: next.cat ?? cat, q: next.q ?? q }), { replace });
  const deep = results.filter((e) => e.depth === "deep");
  const brief = results.filter((e) => e.depth === "catalog");
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>浏览资料</h1>
        <p className="wb-lede">职业、概念、生物、位面与势力的设定条目。每段内容标明来源类型：设定摘要、编辑解读或待核实。</p>
      </header>
      <div className="wb-search" role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={text}
          aria-label="搜索资料"
          placeholder="搜索名称、英文名或标签"
          onChange={(e) => {
            setText(e.target.value);
            update({ q: e.target.value });
          }}
        />
        {text && (
          <button className="wb-icon-btn" aria-label="清除搜索" onClick={() => (setText(""), update({ q: "" }))}>
            <X size={16} />
          </button>
        )}
      </div>
      <div className="wb-chips" role="group" aria-label="分类">
        <button className={`wb-chip ${!cat ? "active" : ""}`} aria-pressed={!cat} onClick={() => update({ cat: "" }, false)}>
          全部
        </button>
        {categoryOrder.map((c) => (
          <button key={c} className={`wb-chip ${cat === c ? "active" : ""}`} aria-pressed={cat === c} onClick={() => update({ cat: c }, false)}>
            {categoryNames[c]}
          </button>
        ))}
        <a className="wb-chip wb-chip-link" href={href({ name: "tools", view: "spells", q: "" })}>
          法术目录（SRD）
        </a>
        <a className="wb-chip wb-chip-link" href={href({ name: "tools", view: "items", q: "" })}>
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
            <a key={theme.slug + scenario.title} className="wb-scenario-link" href={href({ name: "theme", slug: theme.slug })}>
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
          <p className="wb-muted">SRD 收录、目前只有简要整理的职业与种族。</p>
          <div className="wb-grid wb-grid-compact">
            {brief.map((e) => (
              <EntryCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}
      {results.length === 0 && (
        <p className="wb-empty">
          没有匹配的条目。法术与物品可在 <a href={href({ name: "tools", view: "spells", q })}>SRD 法术目录</a> 或 <a href={href({ name: "tools", view: "items", q })}>物品目录</a> 中搜索。
        </p>
      )}
    </div>
  );
}

// ---------------- Entry ----------------
const provLabel: Record<Block["p"], string> = { source: "设定摘要", editorial: "编辑解读", unverified: "待核实" };

function Cite({ cite }: { cite: [string, string][] }) {
  return (
    <span className="wb-cite">
      {cite.map(([id, loc]) => {
        const s = sources[id];
        const label = `${s?.title.split("（")[0] ?? id}${loc ? ` · ${loc}` : ""}`;
        return s?.url ? (
          <a key={id + loc} href={s.url} target="_blank" rel="noreferrer">
            {label}
          </a>
        ) : (
          <span key={id + loc}>{label}</span>
        );
      })}
    </span>
  );
}

export function BlockView({ b }: { b: Block }) {
  return (
    <div className={`wb-prov wb-prov-${b.p}`}>
      <span className="wb-prov-label">{provLabel[b.p]}</span>
      <p>{b.text}</p>
      {b.cite && b.cite.length > 0 && <Cite cite={b.cite} />}
    </div>
  );
}

function EntryPage({ entry, tab, wb }: { entry: Entry; tab: string; wb: WorkbenchApi }) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; to: string } | null>(null);
  const classRow = entry.category === "class" ? (classes as unknown as { index: string; hit_die: number }[]).find((c) => c.index === entry.slug) : undefined;
  const rules = entry.rules ? { ...entry.rules, items: classRow && !entry.rules.items.some(([k]) => k === "生命骰") ? [["生命骰", `d${classRow.hit_die}`] as [string, string], ...entry.rules.items] : entry.rules.items } : undefined;
  const tabs: [string, string][] = [["body", "正文"], ...(rules ? [["rules", "规则与数值"] as [string, string]] : []), ["sources", "来源"]];
  const active = tabs.some(([t]) => t === tab) ? tab : "body";
  const inProjects = wb.state.projects.filter((p) => p.adaptations.some((a) => a.slug === entry.slug));
  const related = entry.related.map(getEntry).filter(Boolean) as Entry[];
  return (
    <article className="wb-page wb-entry">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/browse">浏览资料</a> / <a href={href({ name: "browse", cat: entry.category, q: "" })}>{categoryNames[entry.category]}</a>
      </nav>
      <header className={`wb-entry-head ${entry.image ? "has-art" : ""}`}>
        {entry.image && <Art src={entry.image.src} focus={entry.image.focus} alt={entry.image.alt} className="wb-entry-art" />}
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
            <button className="wb-btn wb-btn-primary" onClick={() => setSaving(true)}>
              <Bookmark size={16} aria-hidden="true" /> 收藏到项目
            </button>
            {inProjects.length > 0 && <span className="wb-muted">已在：{inProjects.map((p) => p.name).join("、")}</span>}
          </div>
          {toast && (
            <p className="wb-toast" role="status">
              {toast.text} <a href={toast.to}>打开项目设定</a>
            </p>
          )}
        </div>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="条目内容">
        {tabs.map(([t, label]) => (
          <a key={t} role="tab" aria-selected={active === t} className={`wb-tab ${active === t ? "active" : ""}`} href={href({ name: "entry", slug: entry.slug, tab: t })} onClick={(e) => (e.preventDefault(), navigate(href({ name: "entry", slug: entry.slug, tab: t }), { replace: true }))}>
            {label}
          </a>
        ))}
      </div>
      <div className="wb-entry-layout">
        <div className="wb-reading" role="tabpanel">
          {active === "body" &&
            (entry.sections.length ? (
              entry.sections.map((s) => (
                <section key={s.title} className="wb-section">
                  <h2>{s.title}</h2>
                  {s.blocks.map((b, i) => (
                    <BlockView key={i} b={b} />
                  ))}
                </section>
              ))
            ) : (
              <p className="wb-muted">本条目暂无正文。</p>
            ))}
          {active === "rules" && rules && (
            <section className="wb-section">
              <h2>规则与数值</h2>
              <p className="wb-muted">以下为 2014 版规则（SRD 5.1）摘要，仅供查阅。</p>
              <dl className="wb-rules">
                {rules.items.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <Cite cite={rules.cite} />
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
                      <span className="wb-badge">{kindLabel[s.kind]}</span> {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : <strong>{s.title}</strong>}
                      <span className="wb-muted">
                        {" "}
                        · {s.edition}
                        {loc && ` · ${loc}`}
                      </span>
                      <p className="wb-muted">{s.note}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="wb-muted">说明：“设定摘要”是依据所列来源写成的中文摘要，不是原文翻译；“编辑解读”是本站整理；“待核实”表示尚未对照原始资料。</p>
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
                    <a href={href({ name: "entry", slug: r.slug, tab: "body" })}>
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
                    <a href={href({ name: "theme", slug: t })}>{themeMap.get(t)?.zh}</a>
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
                  <a key={t} className="wb-tag" href={href({ name: "browse", cat: "", q: t })}>
                    {t}
                  </a>
                ))}
              </p>
            </section>
          )}
        </aside>
      </div>
      {saving && (
        <SaveToProject
          entry={entry}
          wb={wb}
          onClose={() => setSaving(false)}
          onDone={(p) => {
            setSaving(false);
            setToast({ text: `已收藏到“${p.name}”。`, to: href({ name: "project", id: p.id, tab: "settings", item: entry.slug }) });
          }}
        />
      )}
    </article>
  );
}

function SaveToProject({ entry, wb, onClose, onDone }: { entry: Entry; wb: WorkbenchApi; onClose: () => void; onDone: (p: Project) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState(wb.state.projects[0]?.id ?? "__new");
  const [name, setName] = useState("");
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const confirm = () => {
    let target: Project | undefined;
    if (choice === "__new") {
      const t = now();
      target = { id: uid("proj"), name: name.trim() || "未命名项目", summary: "", example: false, createdAt: t, updatedAt: t, characters: [], relationships: [], plots: [], locations: [], adaptations: [] };
      const created = addAdaptation(target, entry.slug);
      wb.setState((s) => ({ ...s, projects: [...s.projects, created], favorites: Array.from(new Set([...s.favorites, entry.slug])) }));
      target = created;
    } else {
      target = wb.state.projects.find((p) => p.id === choice);
      if (!target) return;
      wb.updateProject(choice, (p) => addAdaptation(p, entry.slug));
      wb.setState((s) => ({ ...s, favorites: Array.from(new Set([...s.favorites, entry.slug])) }));
    }
    onDone(target);
  };
  return (
    <dialog ref={ref} className="wb-modal" aria-labelledby="save-title" onClose={onClose}>
      <h2 id="save-title">收藏到项目</h2>
      <p className="wb-muted">
        “{entry.zh}”将加入项目的设定改编列表。原始条目内容与来源保持不变，项目中的采用与改动另行记录。
      </p>
      <fieldset className="wb-radio-list">
        <legend>选择项目</legend>
        {wb.state.projects.map((p) => (
          <label key={p.id}>
            <input type="radio" name="proj" value={p.id} checked={choice === p.id} onChange={() => setChoice(p.id)} />
            {p.name}
            {p.adaptations.some((a) => a.slug === entry.slug) && <span className="wb-muted">（已收藏）</span>}
          </label>
        ))}
        <label>
          <input type="radio" name="proj" value="__new" checked={choice === "__new"} onChange={() => setChoice("__new")} />
          新建项目
        </label>
        {choice === "__new" && <input className="wb-input" aria-label="新项目名称" placeholder="项目名称" value={name} onChange={(e) => setName(e.target.value)} />}
      </fieldset>
      <div className="wb-modal-actions">
        <button className="wb-btn" onClick={() => ref.current?.close()}>
          取消
        </button>
        <button className="wb-btn wb-btn-primary" onClick={confirm}>
          确认收藏
        </button>
      </div>
    </dialog>
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
        <p className="wb-lede">按叙事主题组织的编辑索引，连接相关设定条目。主题说明属于编辑解读，事实内容以各条目及其来源为准。</p>
      </header>
      <div className="wb-search" role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={text}
          aria-label="按情境检索主题"
          placeholder="按情境检索，例如：秘密、交易、复活"
          onChange={(e) => {
            setText(e.target.value);
            navigate(href({ name: "themes", q: e.target.value }), { replace: true });
          }}
        />
      </div>
      {q && (
        <section className="wb-block">
          <h2>匹配的情境</h2>
          {hits.length ? (
            hits.map(({ theme, scenario }) => <Scenario key={theme.slug + scenario.title} s={scenario} theme={theme} />)
          ) : (
            <p className="wb-muted">没有匹配的情境。检索使用人工标注的标签，不使用在线 AI。</p>
          )}
        </section>
      )}
      <div className="wb-theme-grid">
        {themes.map((t) => (
          <a key={t.slug} className="wb-theme-tile" href={href({ name: "theme", slug: t.slug })}>
            <Art src={t.image.src} focus={t.image.focus} alt={t.image.alt} className="wb-theme-tile-art" />
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

function Scenario({ s, theme }: { s: Theme["scenarios"][number]; theme?: Theme }) {
  return (
    <div className="wb-scenario">
      <h3>
        {s.title}
        {theme && (
          <a className="wb-muted wb-scenario-theme" href={href({ name: "theme", slug: theme.slug })}>
            {theme.zh}
          </a>
        )}
      </h3>
      <p>{s.note}</p>
      <p className="wb-tags">
        {s.entries.map((slug) => {
          const e = getEntry(slug);
          return e ? (
            <a key={slug} className="wb-tag wb-tag-entry" href={href({ name: "entry", slug, tab: "body" })}>
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
        <Art src={theme.image.src} focus={theme.image.focus} alt={theme.image.alt} className="wb-theme-hero-art" />
      </header>
      <div className="wb-entry-layout">
        <div className="wb-reading">
          <p className="wb-kicker">主题</p>
          <h1>
            {theme.zh} <span className="wb-en">{theme.en}</span>
          </h1>
          <BlockView b={{ p: "editorial", text: theme.intro }} />
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
                  <a href={href({ name: "theme", slug: t })}>{themeMap.get(t)?.zh}</a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}

// ---------------- Favorites ----------------
function FavoritesPage({ wb }: { wb: WorkbenchApi }) {
  const favs = wb.state.favorites.map(getEntry).filter(Boolean) as Entry[];
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>收藏</h1>
        <p className="wb-lede">已收藏到项目的条目。{SAVE_LABEL}。</p>
      </header>
      {favs.length === 0 && (
        <p className="wb-empty">
          暂无收藏。条目页的“收藏到项目”会把条目加入这里。<a href="#/browse">浏览资料</a>
        </p>
      )}
      <ul className="wb-fav-list">
        {favs.map((e) => {
          const ps = wb.state.projects.filter((p) => p.adaptations.some((a) => a.slug === e.slug));
          return (
            <li key={e.slug} className="wb-fav">
              <EntryCard entry={e} />
              <div className="wb-fav-meta">
                <span className="wb-muted">所在项目：</span>
                {ps.length ? (
                  ps.map((p) => (
                    <a key={p.id} href={href({ name: "project", id: p.id, tab: "settings", item: e.slug })}>
                      {p.name}
                    </a>
                  ))
                ) : (
                  <span className="wb-muted">无</span>
                )}
                <button className="wb-btn wb-btn-small" onClick={() => wb.setState((s) => ({ ...s, favorites: s.favorites.filter((f) => f !== e.slug) }))}>
                  移出收藏
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------- Tools (secondary) ----------------
function ToolsPage({ view, q }: { view: "sheet" | "spells" | "items"; q: string }) {
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>跑团工具</h1>
        <p className="wb-lede">角色卡、法术目录与物品目录（2014 版规则，SRD 5.1）。角色卡沿用原有的本地存档（wayfarer-5e-v1），与创作项目分开保存，未同步到 GitHub。</p>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="工具">
        {(
          [
            ["sheet", "角色卡"],
            ["spells", "法术目录"],
            ["items", "物品目录"],
          ] as const
        ).map(([v, label]) => (
          <a key={v} role="tab" aria-selected={view === v} className={`wb-tab ${view === v ? "active" : ""}`} href={href({ name: "tools", view: v, q: "" })}>
            {label}
          </a>
        ))}
      </div>
      <div className={`legacy-tools ${view !== "sheet" ? "g-catalog-embed" : ""}`}>
        <Suspense fallback={<p className="wb-muted">正在载入工具…</p>}>
          <App key={`${view}-${q}`} initialView={view} initialQuery={q} onNavigate={(v) => navigate(href({ name: "tools", view: v === "spells" ? "spells" : v === "items" ? "items" : "sheet", q: "" }))} />
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

export { entries };
