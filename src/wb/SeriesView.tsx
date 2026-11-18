import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Download,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Undo2,
} from "lucide-react";
import { Art, download, fmtDate } from "../Workbench";
import { entries, getEntry } from "./entries";
import {
  href,
  navigate,
  seriesRoute,
  seriesTabs,
  type Route,
  type SeriesTab,
  type StoryMode,
} from "./router";
import type { WorkbenchApi } from "./store";
import { licenseLabel, sources } from "./sources";
import {
  addAdoption,
  appearsIn,
  applyImport,
  decisionNames,
  decisions,
  earlierEvents,
  emptySeries,
  eventsIn,
  factCategories,
  findObject,
  influencesFrom,
  influencesInto,
  kindNames,
  objectsOf,
  parseImport,
  previousStateStory,
  profileFields,
  relationTypes,
  relationsIn,
  SAVE_LABEL,
  seriesJson,
  seriesMarkdown,
  setState,
  stateChanges,
  stateFields,
  stateIn,
  storiesInOrder,
  uid,
  yearLabel,
  type Adoption,
  type ImportPreview,
  type ObjectKind,
  type SEvent,
  type Series,
  type SObject,
  type Story,
  type Visibility,
  type WbState,
} from "./series";

type SeriesRoute = Extract<Route, { name: "series" }>;
type Up = (fn: (s: Series) => Series) => void;

// ---------------------------------------------------------------- small pieces
function Paras({
  text,
  empty = "（未填写）",
}: {
  text: string;
  empty?: string;
}) {
  const ps = text.split(/\n+/).filter((p) => p.trim());
  return ps.length ? (
    <>
      {ps.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  ) : (
    <p className="wb-muted">{empty}</p>
  );
}
export function PrivateBadge({ v }: { v: Visibility }) {
  return v === "private" ? (
    <span className="wb-badge wb-badge-private">仅自己</span>
  ) : null;
}
function VisibilitySelect({
  value,
  onChange,
  label = "公开范围",
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
  label?: string;
}) {
  return (
    <label className="wb-field wb-field-inline">
      <span>{label}</span>
      <select
        className="wb-input"
        value={value}
        onChange={(e) => onChange(e.target.value as Visibility)}
      >
        <option value="public">公开</option>
        <option value="private">仅自己</option>
      </select>
    </label>
  );
}
function Field({
  label,
  value,
  onChange,
  rows = 0,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="wb-field">
      <label htmlFor={id}>{label}</label>
      {rows ? (
        <textarea
          id={id}
          className="wb-input"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="wb-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="wb-field wb-field-inline">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="wb-input wb-input-num"
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
      />
    </div>
  );
}
function EditToggle({
  editing,
  onToggle,
  label = "编辑",
}: {
  editing: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      className={`wb-btn wb-btn-small ${editing ? "wb-btn-primary" : ""}`}
      onClick={onToggle}
      aria-pressed={editing}
    >
      {editing ? (
        "完成"
      ) : (
        <>
          <Pencil size={14} aria-hidden="true" /> {label}
        </>
      )}
    </button>
  );
}
function EntryChips({ slugs }: { slugs: string[] }) {
  if (!slugs.length) return null;
  return (
    <p className="wb-tags">
      {slugs.map((slug) => {
        const e = getEntry(slug);
        return e ? (
          <a
            key={slug}
            className="wb-tag wb-tag-entry"
            href={href({ name: "entry", slug, tab: "body" })}
          >
            参考：{e.zh}
          </a>
        ) : null;
      })}
    </p>
  );
}
function EntryPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [pick, setPick] = useState("");
  const deep = entries.filter((e) => e.depth === "deep");
  return (
    <div className="wb-field">
      <span>参考条目</span>
      <p className="wb-tags">
        {value.map((slug) => (
          <span key={slug} className="wb-tag">
            {getEntry(slug)?.zh ?? slug}
            <button
              className="wb-tag-x"
              aria-label={`移除 ${getEntry(slug)?.zh ?? slug}`}
              onClick={() => onChange(value.filter((x) => x !== slug))}
            >
              ×
            </button>
          </span>
        ))}
      </p>
      <span className="wb-inline-form">
        <select
          className="wb-input"
          aria-label="选择参考条目"
          value={pick}
          onChange={(e) => setPick(e.target.value)}
        >
          <option value="">选择条目…</option>
          {deep
            .filter((e) => !value.includes(e.slug))
            .map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.zh} {e.en}
              </option>
            ))}
        </select>
        <button
          className="wb-btn wb-btn-small"
          disabled={!pick}
          onClick={() => (onChange([...value, pick]), setPick(""))}
        >
          添加条目
        </button>
      </span>
    </div>
  );
}
function storyLink(s: Series, st: Story, mode: StoryMode = "read") {
  return href(seriesRoute(s.id, "stories", st.id, { mode }));
}
function objLink(s: Series, o: SObject, story = "") {
  return href(
    seriesRoute(s.id, o.kind === "character" ? "characters" : "places", o.id, {
      story,
    }),
  );
}

// ---------------------------------------------------------------- series list (home)
export function SeriesRow({ s }: { s: Series }) {
  const list = storiesInOrder(s);
  return (
    <a className="wb-project-row" href={href(seriesRoute(s.id))}>
      {s.image ? (
        <Art
          src={s.image}
          focus="50% 55%"
          alt=""
          className="wb-project-thumb"
        />
      ) : (
        <span className="wb-project-thumb wb-thumb-empty" aria-hidden="true" />
      )}
      <span className="wb-project-meta">
        <strong>{s.name}</strong>
        {s.example && (
          <span className="wb-badge wb-badge-original">原创示例</span>
        )}
        <span className="wb-muted">
          {list.length} 部故事 · {objectsOf(s, "character").length} 个人物 ·
          更新于 {fmtDate(s.updatedAt)}
        </span>
        {list.length > 0 && (
          <span className="wb-row-stories">
            {list.map((st) => `《${st.title}》${yearLabel(s, st)}`).join(" → ")}
          </span>
        )}
      </span>
    </a>
  );
}

export function SeriesActions({ wb }: { wb: WorkbenchApi }) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<WbState | null>(null);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="wb-series-actions">
      <button
        className="wb-btn wb-btn-primary"
        onClick={() => {
          const name = prompt("系列名称", "新的系列");
          if (name === null) return;
          const s = emptySeries(name.trim());
          wb.setState((st) => ({ ...st, series: [...st.series, s] }));
          navigate(href(seriesRoute(s.id)));
        }}
      >
        <Plus size={16} aria-hidden="true" /> 新建系列
      </button>
      <button className="wb-btn" onClick={() => file.current?.click()}>
        <Upload size={16} aria-hidden="true" /> 导入 JSON
      </button>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        hidden
        data-testid="import-file"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            setPreview(parseImport(await f.text(), wb.state.series));
            setError("");
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
      {error && (
        <p className="wb-alert" role="alert">
          导入失败：{error}
        </p>
      )}
      {undo && (
        <p className="wb-toast" role="status">
          已导入。
          <button
            className="wb-btn wb-btn-small"
            onClick={() => (wb.setState(undo), setUndo(null))}
          >
            <Undo2 size={14} aria-hidden="true" /> 撤销导入
          </button>
        </p>
      )}
      {preview && (
        <ImportDialog
          preview={preview}
          onCancel={() => setPreview(null)}
          onConfirm={() => {
            setUndo(wb.state);
            wb.setState((st) => applyImport(st, preview));
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}
function ImportDialog({
  preview,
  onCancel,
  onConfirm,
}: {
  preview: ImportPreview;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  return (
    <dialog
      ref={ref}
      className="wb-modal"
      aria-labelledby="imp-title"
      onClose={onCancel}
    >
      <h2 id="imp-title">导入预览</h2>
      <p>
        <strong>{preview.series.name}</strong>（{preview.source}）
      </p>
      <ul className="wb-list">
        {Object.entries(preview.counts).map(([k, v]) => (
          <li key={k}>
            {k}：{v}
          </li>
        ))}
      </ul>
      <p className="wb-muted">
        导入的系列会追加到列表中，不会覆盖现有系列。
        {preview.collision &&
          "已有同 ID 的系列，导入后会改用新 ID，并在名称后加“（导入）”。"}
        导入后可以撤销。
      </p>
      <div className="wb-modal-actions">
        <button className="wb-btn" onClick={() => ref.current?.close()}>
          取消
        </button>
        <button className="wb-btn wb-btn-primary" onClick={onConfirm}>
          确认导入
        </button>
      </div>
    </dialog>
  );
}

// ---------------------------------------------------------------- series shell
export function SeriesView({
  series: s,
  route,
  wb,
}: {
  series: Series;
  route: SeriesRoute;
  wb: WorkbenchApi;
}) {
  const up: Up = (fn) => wb.updateSeries(s.id, fn);
  const slug =
    s.name.replace(/[\\/:*?"<>|（）()\s]+/g, "-").replace(/^-|-$/g, "") ||
    "series";
  return (
    <div className="wb-page wb-series">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/">我的系列</a> / {s.name}
      </nav>
      <header className="wb-series-head">
        <div>
          <p className="wb-kicker">
            系列{" "}
            {s.example && (
              <span className="wb-badge wb-badge-original">原创示例</span>
            )}
          </p>
          <h1>{s.name}</h1>
        </div>
        <div className="wb-series-tools">
          <button
            className="wb-btn wb-btn-small"
            onClick={() =>
              download(
                `${slug}-公开版.md`,
                seriesMarkdown(s, true),
                "text/markdown",
              )
            }
          >
            <Download size={14} aria-hidden="true" /> 导出 Markdown（公开内容）
          </button>
          <button
            className="wb-btn wb-btn-small"
            onClick={() =>
              download(
                `${slug}-完整版.md`,
                seriesMarkdown(s, false),
                "text/markdown",
              )
            }
          >
            <Download size={14} aria-hidden="true" /> 导出 Markdown（全部）
          </button>
          <button
            className="wb-btn wb-btn-small"
            onClick={() =>
              download(`${slug}.json`, seriesJson(s), "application/json")
            }
          >
            <Download size={14} aria-hidden="true" /> 导出 JSON
          </button>
          <span className="wb-save-note" data-testid="save-status">
            {SAVE_LABEL}
            {wb.savedAt && ` · ${wb.savedAt} 已保存`}
          </span>
        </div>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="系列内容">
        {seriesTabs.map(([t, label]) => (
          <a
            key={t}
            role="tab"
            aria-selected={route.tab === t}
            className={`wb-tab ${route.tab === t ? "active" : ""}`}
            href={href(seriesRoute(s.id, t))}
          >
            {label}
          </a>
        ))}
      </div>
      <div role="tabpanel">
        <SeriesTabBody s={s} route={route} up={up} wb={wb} />
      </div>
    </div>
  );
}

function SeriesTabBody({
  s,
  route,
  up,
  wb,
}: {
  s: Series;
  route: SeriesRoute;
  up: Up;
  wb: WorkbenchApi;
}) {
  const tab: SeriesTab = route.tab;
  if (tab === "characters" || tab === "places") {
    const o = route.item ? findObject(s, route.item) : undefined;
    if (route.item && !o) return <p className="wb-empty">找不到这个对象。</p>;
    return o ? (
      <ObjectPage key={o.id} s={s} o={o} storyId={route.story} up={up} />
    ) : (
      <ObjectList
        s={s}
        kinds={tab === "characters" ? ["character"] : ["place", "faction"]}
        up={up}
      />
    );
  }
  if (tab === "stories") {
    const st = route.item
      ? s.stories.find((x) => x.id === route.item)
      : undefined;
    if (route.item && !st) return <p className="wb-empty">找不到这部故事。</p>;
    return st ? (
      <StoryPage
        key={st.id}
        s={s}
        st={st}
        mode={route.mode}
        pub={route.pub}
        up={up}
      />
    ) : (
      <StoryList s={s} up={up} />
    );
  }
  if (tab === "world") return <WorldTab s={s} up={up} />;
  if (tab === "timeline") return <TimelineTab s={s} up={up} />;
  if (tab === "adoptions")
    return <AdoptionsTab s={s} up={up} focus={route.item} />;
  return <OverviewTab s={s} up={up} wb={wb} />;
}

// ---------------------------------------------------------------- overview
function OverviewTab({ s, up, wb }: { s: Series; up: Up; wb: WorkbenchApi }) {
  const [editing, setEditing] = useState(false);
  const list = storiesInOrder(s);
  const people = objectsOf(s, "character");
  return (
    <div className="wb-overview">
      {s.image && (
        <figure className="wb-series-banner">
          <Art
            src={s.image}
            focus="50% 55%"
            alt={`${s.world.name || s.name}的风景`}
            className="wb-series-banner-art"
          />
        </figure>
      )}
      <section className="wb-section">
        <div className="wb-block-head">
          <h2>系列简介</h2>
          <EditToggle editing={editing} onToggle={() => setEditing(!editing)} />
        </div>
        {editing ? (
          <>
            <Field
              label="系列名称"
              value={s.name}
              onChange={(v) => up((x) => ({ ...x, name: v || x.name }))}
            />
            <Field
              label="简介"
              rows={4}
              value={s.summary}
              onChange={(v) => up((x) => ({ ...x, summary: v }))}
            />
          </>
        ) : (
          <div className="wb-prose">
            <Paras text={s.summary} />
          </div>
        )}
      </section>
      <section className="wb-section">
        <h2>故事</h2>
        <ol className="wb-story-chain">
          {list.map((st, i) => {
            const inf = i > 0 ? influencesInto(s, st.id).length : 0;
            return (
              <li key={st.id}>
                {i > 0 && (
                  <a
                    className="wb-chain-link"
                    href={storyLink(s, st, "influence")}
                  >
                    <ArrowRight size={14} aria-hidden="true" /> 前作影响 {inf}{" "}
                    处
                  </a>
                )}
                <a className="wb-story-card" href={storyLink(s, st)}>
                  {st.image && (
                    <Art
                      src={st.image}
                      focus="50% 50%"
                      alt=""
                      className="wb-story-card-art"
                    />
                  )}
                  <span className="wb-story-card-body">
                    <span className="wb-card-kicker">
                      第 {i + 1} 部 · {yearLabel(s, st)}
                      {st.eraId &&
                        ` · ${s.world.eras.find((e) => e.id === st.eraId)?.name ?? ""}`}
                    </span>
                    <strong className="wb-card-title">《{st.title}》</strong>
                    <span className="wb-card-summary">{st.synopsis}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>
      {people.length > 0 && (
        <section className="wb-section">
          <h2>人物在各故事中的身份</h2>
          <div className="wb-table-wrap">
            <table className="wb-table">
              <thead>
                <tr>
                  <th scope="col">人物</th>
                  {list.map((st) => (
                    <th key={st.id} scope="col">
                      《{st.title}》
                      <span className="wb-muted"> {yearLabel(s, st)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map((o) => (
                  <tr key={o.id}>
                    <th scope="row">
                      <a href={objLink(s, o)}>{o.name}</a>
                    </th>
                    {list.map((st) => {
                      const f = stateIn(o, st.id)?.fields;
                      return (
                        <td key={st.id}>
                          {f ? (
                            [f.role, f.status].filter(Boolean).join("；") || "—"
                          ) : (
                            <span className="wb-muted">未出场</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="wb-section wb-danger">
        <h2>删除系列</h2>
        <p className="wb-muted">删除后无法恢复。建议先导出 JSON 备份。</p>
        <button
          className="wb-btn wb-btn-danger"
          onClick={() => {
            if (!confirm(`确定删除“${s.name}”？此操作无法撤销。`)) return;
            wb.setState((st) => ({
              ...st,
              series: st.series.filter((x) => x.id !== s.id),
            }));
            navigate("#/");
          }}
        >
          <Trash2 size={14} aria-hidden="true" /> 删除系列
        </button>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- world
function WorldTab({ s, up }: { s: Series; up: Up }) {
  const [editing, setEditing] = useState(false);
  const [editFact, setEditFact] = useState("");
  const w = s.world;
  const setWorld = (patch: Partial<Series["world"]>) =>
    up((x) => ({ ...x, world: { ...x.world, ...patch } }));
  const setFact = (
    id: string,
    patch: Partial<Series["world"]["facts"][number]>,
  ) =>
    setWorld({
      facts: w.facts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    });
  const setEra = (
    id: string,
    patch: Partial<Series["world"]["eras"][number]>,
  ) =>
    setWorld({
      eras: w.eras.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    });
  const cats = factCategories.filter((c) =>
    w.facts.some((f) => f.category === c),
  );
  const extra = Array.from(new Set(w.facts.map((f) => f.category))).filter(
    (c) => !factCategories.includes(c),
  );
  return (
    <div className="wb-world">
      <section className="wb-section">
        <div className="wb-block-head">
          <h2>{w.name || "未命名的世界"}</h2>
          <EditToggle editing={editing} onToggle={() => setEditing(!editing)} />
        </div>
        {editing ? (
          <>
            <Field
              label="世界名称"
              value={w.name}
              onChange={(v) => setWorld({ name: v })}
            />
            <Field
              label="纪年名称"
              value={w.calendar}
              onChange={(v) => setWorld({ calendar: v || "年" })}
            />
            <Field
              label="概述"
              rows={6}
              value={w.overview}
              onChange={(v) => setWorld({ overview: v })}
            />
          </>
        ) : (
          <div className="wb-prose">
            <Paras text={w.overview} />
          </div>
        )}
      </section>
      <section className="wb-section">
        <h2>时代</h2>
        <ul className="wb-era-list">
          {w.eras.map((e) => (
            <li key={e.id} className="wb-era">
              {editing ? (
                <div className="wb-form">
                  <Field
                    label="名称"
                    value={e.name}
                    onChange={(v) => setEra(e.id, { name: v || e.name })}
                  />
                  <div className="wb-form-row">
                    <NumField
                      label="开始"
                      value={e.start}
                      onChange={(v) => setEra(e.id, { start: v })}
                    />
                    <NumField
                      label="结束（0 表示至今）"
                      value={e.end ?? 0}
                      onChange={(v) => setEra(e.id, { end: v || null })}
                    />
                  </div>
                  <Field
                    label="说明"
                    rows={2}
                    value={e.description}
                    onChange={(v) => setEra(e.id, { description: v })}
                  />
                  <button
                    className="wb-btn wb-btn-small"
                    onClick={() =>
                      setWorld({ eras: w.eras.filter((x) => x.id !== e.id) })
                    }
                  >
                    删除时代
                  </button>
                </div>
              ) : (
                <>
                  <strong>{e.name}</strong>
                  <span className="wb-muted">
                    {" "}
                    {w.calendar} {e.start}–{e.end ?? "至今"}
                  </span>
                  <p>{e.description}</p>
                </>
              )}
            </li>
          ))}
        </ul>
        {editing && (
          <button
            className="wb-btn wb-btn-small"
            onClick={() =>
              setWorld({
                eras: [
                  ...w.eras,
                  {
                    id: uid("era"),
                    name: "新时代",
                    start: 0,
                    end: null,
                    description: "",
                  },
                ],
              })
            }
          >
            <Plus size={14} aria-hidden="true" /> 添加时代
          </button>
        )}
      </section>
      <section className="wb-section">
        <div className="wb-block-head">
          <h2>已确定的设定</h2>
          <button
            className="wb-btn wb-btn-small"
            onClick={() => {
              const id = uid("fact");
              setWorld({
                facts: [
                  ...w.facts,
                  {
                    id,
                    title: "新设定",
                    category: "其他",
                    text: "",
                    entrySlugs: [],
                    visibility: "public",
                  },
                ],
              });
              setEditFact(id);
            }}
          >
            <Plus size={14} aria-hidden="true" /> 添加设定
          </button>
        </div>
        <p className="wb-muted">
          本系列已经确定的世界规则。参考 D&amp;D
          资料的部分，在“采用的设定”中记录采用或改编的决定。
        </p>
        {[...cats, ...extra].map((c) => (
          <div key={c} className="wb-fact-group">
            <h3>{c}</h3>
            {w.facts
              .filter((f) => f.category === c)
              .map((f) =>
                editFact === f.id ? (
                  <div
                    key={f.id}
                    className="wb-fact wb-editing"
                    data-testid="fact"
                  >
                    <Field
                      label="标题"
                      value={f.title}
                      onChange={(v) => setFact(f.id, { title: v || f.title })}
                    />
                    <label className="wb-field wb-field-inline">
                      <span>类别</span>
                      <select
                        className="wb-input"
                        value={f.category}
                        onChange={(e) =>
                          setFact(f.id, { category: e.target.value })
                        }
                      >
                        {factCategories.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="内容"
                      rows={4}
                      value={f.text}
                      onChange={(v) => setFact(f.id, { text: v })}
                    />
                    <VisibilitySelect
                      value={f.visibility}
                      onChange={(v) => setFact(f.id, { visibility: v })}
                    />
                    <EntryPicker
                      value={f.entrySlugs}
                      onChange={(v) => setFact(f.id, { entrySlugs: v })}
                    />
                    <span className="wb-inline-form">
                      <button
                        className="wb-btn wb-btn-small wb-btn-primary"
                        onClick={() => setEditFact("")}
                      >
                        完成
                      </button>
                      <button
                        className="wb-btn wb-btn-small"
                        onClick={() => (
                          setWorld({
                            facts: w.facts.filter((x) => x.id !== f.id),
                          }),
                          setEditFact("")
                        )}
                      >
                        删除设定
                      </button>
                    </span>
                  </div>
                ) : (
                  <article key={f.id} className="wb-fact" data-testid="fact">
                    <h4>
                      {f.title} <PrivateBadge v={f.visibility} />
                      <button
                        className="wb-link-btn"
                        onClick={() => setEditFact(f.id)}
                        aria-label={`编辑设定：${f.title}`}
                      >
                        编辑
                      </button>
                    </h4>
                    <Paras text={f.text} />
                    <EntryChips slugs={f.entrySlugs} />
                  </article>
                ),
              )}
          </div>
        ))}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- objects
function ObjectList({
  s,
  kinds,
  up,
}: {
  s: Series;
  kinds: ObjectKind[];
  up: Up;
}) {
  return (
    <div>
      {kinds.map((kind) => (
        <section key={kind} className="wb-section">
          <div className="wb-block-head">
            <h2>{kindNames[kind]}</h2>
            <button
              className="wb-btn wb-btn-small"
              onClick={() => {
                const name = prompt(`${kindNames[kind]}名称`);
                if (!name?.trim()) return;
                const o: SObject = {
                  id: uid(kind),
                  kind,
                  name: name.trim(),
                  summary: "",
                  profile: {},
                  entrySlugs: [],
                  visibility: "public",
                  states: [],
                };
                up((x) => ({ ...x, objects: [...x.objects, o] }));
                navigate(objLink(s, o));
              }}
            >
              <Plus size={14} aria-hidden="true" /> 新建{kindNames[kind]}
            </button>
          </div>
          <div className="wb-grid wb-grid-2">
            {objectsOf(s, kind).map((o) => (
              <a
                key={o.id}
                className={`wb-card wb-obj-card ${o.image ? "" : "wb-card-text"}`}
                href={objLink(s, o)}
              >
                {o.image && (
                  <Art
                    src={o.image}
                    focus="50% 25%"
                    alt=""
                    className="wb-card-art"
                  />
                )}
                <span className="wb-card-body">
                  <span className="wb-card-kicker">
                    {kindNames[o.kind]} <PrivateBadge v={o.visibility} />
                  </span>
                  <span className="wb-card-title">{o.name}</span>
                  <span className="wb-card-summary">{o.summary}</span>
                  <span className="wb-row-stories">
                    {appearsIn(s, o)
                      .map(
                        (st) =>
                          `《${st.title}》${stateIn(o, st.id)?.fields.role || stateIn(o, st.id)?.fields.status || ""}`,
                      )
                      .join(" · ")}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ObjectPage({
  s,
  o,
  storyId,
  up,
}: {
  s: Series;
  o: SObject;
  storyId: string;
  up: Up;
}) {
  const [editing, setEditing] = useState(false);
  useEffect(() => setEditing(false), [storyId]);
  const list = storiesInOrder(s);
  const st = list.find((x) => x.id === storyId);
  const setObj = (fn: (o: SObject) => SObject) =>
    up((x) => ({
      ...x,
      objects: x.objects.map((y) => (y.id === o.id ? fn(y) : y)),
    }));
  const state = st ? stateIn(o, st.id) : undefined;
  const image = state?.image ?? o.image;
  const prev = st ? previousStateStory(s, o, st.id) : undefined;
  const changes = st && prev ? stateChanges(o, prev.id, st.id) : [];
  const tab = o.kind === "character" ? "characters" : "places";
  const sw = (id: string) => href(seriesRoute(s.id, tab, o.id, { story: id }));
  const name = (id: string) => findObject(s, id)?.name ?? id;
  const causes = st
    ? influencesInto(s, st.id).filter((v) => v.influence.targetId === o.id)
    : [];
  const rels = st
    ? relationsIn(s, st.id).filter((r) => r.from === o.id || r.to === o.id)
    : [];
  const evs = st
    ? eventsIn(s, st.id).filter((e) =>
        [...e.characterIds, ...e.placeIds, ...e.factionIds].includes(o.id),
      )
    : [];
  return (
    <article className="wb-object">
      <nav className="wb-crumbs" aria-label="对象位置">
        <a href={href(seriesRoute(s.id, tab))}>
          {tab === "characters" ? "人物" : "地点与势力"}
        </a>{" "}
        / {o.name}
      </nav>
      <header className={`wb-object-head ${image ? "has-art" : ""}`}>
        {image && (
          <Art
            src={image}
            focus="50% 25%"
            alt={`${o.name}${st ? `在《${st.title}》时期` : ""}的画像`}
            className="wb-object-art"
          />
        )}
        <div>
          <p className="wb-kicker">
            {kindNames[o.kind]} <PrivateBadge v={o.visibility} />
          </p>
          <h2 className="wb-object-name">{o.name}</h2>
          <p className="wb-lede">{o.summary}</p>
          <div className="wb-seg" role="group" aria-label="查看时间点">
            <a
              className={`wb-seg-item ${!st ? "active" : ""}`}
              aria-current={!st ? "true" : undefined}
              href={sw("")}
              onClick={(e) => (
                e.preventDefault(),
                navigate(sw(""), { replace: true })
              )}
            >
              基本资料
            </a>
            {list.map((x) => (
              <a
                key={x.id}
                className={`wb-seg-item ${st?.id === x.id ? "active" : ""}`}
                aria-current={st?.id === x.id ? "true" : undefined}
                href={sw(x.id)}
                onClick={(e) => (
                  e.preventDefault(),
                  navigate(sw(x.id), { replace: true })
                )}
              >
                《{x.title}》
                <span className="wb-muted"> {yearLabel(s, x)}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {!st && (
        <>
          <section className="wb-section">
            <div className="wb-block-head">
              <h3>基本资料</h3>
              <EditToggle
                editing={editing}
                onToggle={() => setEditing(!editing)}
                label="编辑基本资料"
              />
            </div>
            <p className="wb-muted">
              所有故事共用的描述。修改会同时反映在每一部故事中。
            </p>
            {editing ? (
              <div className="wb-form">
                <Field
                  label="名称"
                  value={o.name}
                  onChange={(v) => setObj((x) => ({ ...x, name: v || x.name }))}
                />
                <Field
                  label="一句话简介"
                  rows={2}
                  value={o.summary}
                  onChange={(v) => setObj((x) => ({ ...x, summary: v }))}
                />
                {profileFields[o.kind].map(([k, label]) => (
                  <Field
                    key={k}
                    label={label}
                    rows={3}
                    value={o.profile[k] ?? ""}
                    onChange={(v) =>
                      setObj((x) => ({
                        ...x,
                        profile: { ...x.profile, [k]: v },
                      }))
                    }
                  />
                ))}
                <EntryPicker
                  value={o.entrySlugs}
                  onChange={(v) => setObj((x) => ({ ...x, entrySlugs: v }))}
                />
                <VisibilitySelect
                  value={o.visibility}
                  onChange={(v) => setObj((x) => ({ ...x, visibility: v }))}
                />
                <button
                  className="wb-btn wb-btn-small wb-btn-danger"
                  onClick={() => {
                    if (
                      !confirm(
                        `删除“${o.name}”？相关的关系与影响记录也会删除。`,
                      )
                    )
                      return;
                    up((x) => ({
                      ...x,
                      objects: x.objects.filter((y) => y.id !== o.id),
                      relationships: x.relationships.filter(
                        (r) => r.from !== o.id && r.to !== o.id,
                      ),
                      influences: x.influences.filter(
                        (i) => i.targetId !== o.id,
                      ),
                      stories: x.stories.map((y) => ({
                        ...y,
                        cast: y.cast.filter((c) => c !== o.id),
                        places: y.places.filter((c) => c !== o.id),
                        factions: y.factions.filter((c) => c !== o.id),
                      })),
                    }));
                    navigate(href(seriesRoute(s.id, tab)));
                  }}
                >
                  删除{kindNames[o.kind]}
                </button>
              </div>
            ) : (
              <dl className="wb-profile">
                {profileFields[o.kind]
                  .filter(([k]) => o.profile[k]?.trim())
                  .map(([k, label]) => (
                    <div key={k} data-testid={`profile-${k}`}>
                      <dt>{label}</dt>
                      <dd>{o.profile[k]}</dd>
                    </div>
                  ))}
              </dl>
            )}
            {!editing && <EntryChips slugs={o.entrySlugs} />}
          </section>
          <section className="wb-section">
            <h3>各故事中的状态</h3>
            <div className="wb-table-wrap">
              <table className="wb-table">
                <thead>
                  <tr>
                    <th scope="col">项目</th>
                    {list.map((x) => (
                      <th key={x.id} scope="col">
                        <a href={sw(x.id)}>《{x.title}》</a>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stateFields[o.kind]
                    .filter(([k]) =>
                      list.some((x) => stateIn(o, x.id)?.fields[k]),
                    )
                    .map(([k, label]) => (
                      <tr key={k}>
                        <th scope="row">{label}</th>
                        {list.map((x) => (
                          <td key={x.id}>
                            {stateIn(o, x.id)?.fields[k] || (
                              <span className="wb-muted">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {st && (
        <>
          <section className="wb-section">
            <div className="wb-block-head">
              <h3>
                在《{st.title}》中{" "}
                <span className="wb-muted">{yearLabel(s, st)}</span>
              </h3>
              <EditToggle
                editing={editing}
                onToggle={() => setEditing(!editing)}
                label="编辑此时的状态"
              />
            </div>
            {editing ? (
              <div className="wb-form">
                <p className="wb-muted">这里的修改只影响《{st.title}》。</p>
                {stateFields[o.kind].map(([k, label]) => (
                  <Field
                    key={k}
                    label={label}
                    rows={k === "knowledge" || k === "note" ? 2 : 0}
                    value={state?.fields[k] ?? ""}
                    onChange={(v) => setObj((x) => setState(x, st.id, k, v))}
                  />
                ))}
                {state && (
                  <VisibilitySelect
                    value={state.visibility}
                    onChange={(v) =>
                      setObj((x) => ({
                        ...x,
                        states: x.states.map((y) =>
                          y.storyId === st.id ? { ...y, visibility: v } : y,
                        ),
                      }))
                    }
                  />
                )}
              </div>
            ) : state ? (
              <dl className="wb-profile">
                {stateFields[o.kind]
                  .filter(([k]) => state.fields[k]?.trim())
                  .map(([k, label]) => (
                    <div key={k} data-testid={`state-${k}`}>
                      <dt>{label}</dt>
                      <dd>{state.fields[k]}</dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="wb-muted">这部故事中还没有记录{o.name}的状态。</p>
            )}
            {!editing && o.summary && (
              <p className="wb-muted">
                基本资料：{o.summary} <a href={sw("")}>查看</a>
              </p>
            )}
          </section>
          {prev && (
            <section
              className="wb-section wb-changes"
              aria-label={`自《${prev.title}》以来的变化`}
            >
              <h3>自《{prev.title}》以来的变化</h3>
              {changes.length ? (
                <ul className="wb-diff">
                  {changes.map((c) => (
                    <li key={c.key} data-testid="change">
                      <span className="wb-diff-label">{c.label}</span>
                      <span className="wb-diff-before">
                        {c.before || "（无）"}
                      </span>
                      <ArrowRight size={14} aria-hidden="true" />
                      <span className="wb-diff-after">
                        {c.after || "（无）"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="wb-muted">记录的状态没有变化。</p>
              )}
              {causes.length > 0 && (
                <>
                  <h4>来自前作的原因</h4>
                  <ul className="wb-list">
                    {causes.map((v) => (
                      <li key={v.influence.id}>
                        {v.fromStory && (
                          <a href={storyLink(s, v.fromStory)}>
                            《{v.fromStory.title}》
                          </a>
                        )}
                        “{v.event?.title}”：{v.influence.description}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
          {rels.length > 0 && (
            <section className="wb-section">
              <h3>此时的人物关系</h3>
              <ul className="wb-rel-list">
                {rels.map((r) => (
                  <li key={r.id} data-testid="relationship">
                    <strong>{name(r.from)}</strong> →{" "}
                    <strong>{name(r.to)}</strong>｜{r.type}：{r.description}{" "}
                    <PrivateBadge v={r.visibility} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {evs.length > 0 && (
            <section className="wb-section">
              <h3>参与的事件</h3>
              <ul className="wb-list">
                {evs.map((e) => (
                  <li key={e.id}>
                    {s.world.calendar} {e.year}｜<strong>{e.title}</strong>：
                    {e.consequence}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- stories
function StoryList({ s, up }: { s: Series; up: Up }) {
  const list = storiesInOrder(s);
  return (
    <section className="wb-section">
      <div className="wb-block-head">
        <h2>故事</h2>
        <button
          className="wb-btn wb-btn-small"
          onClick={() => {
            const title = prompt("故事标题");
            if (!title?.trim()) return;
            const last = list[list.length - 1];
            const st: Story = {
              id: uid("story"),
              title: title.trim(),
              order: (last?.order ?? 0) + 1,
              eraId: last?.eraId ?? "",
              yearStart: last ? last.yearEnd + 1 : 0,
              yearEnd: last ? last.yearEnd + 1 : 0,
              synopsis: "",
              chapters: [],
              cast: [],
              places: [],
              factions: [],
              visibility: "public",
            };
            up((x) => ({ ...x, stories: [...x.stories, st] }));
            navigate(storyLink(s, st, "edit"));
          }}
        >
          <Plus size={14} aria-hidden="true" /> 新建故事
        </button>
      </div>
      <ol className="wb-story-chain">
        {list.map((st, i) => (
          <li key={st.id}>
            {i > 0 && (
              <a className="wb-chain-link" href={storyLink(s, st, "influence")}>
                <ArrowRight size={14} aria-hidden="true" /> 前作影响{" "}
                {influencesInto(s, st.id).length} 处
              </a>
            )}
            <a className="wb-story-card" href={storyLink(s, st)}>
              {st.image && (
                <Art
                  src={st.image}
                  focus="50% 50%"
                  alt=""
                  className="wb-story-card-art"
                />
              )}
              <span className="wb-story-card-body">
                <span className="wb-card-kicker">
                  第 {i + 1} 部 · {yearLabel(s, st)}{" "}
                  <PrivateBadge v={st.visibility} />
                </span>
                <strong className="wb-card-title">《{st.title}》</strong>
                <span className="wb-card-summary">{st.synopsis}</span>
                <span className="wb-row-stories">
                  {st.chapters.length} 章 · {st.cast.length} 个人物 ·{" "}
                  {eventsIn(s, st.id).length} 个事件
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StoryPage({
  s,
  st,
  mode,
  pub,
  up,
}: {
  s: Series;
  st: Story;
  mode: StoryMode;
  pub: boolean;
  up: Up;
}) {
  const list = storiesInOrder(s);
  const idx = list.findIndex((x) => x.id === st.id);
  const modes: [StoryMode, string][] = [
    ["read", "阅读"],
    ["edit", "编辑"],
    ["influence", "前作影响"],
  ];
  const go = (m: StoryMode) =>
    href(seriesRoute(s.id, "stories", st.id, { mode: m, pub }));
  return (
    <article className="wb-story">
      <nav className="wb-crumbs" aria-label="故事位置">
        <a href={href(seriesRoute(s.id, "stories"))}>故事</a> / 《{st.title}》
      </nav>
      <header className={`wb-story-head ${st.image ? "has-art" : ""}`}>
        {st.image && (
          <Art
            src={st.image}
            focus="50% 50%"
            alt={`《${st.title}》的场景`}
            className="wb-story-art"
          />
        )}
        <div>
          <p className="wb-kicker">
            第 {idx + 1} 部 · {yearLabel(s, st)}
            {st.eraId &&
              ` · ${s.world.eras.find((e) => e.id === st.eraId)?.name ?? ""}`}{" "}
            <PrivateBadge v={st.visibility} />
          </p>
          <h2 className="wb-story-title">《{st.title}》</h2>
          <div className="wb-seg" role="group" aria-label="故事视图">
            {modes.map(([m, label]) => (
              <a
                key={m}
                className={`wb-seg-item ${mode === m ? "active" : ""}`}
                aria-current={mode === m ? "true" : undefined}
                href={go(m)}
                onClick={(e) => (
                  e.preventDefault(),
                  navigate(go(m), { replace: true })
                )}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>
      {mode === "edit" ? (
        <StoryEdit s={s} st={st} up={up} />
      ) : mode === "influence" ? (
        <StoryInfluence s={s} st={st} up={up} />
      ) : (
        <StoryRead s={s} st={st} pub={pub} />
      )}
      <nav className="wb-story-nav" aria-label="前后故事">
        {idx > 0 && (
          <a href={storyLink(s, list[idx - 1])}>
            ← 上一部：《{list[idx - 1].title}》
          </a>
        )}
        {idx < list.length - 1 && (
          <a href={storyLink(s, list[idx + 1])}>
            下一部：《{list[idx + 1].title}》 →
          </a>
        )}
      </nav>
    </article>
  );
}

function StoryRead({ s, st, pub }: { s: Series; st: Story; pub: boolean }) {
  const ok = (v: Visibility) => !pub || v === "public";
  const name = (id: string) => findObject(s, id)?.name ?? id;
  const inf = influencesInto(s, st.id).filter((v) =>
    ok(v.influence.visibility),
  );
  const togglePub = href(
    seriesRoute(s.id, "stories", st.id, { mode: "read", pub: !pub }),
  );
  const cast = st.cast
    .map((id) => findObject(s, id))
    .filter((o): o is SObject => !!o && ok(o.visibility));
  const others = [...st.places, ...st.factions]
    .map((id) => findObject(s, id))
    .filter((o): o is SObject => !!o && ok(o.visibility));
  const evs = eventsIn(s, st.id).filter((e) => ok(e.visibility));
  const rels = relationsIn(s, st.id).filter(
    (r) => ok(r.visibility) && r.storyId === st.id,
  );
  return (
    <div className="wb-story-read">
      <label className="wb-check">
        <input
          type="checkbox"
          checked={pub}
          onChange={() => navigate(togglePub, { replace: true })}
        />{" "}
        只显示公开内容
      </label>
      {inf.length > 0 && (
        <aside className="wb-callout" aria-label="前作影响">
          <h3>前作影响</h3>
          <ul className="wb-list">
            {inf.slice(0, 4).map((v) => (
              <li key={v.influence.id}>
                <strong>{v.target?.name ?? v.fact?.title ?? "世界"}</strong>：
                {v.influence.description}
                {v.fromStory && (
                  <span className="wb-muted">
                    （源自《{v.fromStory.title}》“{v.event?.title}”）
                  </span>
                )}
              </li>
            ))}
          </ul>
          <a
            href={href(
              seriesRoute(s.id, "stories", st.id, { mode: "influence" }),
            )}
          >
            查看全部 {inf.length} 处影响
          </a>
        </aside>
      )}
      <section className="wb-section wb-prose">
        <h3>梗概</h3>
        <Paras text={st.synopsis} />
      </section>
      {st.chapters.filter((c) => ok(c.visibility)).length > 0 && (
        <section className="wb-section wb-prose">
          <h3>章节</h3>
          {st.chapters
            .filter((c) => ok(c.visibility))
            .map((c, i) => (
              <div key={c.id} className="wb-chapter">
                <h4>
                  {i + 1}. {c.title} <PrivateBadge v={c.visibility} />
                </h4>
                <Paras text={c.text} />
              </div>
            ))}
        </section>
      )}
      {cast.length > 0 && (
        <section className="wb-section">
          <h3>出场人物</h3>
          <div className="wb-cast">
            {cast.map((o) => {
              const f = stateIn(o, st.id);
              const img = f?.image ?? o.image;
              return (
                <a
                  key={o.id}
                  className="wb-cast-card"
                  data-testid="cast"
                  href={objLink(s, o, st.id)}
                >
                  {img ? (
                    <Art
                      src={img}
                      focus="50% 25%"
                      alt=""
                      className="wb-cast-art"
                    />
                  ) : (
                    <span
                      className="wb-cast-art wb-thumb-empty"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    <strong>{o.name}</strong>
                    {f?.fields.age && (
                      <span className="wb-muted"> · {f.fields.age}</span>
                    )}
                    <span className="wb-cast-role">
                      {f?.fields.role || o.summary}
                    </span>
                    {f?.fields.status && (
                      <span className="wb-muted wb-cast-status">
                        {f.fields.status}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}
      {others.length > 0 && (
        <section className="wb-section">
          <h3>地点与势力</h3>
          <ul className="wb-list">
            {others.map((o) => (
              <li key={o.id}>
                <a href={objLink(s, o, st.id)}>{o.name}</a>（{kindNames[o.kind]}
                ）：{stateIn(o, st.id)?.fields.status || o.summary}
              </li>
            ))}
          </ul>
        </section>
      )}
      {evs.length > 0 && (
        <section className="wb-section">
          <h3>关键事件</h3>
          {evs.map((e) => (
            <article key={e.id} className="wb-event" data-testid="event">
              <h4>
                {s.world.calendar} {e.year}｜{e.title}{" "}
                {e.carriesForward && (
                  <span className="wb-badge">影响后续故事</span>
                )}{" "}
                <PrivateBadge v={e.visibility} />
              </h4>
              <dl className="wb-event-dl">
                {e.cause && (
                  <>
                    <dt>起因</dt>
                    <dd>{e.cause}</dd>
                  </>
                )}
                {e.conflict && (
                  <>
                    <dt>冲突</dt>
                    <dd>{e.conflict}</dd>
                  </>
                )}
                {e.consequence && (
                  <>
                    <dt>后果</dt>
                    <dd>{e.consequence}</dd>
                  </>
                )}
              </dl>
              <EntryChips slugs={e.entrySlugs} />
            </article>
          ))}
        </section>
      )}
      {rels.length > 0 && (
        <section className="wb-section">
          <h3>人物关系</h3>
          <ul className="wb-rel-list">
            {rels.map((r) => (
              <li key={r.id} data-testid="relationship">
                <strong>{name(r.from)}</strong> → <strong>{name(r.to)}</strong>
                ｜{r.type}：{r.description} <PrivateBadge v={r.visibility} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function IdChecks({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SObject[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset className="wb-checks">
      <legend>{label}</legend>
      {options.length === 0 && <span className="wb-muted">暂无</span>}
      {options.map((o) => (
        <label key={o.id} className="wb-check">
          <input
            type="checkbox"
            checked={value.includes(o.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...value, o.id]
                  : value.filter((x) => x !== o.id),
              )
            }
          />{" "}
          {o.name}
        </label>
      ))}
    </fieldset>
  );
}

function StoryEdit({ s, st, up }: { s: Series; st: Story; up: Up }) {
  const setStory = (patch: Partial<Story>) =>
    up((x) => ({
      ...x,
      stories: x.stories.map((y) => (y.id === st.id ? { ...y, ...patch } : y)),
    }));
  const setChapter = (cid: string, patch: Partial<Story["chapters"][number]>) =>
    setStory({
      chapters: st.chapters.map((c) => (c.id === cid ? { ...c, ...patch } : c)),
    });
  const evs = eventsIn(s, st.id);
  const rels = s.relationships.filter((r) => r.storyId === st.id);
  const people = objectsOf(s, "character");
  const [rel, setRel] = useState({
    from: "",
    to: "",
    type: relationTypes[0],
    description: "",
  });
  const name = (id: string) => findObject(s, id)?.name ?? id;
  return (
    <div className="wb-story-edit">
      <p className="wb-save-note">修改会自动保存。{SAVE_LABEL}</p>
      <section className="wb-section wb-form">
        <h3>基本信息</h3>
        <Field
          label="标题"
          value={st.title}
          onChange={(v) => setStory({ title: v || st.title })}
        />
        <div className="wb-form-row">
          <NumField
            label="顺序"
            value={st.order}
            onChange={(v) => setStory({ order: v })}
          />
          <NumField
            label="开始年份"
            value={st.yearStart}
            onChange={(v) => setStory({ yearStart: v })}
          />
          <NumField
            label="结束年份"
            value={st.yearEnd}
            onChange={(v) => setStory({ yearEnd: v })}
          />
          <label className="wb-field wb-field-inline">
            <span>时代</span>
            <select
              className="wb-input"
              value={st.eraId}
              onChange={(e) => setStory({ eraId: e.target.value })}
            >
              <option value="">（无）</option>
              {s.world.eras.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Field
          label="梗概"
          rows={5}
          value={st.synopsis}
          onChange={(v) => setStory({ synopsis: v })}
        />
        <VisibilitySelect
          value={st.visibility}
          onChange={(v) => setStory({ visibility: v })}
        />
      </section>
      <section className="wb-section">
        <h3>章节</h3>
        {st.chapters.map((c, i) => (
          <div key={c.id} className="wb-form wb-chapter-edit">
            <Field
              label={`第 ${i + 1} 章标题`}
              value={c.title}
              onChange={(v) => setChapter(c.id, { title: v || c.title })}
            />
            <Field
              label="内容"
              rows={4}
              value={c.text}
              onChange={(v) => setChapter(c.id, { text: v })}
            />
            <span className="wb-inline-form">
              <VisibilitySelect
                value={c.visibility}
                onChange={(v) => setChapter(c.id, { visibility: v })}
              />
              <button
                className="wb-btn wb-btn-small"
                onClick={() =>
                  setStory({
                    chapters: st.chapters.filter((x) => x.id !== c.id),
                  })
                }
              >
                删除章节
              </button>
            </span>
          </div>
        ))}
        <button
          className="wb-btn wb-btn-small"
          onClick={() =>
            setStory({
              chapters: [
                ...st.chapters,
                {
                  id: uid("ch"),
                  title: `第 ${st.chapters.length + 1} 章`,
                  text: "",
                  visibility: "public",
                },
              ],
            })
          }
        >
          <Plus size={14} aria-hidden="true" /> 添加章节
        </button>
      </section>
      <section className="wb-section">
        <h3>出场的人物、地点与势力</h3>
        <IdChecks
          label="人物"
          options={people}
          value={st.cast}
          onChange={(v) => setStory({ cast: v })}
        />
        <IdChecks
          label="地点"
          options={objectsOf(s, "place")}
          value={st.places}
          onChange={(v) => setStory({ places: v })}
        />
        <IdChecks
          label="势力"
          options={objectsOf(s, "faction")}
          value={st.factions}
          onChange={(v) => setStory({ factions: v })}
        />
      </section>
      <section className="wb-section">
        <h3>事件</h3>
        {evs.map((e) => (
          <EventEditor key={e.id} s={s} e={e} up={up} />
        ))}
        <button
          className="wb-btn wb-btn-small"
          onClick={() =>
            up((x) => ({
              ...x,
              events: [
                ...x.events,
                {
                  id: uid("ev"),
                  storyId: st.id,
                  year: st.yearStart,
                  title: "新事件",
                  cause: "",
                  conflict: "",
                  consequence: "",
                  characterIds: [],
                  placeIds: [],
                  factionIds: [],
                  entrySlugs: [],
                  carriesForward: false,
                  visibility: "public",
                },
              ],
            }))
          }
        >
          <Plus size={14} aria-hidden="true" /> 添加事件
        </button>
      </section>
      <section className="wb-section">
        <h3>这部故事中的关系</h3>
        <ul className="wb-rel-list">
          {rels.map((r) => (
            <li key={r.id}>
              <strong>{name(r.from)}</strong> → <strong>{name(r.to)}</strong>｜
              {r.type}：{r.description} <PrivateBadge v={r.visibility} />
              <button
                className="wb-link-btn"
                onClick={() =>
                  up((x) => ({
                    ...x,
                    relationships: x.relationships.filter((y) => y.id !== r.id),
                  }))
                }
              >
                删除
              </button>
            </li>
          ))}
        </ul>
        <form
          className="wb-form-row"
          aria-label="添加关系"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rel.from || !rel.to || rel.from === rel.to) return;
            up((x) => ({
              ...x,
              relationships: [
                ...x.relationships,
                {
                  id: uid("rel"),
                  ...rel,
                  storyId: st.id,
                  visibility: "public",
                },
              ],
            }));
            setRel({ ...rel, description: "" });
          }}
        >
          <select
            className="wb-input"
            aria-label="关系起点"
            value={rel.from}
            onChange={(e) => setRel({ ...rel, from: e.target.value })}
          >
            <option value="">谁</option>
            {people.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            className="wb-input"
            aria-label="关系类型"
            value={rel.type}
            onChange={(e) => setRel({ ...rel, type: e.target.value })}
          >
            {relationTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            className="wb-input"
            aria-label="关系对象"
            value={rel.to}
            onChange={(e) => setRel({ ...rel, to: e.target.value })}
          >
            <option value="">对谁</option>
            {people.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <input
            className="wb-input"
            aria-label="关系说明"
            placeholder="说明"
            value={rel.description}
            onChange={(e) => setRel({ ...rel, description: e.target.value })}
          />
          <button
            className="wb-btn wb-btn-small"
            type="submit"
            disabled={!rel.from || !rel.to || rel.from === rel.to}
          >
            添加关系
          </button>
        </form>
      </section>
      <section className="wb-section wb-danger">
        <button
          className="wb-btn wb-btn-small wb-btn-danger"
          onClick={() => {
            if (
              !confirm(
                `删除《${st.title}》？其中的事件、关系、状态与影响记录也会删除。`,
              )
            )
              return;
            const evIds = new Set(evs.map((e) => e.id));
            up((x) => ({
              ...x,
              stories: x.stories.filter((y) => y.id !== st.id),
              events: x.events.filter((e) => e.storyId !== st.id),
              relationships: x.relationships.filter((r) => r.storyId !== st.id),
              influences: x.influences.filter(
                (i) => i.storyId !== st.id && !evIds.has(i.eventId),
              ),
              objects: x.objects.map((o) => ({
                ...o,
                states: o.states.filter((y) => y.storyId !== st.id),
              })),
            }));
            navigate(href(seriesRoute(s.id, "stories")));
          }}
        >
          <Trash2 size={14} aria-hidden="true" /> 删除故事
        </button>
      </section>
    </div>
  );
}

function EventEditor({ s, e, up }: { s: Series; e: SEvent; up: Up }) {
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<SEvent>) =>
    up((x) => ({
      ...x,
      events: x.events.map((y) => (y.id === e.id ? { ...y, ...patch } : y)),
    }));
  if (!open)
    return (
      <div className="wb-event-row">
        <span>
          {s.world.calendar} {e.year}｜<strong>{e.title}</strong>{" "}
          {e.carriesForward && <span className="wb-badge">影响后续故事</span>}{" "}
          <PrivateBadge v={e.visibility} />
        </span>
        <button
          className="wb-link-btn"
          onClick={() => setOpen(true)}
          aria-label={`编辑事件：${e.title}`}
        >
          编辑
        </button>
      </div>
    );
  return (
    <div className="wb-form wb-event-edit">
      <div className="wb-form-row">
        <Field
          label="事件名称"
          value={e.title}
          onChange={(v) => set({ title: v || e.title })}
        />
        <NumField
          label="年份"
          value={e.year}
          onChange={(v) => set({ year: v })}
        />
      </div>
      <Field
        label="起因"
        rows={2}
        value={e.cause}
        onChange={(v) => set({ cause: v })}
      />
      <Field
        label="冲突"
        rows={2}
        value={e.conflict}
        onChange={(v) => set({ conflict: v })}
      />
      <Field
        label="后果"
        rows={2}
        value={e.consequence}
        onChange={(v) => set({ consequence: v })}
      />
      <IdChecks
        label="相关人物"
        options={objectsOf(s, "character")}
        value={e.characterIds}
        onChange={(v) => set({ characterIds: v })}
      />
      <label className="wb-check">
        <input
          type="checkbox"
          checked={e.carriesForward}
          onChange={(ev) => set({ carriesForward: ev.target.checked })}
        />{" "}
        影响后续故事
      </label>
      <EntryPicker
        value={e.entrySlugs}
        onChange={(v) => set({ entrySlugs: v })}
      />
      <span className="wb-inline-form">
        <VisibilitySelect
          value={e.visibility}
          onChange={(v) => set({ visibility: v })}
        />
        <button
          className="wb-btn wb-btn-small wb-btn-primary"
          onClick={() => setOpen(false)}
        >
          完成
        </button>
        <button
          className="wb-btn wb-btn-small"
          onClick={() =>
            up((x) => ({
              ...x,
              events: x.events.filter((y) => y.id !== e.id),
              influences: x.influences.filter((i) => i.eventId !== e.id),
            }))
          }
        >
          删除事件
        </button>
      </span>
    </div>
  );
}

function StoryInfluence({ s, st, up }: { s: Series; st: Story; up: Up }) {
  const inf = influencesInto(s, st.id);
  const events = earlierEvents(s, st.id);
  const [form, setForm] = useState({
    eventId: "",
    targetId: "",
    description: "",
  });
  const groups = useMemo(() => {
    const m = new Map<string, typeof inf>();
    for (const v of inf)
      m.set(v.influence.eventId, [...(m.get(v.influence.eventId) ?? []), v]);
    return [...m.values()];
  }, [inf]);
  const out = influencesFrom(s, st.id);
  const targets = [
    ...s.objects.map((o) => [o.id, `${kindNames[o.kind]}：${o.name}`]),
    ...s.world.facts.map((f) => [f.id, `设定：${f.title}`]),
  ];
  const name = (id: string) =>
    findObject(s, id)?.name ??
    s.world.facts.find((f) => f.id === id)?.title ??
    "世界";
  return (
    <div className="wb-story-influence">
      <p className="wb-muted">
        前作中的事件如何改变了《{st.title}》开始时的世界与人物。
      </p>
      {groups.length === 0 && <p className="wb-empty">还没有记录前作影响。</p>}
      {groups.map((g) => {
        const ev = g[0].event;
        return (
          <section
            key={g[0].influence.eventId}
            className="wb-section wb-influence-group"
          >
            <h3>
              {g[0].fromStory && (
                <a href={storyLink(s, g[0].fromStory)}>
                  《{g[0].fromStory.title}》
                </a>
              )}{" "}
              {ev && `${s.world.calendar} ${ev.year}｜${ev.title}`}
            </h3>
            {ev?.consequence && (
              <p className="wb-muted">当时的后果：{ev.consequence}</p>
            )}
            <ul className="wb-influence-list">
              {g.map((v) => {
                const prev =
                  v.target && g[0].fromStory
                    ? stateChanges(v.target, g[0].fromStory.id, st.id)
                    : [];
                return (
                  <li key={v.influence.id} data-testid="influence">
                    <strong>
                      {v.target ? (
                        <a href={objLink(s, v.target, st.id)}>
                          {v.target.name}
                        </a>
                      ) : (
                        (v.fact?.title ?? "世界")
                      )}
                    </strong>
                    ：{v.influence.description}{" "}
                    <PrivateBadge v={v.influence.visibility} />
                    {prev.length > 0 && (
                      <details className="wb-diff-details">
                        <summary>状态变化 {prev.length} 项</summary>
                        <ul className="wb-diff wb-diff-compact">
                          {prev.map((c) => (
                            <li key={c.key}>
                              <span className="wb-diff-label">{c.label}</span>
                              <span className="wb-diff-before">
                                {c.before || "（无）"}
                              </span>
                              <ArrowRight size={12} aria-hidden="true" />
                              <span className="wb-diff-after">
                                {c.after || "（无）"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <button
                      className="wb-link-btn"
                      onClick={() =>
                        up((x) => ({
                          ...x,
                          influences: x.influences.filter(
                            (y) => y.id !== v.influence.id,
                          ),
                        }))
                      }
                    >
                      删除
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {events.length > 0 && (
        <form
          className="wb-section wb-form"
          aria-label="添加影响"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.eventId || !form.description.trim()) return;
            up((x) => ({
              ...x,
              influences: [
                ...x.influences,
                {
                  id: uid("inf"),
                  eventId: form.eventId,
                  storyId: st.id,
                  targetId: form.targetId,
                  description: form.description.trim(),
                  visibility: "public",
                },
              ],
            }));
            setForm({ eventId: form.eventId, targetId: "", description: "" });
          }}
        >
          <h3>添加影响</h3>
          <label className="wb-field">
            <span>前作中的事件</span>
            <select
              className="wb-input"
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
            >
              <option value="">选择事件…</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  《{s.stories.find((x) => x.id === e.storyId)?.title}》
                  {e.title}
                </option>
              ))}
            </select>
          </label>
          <label className="wb-field">
            <span>影响的对象</span>
            <select
              className="wb-input"
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            >
              <option value="">整个世界</option>
              {targets.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="影响说明"
            rows={2}
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
          <button
            className="wb-btn wb-btn-primary wb-btn-small"
            type="submit"
            disabled={!form.eventId || !form.description.trim()}
          >
            添加影响
          </button>
        </form>
      )}
      {out.length > 0 && (
        <section className="wb-section">
          <h3>这部故事对后续故事的影响</h3>
          <ul className="wb-list">
            {out.map((i) => {
              const to = s.stories.find((x) => x.id === i.storyId);
              return (
                <li key={i.id}>
                  {to && (
                    <a href={storyLink(s, to, "influence")}>《{to.title}》</a>
                  )}
                  ·{name(i.targetId)}：{i.description}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- timeline
function TimelineTab({ s, up }: { s: Series; up: Up }) {
  const list = storiesInOrder(s);
  const evs = [...s.events].sort((a, b) => a.year - b.year);
  const storyOf = (id: string) => s.stories.find((x) => x.id === id);
  return (
    <div className="wb-timeline-page">
      <section className="wb-section">
        <h2>时代与故事</h2>
        <ol className="wb-era-line">
          {s.world.eras.map((e) => (
            <li key={e.id} className="wb-era">
              <strong>{e.name}</strong>
              <span className="wb-muted">
                {" "}
                {s.world.calendar} {e.start}–{e.end ?? "至今"}
              </span>
              <ul className="wb-list">
                {list
                  .filter((st) => st.eraId === e.id)
                  .map((st) => (
                    <li key={st.id}>
                      <a href={storyLink(s, st)}>《{st.title}》</a>{" "}
                      {yearLabel(s, st)}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <section className="wb-section">
        <div className="wb-block-head">
          <h2>事件年表</h2>
          <button
            className="wb-btn wb-btn-small"
            onClick={() => {
              const title = prompt("世界事件名称（不属于任何一部故事）");
              if (!title?.trim()) return;
              const year =
                parseInt(
                  prompt("年份", String(list[0]?.yearStart ?? 0)) ?? "0",
                  10,
                ) || 0;
              up((x) => ({
                ...x,
                events: [
                  ...x.events,
                  {
                    id: uid("ev"),
                    storyId: "",
                    year,
                    title: title.trim(),
                    cause: "",
                    conflict: "",
                    consequence: "",
                    characterIds: [],
                    placeIds: [],
                    factionIds: [],
                    entrySlugs: [],
                    carriesForward: false,
                    visibility: "public",
                  },
                ],
              }));
            }}
          >
            <Plus size={14} aria-hidden="true" /> 添加世界事件
          </button>
        </div>
        <ol className="wb-timeline">
          {evs.map((e) => {
            const st = storyOf(e.storyId);
            const n = s.influences.filter((i) => i.eventId === e.id).length;
            return (
              <li
                key={e.id}
                className="wb-timeline-item"
                data-testid="timeline-event"
              >
                <span className="wb-timeline-year">
                  {s.world.calendar} {e.year}
                </span>
                <div>
                  <strong>{e.title}</strong> <PrivateBadge v={e.visibility} />
                  {st ? (
                    <a className="wb-tag" href={storyLink(s, st)}>
                      《{st.title}》
                    </a>
                  ) : (
                    <span className="wb-tag">世界事件</span>
                  )}
                  {e.consequence && <p>{e.consequence}</p>}
                  {n > 0 && <p className="wb-muted">影响后续故事 {n} 处</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- adoptions
function AdoptionsTab({ s, up, focus }: { s: Series; up: Up; focus: string }) {
  const [pick, setPick] = useState("");
  useEffect(() => {
    if (focus)
      document
        .getElementById(`adopt-${focus}`)
        ?.scrollIntoView({ block: "start" });
  }, [focus]);
  const setA = (id: string, patch: Partial<Adoption>) =>
    up((x) => ({
      ...x,
      adoptions: x.adoptions.map((a) =>
        a.id === id
          ? { ...a, ...patch, updatedAt: new Date().toISOString() }
          : a,
      ),
    }));
  const deep = entries.filter(
    (e) =>
      e.depth === "deep" && !s.adoptions.some((a) => a.entrySlug === e.slug),
  );
  return (
    <div className="wb-adoptions">
      <p className="wb-muted">
        官方资料是参考来源。这里记录本系列对每个参考条目的决定：采用、改编、不采用或未决定，以及本系列自己的设定。
      </p>
      {s.adoptions.length === 0 && (
        <p className="wb-empty">
          还没有记录。可以在资料条目页点“加入系列设定”，或在下方添加。
        </p>
      )}
      {s.adoptions.map((a) => {
        const e = getEntry(a.entrySlug);
        return (
          <article
            key={a.id}
            id={`adopt-${a.entrySlug}`}
            className={`wb-adopt wb-adopt-${a.decision}`}
            data-testid="adoption"
          >
            <header className="wb-block-head">
              <h3>
                {e ? (
                  <a href={href({ name: "entry", slug: e.slug, tab: "body" })}>
                    {e.zh}
                  </a>
                ) : (
                  a.entrySlug
                )}
                <span className="wb-muted"> {e?.en}</span>{" "}
                <span className={`wb-badge wb-decision-${a.decision}`}>
                  {decisionNames[a.decision]}
                </span>{" "}
                <PrivateBadge v={a.visibility} />
              </h3>
            </header>
            <div className="wb-adopt-grid">
              <div className="wb-adopt-ref">
                <h4>参考资料</h4>
                <p>{e?.summary}</p>
                {e && (
                  <ul className="wb-source-mini">
                    {e.sources.map(([sid, loc]) => {
                      const src = sources[sid];
                      return src ? (
                        <li key={sid + loc}>
                          {src.url ? (
                            <a href={src.url} target="_blank" rel="noreferrer">
                              {src.title}
                            </a>
                          ) : (
                            src.title
                          )}
                          {loc && ` ${loc}`}{" "}
                          <span className="wb-muted">
                            （{licenseLabel[src.license]}）
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                )}
                {e?.drafts?.length ? (
                  <p className="wb-muted">
                    该条目另有 {e.drafts.length}{" "}
                    条尚无一手出处的说法，未写入正文。
                    <a href="#/drafts">查看核实草稿</a>
                  </p>
                ) : null}
              </div>
              <div className="wb-adopt-mine">
                <label className="wb-field wb-field-inline">
                  <span>决定</span>
                  <select
                    className="wb-input"
                    aria-label={`对${e?.zh ?? a.entrySlug}的决定`}
                    value={a.decision}
                    onChange={(ev) =>
                      setA(a.id, {
                        decision: ev.target.value as Adoption["decision"],
                      })
                    }
                  >
                    {decisions.map((d) => (
                      <option key={d} value={d}>
                        {decisionNames[d]}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="本系列的设定"
                  rows={4}
                  value={a.canon}
                  onChange={(v) => setA(a.id, { canon: v })}
                />
                <Field
                  label="改编说明"
                  rows={2}
                  value={a.change}
                  onChange={(v) => setA(a.id, { change: v })}
                  placeholder="与参考资料有哪些不同，为什么"
                />
                <span className="wb-inline-form">
                  <VisibilitySelect
                    value={a.visibility}
                    onChange={(v) => setA(a.id, { visibility: v })}
                  />
                  <button
                    className="wb-link-btn"
                    onClick={() =>
                      up((x) => ({
                        ...x,
                        adoptions: x.adoptions.filter((y) => y.id !== a.id),
                      }))
                    }
                  >
                    移除
                  </button>
                </span>
              </div>
            </div>
          </article>
        );
      })}
      <section className="wb-section wb-inline-form">
        <select
          className="wb-input"
          aria-label="选择要记录的参考条目"
          value={pick}
          onChange={(ev) => setPick(ev.target.value)}
        >
          <option value="">选择参考条目…</option>
          {deep.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.zh} {e.en}
            </option>
          ))}
        </select>
        <button
          className="wb-btn wb-btn-small"
          disabled={!pick}
          onClick={() => (up((x) => addAdoption(x, pick)), setPick(""))}
        >
          <Plus size={14} aria-hidden="true" /> 添加条目
        </button>
      </section>
    </div>
  );
}
