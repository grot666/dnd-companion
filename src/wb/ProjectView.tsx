import { useEffect, useRef, useState } from "react";
import { Download, FileJson, Plus, Trash2, Upload } from "lucide-react";
import { Art, BlockView, download, EntryCard, fmtDate, ProjectRow } from "../Workbench";
import { entries, getEntry } from "./entries";
import { sources } from "./sources";
import { href, navigate, projectTabs, type ProjectTab } from "./router";
import type { WorkbenchApi } from "./store";
import {
  applyImport,
  now,
  parseImport,
  projectJson,
  projectMarkdown,
  relationTypes,
  SAVE_LABEL,
  touch,
  uid,
  type Character,
  type ImportPreview,
  type Plot,
  type Project,
  type WbState,
} from "./project";

const deepEntries = entries.filter((e) => e.depth === "deep");
const fileSafe = (s: string) => s.replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 60);

// ---------------- Projects list ----------------
export function ProjectsPage({ wb }: { wb: WorkbenchApi }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<WbState | null>(null);
  const [message, setMessage] = useState("");
  const create = () => {
    const t = now();
    const p: Project = { id: uid("proj"), name: "未命名项目", summary: "", example: false, createdAt: t, updatedAt: t, characters: [], relationships: [], plots: [], locations: [], adaptations: [] };
    wb.setState((s) => ({ ...s, projects: [...s.projects, p] }));
    navigate(href({ name: "project", id: p.id, tab: "overview", item: "" }));
  };
  const sorted = [...wb.state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <div className="wb-page">
      <header className="wb-page-head">
        <h1>我的项目</h1>
        <p className="wb-lede">创作项目包含角色、关系、情节、地点与设定改编。</p>
        <p className="wb-save-note">
          {SAVE_LABEL}。清除浏览器数据会删除项目，请定期导出 JSON 备份。
        </p>
      </header>
      <div className="wb-actions">
        <button className="wb-btn wb-btn-primary" onClick={create}>
          <Plus size={16} aria-hidden="true" /> 新建项目
        </button>
        <button className="wb-btn" onClick={() => fileRef.current?.click()}>
          <Upload size={16} aria-hidden="true" /> 导入 JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          data-testid="import-file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setError("");
            setMessage("");
            try {
              setPreview(parseImport(await f.text()));
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
      </div>
      {error && (
        <p className="wb-alert" role="alert">
          导入失败：{error}。现有项目未受影响。
        </p>
      )}
      {message && (
        <p className="wb-toast" role="status">
          {message}
          {undo && (
            <button
              className="wb-btn wb-btn-small"
              onClick={() => {
                wb.setState(undo);
                setUndo(null);
                setMessage("已撤销导入，项目恢复到导入前的状态。");
              }}
            >
              撤销导入
            </button>
          )}
        </p>
      )}
      {preview && (
        <ImportDialog
          preview={preview}
          onCancel={() => setPreview(null)}
          onConfirm={() => {
            setUndo(wb.state);
            wb.setState((s) => applyImport(s, preview));
            setMessage(`已导入 ${preview.projects.length} 个项目。`);
            setPreview(null);
          }}
        />
      )}
      <div className="wb-project-list">
        {sorted.map((p) => (
          <ProjectRow key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

function ImportDialog({ preview, onCancel, onConfirm }: { preview: ImportPreview; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  return (
    <dialog ref={ref} className="wb-modal" aria-labelledby="import-title" onClose={onCancel}>
      <h2 id="import-title">导入预览</h2>
      <p className="wb-muted">导入的项目会追加到现有项目之后；同 ID 的项目会以新 ID 保存，不覆盖现有内容。导入后可撤销。</p>
      <ul className="wb-list">
        {preview.projects.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>：{p.characters.length} 个角色、{p.relationships.length} 条关系、{p.plots.length} 条情节、{p.adaptations.length} 条设定改编
          </li>
        ))}
      </ul>
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

// ---------------- One project ----------------
export function ProjectView({ project, tab, item, wb }: { project: Project; tab: ProjectTab; item: string; wb: WorkbenchApi }) {
  const update = (fn: (p: Project) => Project) => wb.updateProject(project.id, (p) => touch(fn(p)));
  const go = (t: ProjectTab, it = "", replace = true) => navigate(href({ name: "project", id: project.id, tab: t, item: it }), { replace });
  return (
    <div className="wb-page wb-project">
      <nav className="wb-crumbs" aria-label="位置">
        <a href="#/projects">我的项目</a> / {project.name}
      </nav>
      <header className="wb-project-head">
        <div>
          <h1>
            {project.name} {project.example && <span className="wb-badge wb-badge-original">原创示例</span>}
          </h1>
          <p className="wb-save-note" data-testid="save-status">
            {SAVE_LABEL}
            {wb.savedAt ? ` · 已保存 ${wb.savedAt}` : ""}
          </p>
        </div>
        <div className="wb-actions">
          <button className="wb-btn" onClick={() => download(`${fileSafe(project.name)}.md`, projectMarkdown(project), "text/markdown;charset=utf-8")}>
            <Download size={16} aria-hidden="true" /> 导出 Markdown
          </button>
          <button className="wb-btn" onClick={() => download(`${fileSafe(project.name)}.json`, projectJson(project), "application/json")}>
            <FileJson size={16} aria-hidden="true" /> 导出 JSON
          </button>
          <button
            className="wb-btn wb-btn-danger"
            onClick={() => {
              if (!window.confirm(`删除项目“${project.name}”？此操作无法撤销，建议先导出 JSON。`)) return;
              wb.setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== project.id) }));
              navigate("#/projects");
            }}
          >
            <Trash2 size={16} aria-hidden="true" /> 删除项目
          </button>
        </div>
      </header>
      <div className="wb-tabs" role="tablist" aria-label="项目内容">
        {projectTabs.map(([t, label]) => (
          <a
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`wb-tab ${tab === t ? "active" : ""}`}
            href={href({ name: "project", id: project.id, tab: t, item: "" })}
            onClick={(e) => (e.preventDefault(), go(t))}
          >
            {label}
            <span className="wb-tab-count">{countFor(project, t)}</span>
          </a>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "overview" && <Overview project={project} update={update} go={go} />}
        {tab === "characters" && <Characters project={project} update={update} item={item} go={go} />}
        {tab === "relationships" && <Relationships project={project} update={update} />}
        {tab === "plots" && <Plots project={project} update={update} item={item} go={go} />}
        {tab === "locations" && <Locations project={project} update={update} />}
        {tab === "settings" && <Settings project={project} update={update} item={item} />}
      </div>
    </div>
  );
}

const countFor = (p: Project, t: ProjectTab) =>
  t === "characters" ? p.characters.length : t === "relationships" ? p.relationships.length : t === "plots" ? p.plots.length : t === "locations" ? p.locations.length : t === "settings" ? p.adaptations.length : "";

type Upd = (fn: (p: Project) => Project) => void;
type Go = (t: ProjectTab, item?: string, replace?: boolean) => void;

function Field({ label, value, onChange, rows = 2, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="wb-field">
      <span>{label}</span>
      {rows <= 1 ? (
        <input className="wb-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <textarea className="wb-input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function EntryPicker({ selected, onChange, label = "相关设定" }: { selected: string[]; onChange: (v: string[]) => void; label?: string }) {
  return (
    <div className="wb-field">
      <span>{label}</span>
      <p className="wb-tags">
        {selected.map((s) => (
          <span key={s} className="wb-tag wb-tag-entry">
            <a href={href({ name: "entry", slug: s, tab: "body" })}>{getEntry(s)?.zh ?? s}</a>
            <button aria-label={`移除 ${getEntry(s)?.zh ?? s}`} onClick={() => onChange(selected.filter((x) => x !== s))}>
              ×
            </button>
          </span>
        ))}
      </p>
      <select
        className="wb-input"
        aria-label={`添加${label}`}
        value=""
        onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
      >
        <option value="">添加设定条目…</option>
        {deepEntries
          .filter((e) => !selected.includes(e.slug))
          .map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.zh} {e.en}
            </option>
          ))}
      </select>
    </div>
  );
}

function Overview({ project, update, go }: { project: Project; update: Upd; go: Go }) {
  return (
    <div className="wb-overview">
      {project.image && <Art src={project.image} focus="50% 60%" alt="雾中港口小城与石砌灯塔" className="wb-project-cover" />}
      {project.example && <BlockView b={{ p: "editorial", text: "原创示例：本项目的人物、地点、关系与情节均为原创，不代表官方设定。引用条目的原始内容保留在“设定改编”中，与本项目的改动分开显示。" }} />}
      <div className="wb-form">
        <Field label="项目名称" rows={1} value={project.name} onChange={(v) => update((p) => ({ ...p, name: v || "未命名项目" }))} />
        <Field label="项目简介" rows={4} value={project.summary} onChange={(v) => update((p) => ({ ...p, summary: v }))} />
      </div>
      <div className="wb-stat-grid">
        {(
          [
            ["characters", "角色", project.characters.length],
            ["relationships", "关系", project.relationships.length],
            ["plots", "情节", project.plots.length],
            ["locations", "地点", project.locations.length],
            ["settings", "设定改编", project.adaptations.length],
          ] as const
        ).map(([t, label, n]) => (
          <button key={t} className="wb-stat" onClick={() => go(t, "", false)}>
            <strong>{n}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="wb-muted">
        创建于 {fmtDate(project.createdAt)} · 更新于 {fmtDate(project.updatedAt)}
      </p>
    </div>
  );
}

const charFields: [keyof Character, string, number][] = [
  ["appearance", "外貌", 2],
  ["identity", "身份", 2],
  ["history", "经历", 3],
  ["motivation", "动机", 2],
  ["desire", "欲望", 2],
  ["secret", "秘密", 2],
  ["abilities", "能力", 2],
  ["limits", "限制", 2],
  ["notes", "备注", 2],
];

function Characters({ project, update, item, go }: { project: Project; update: Upd; item: string; go: Go }) {
  const current = project.characters.find((c) => c.id === item) ?? project.characters[0];
  const set = (patch: Partial<Character>) =>
    current && update((p) => ({ ...p, characters: p.characters.map((c) => (c.id === current.id ? { ...c, ...patch } : c)) }));
  const add = () => {
    const c: Character = { id: uid("c"), name: "新角色", appearance: "", identity: "", history: "", motivation: "", desire: "", secret: "", abilities: "", limits: "", notes: "", entrySlugs: [] };
    update((p) => ({ ...p, characters: [...p.characters, c] }));
    go("characters", c.id);
  };
  const rels = current ? project.relationships.filter((r) => r.from === current.id || r.to === current.id) : [];
  const nameOf = (id: string) => project.characters.find((c) => c.id === id)?.name ?? "（已删除）";
  return (
    <div className="wb-split">
      <div className="wb-list-pane">
        <button className="wb-btn wb-btn-primary" onClick={add}>
          <Plus size={16} aria-hidden="true" /> 添加角色
        </button>
        <ul className="wb-pick-list" aria-label="角色列表">
          {project.characters.map((c) => (
            <li key={c.id}>
              <button className={c.id === current?.id ? "active" : ""} aria-current={c.id === current?.id} onClick={() => go("characters", c.id)}>
                {c.image ? <Art src={c.image} focus="50% 25%" alt="" className="wb-avatar" /> : <span className="wb-avatar wb-thumb-empty" aria-hidden="true" />}
                <span>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {current ? (
        <div className="wb-editor" key={current.id}>
          <div className="wb-editor-head">
            {current.image && <Art src={current.image} focus="50% 25%" alt={`${current.name} 的形象`} className="wb-portrait" />}
            <div className="wb-form">
              <Field label="名称" rows={1} value={current.name} onChange={(v) => set({ name: v || "未命名角色" })} />
            </div>
          </div>
          <div className="wb-form wb-form-2">
            {charFields.map(([k, label, rows]) => (
              <Field key={k} label={label} rows={rows} value={String(current[k] ?? "")} onChange={(v) => set({ [k]: v } as Partial<Character>)} />
            ))}
          </div>
          <EntryPicker selected={current.entrySlugs} onChange={(v) => set({ entrySlugs: v })} />
          <section className="wb-section">
            <h3>相关人物与关系</h3>
            {rels.length ? (
              <ul className="wb-rel-list">
                {rels.map((r) => (
                  <li key={r.id}>
                    <strong>{nameOf(r.from)}</strong> → <strong>{nameOf(r.to)}</strong> <span className="wb-badge">{r.type}</span> {r.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="wb-muted">暂无关系。</p>
            )}
            <a className="wb-btn wb-btn-small" href={href({ name: "project", id: project.id, tab: "relationships", item: "" })}>
              添加关系
            </a>
          </section>
          <button
            className="wb-btn wb-btn-danger wb-btn-small"
            onClick={() => {
              if (!window.confirm(`删除角色“${current.name}”及其相关关系？`)) return;
              update((p) => ({
                ...p,
                characters: p.characters.filter((c) => c.id !== current.id),
                relationships: p.relationships.filter((r) => r.from !== current.id && r.to !== current.id),
                plots: p.plots.map((pl) => ({ ...pl, characterIds: pl.characterIds.filter((x) => x !== current.id) })),
              }));
              go("characters");
            }}
          >
            删除角色
          </button>
        </div>
      ) : (
        <p className="wb-empty">还没有角色。</p>
      )}
    </div>
  );
}

function Relationships({ project, update }: { project: Project; update: Upd }) {
  const chars = project.characters;
  const blank = { from: chars[0]?.id ?? "", to: chars[1]?.id ?? chars[0]?.id ?? "", type: relationTypes[0], description: "" };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const nameOf = (id: string) => chars.find((c) => c.id === id)?.name ?? "（已删除）";
  const submit = () => {
    if (!form.from || !form.to || form.from === form.to) return;
    if (editing) update((p) => ({ ...p, relationships: p.relationships.map((r) => (r.id === editing ? { ...r, ...form } : r)) }));
    else update((p) => ({ ...p, relationships: [...p.relationships, { id: uid("r"), ...form }] }));
    setEditing(null);
    setForm(blank);
  };
  return (
    <div className="wb-rel">
      <p className="wb-muted">关系是有方向的：从“谁”指向“谁”，并写明具体内容，例如谁保护谁、谁亏欠谁、谁掌握谁的秘密。</p>
      <ul className="wb-rel-list wb-rel-cards">
        {project.relationships.map((r) => (
          <li key={r.id} data-testid="relationship">
            <div>
              <strong>{nameOf(r.from)}</strong> <span aria-label="指向">→</span> <strong>{nameOf(r.to)}</strong> <span className="wb-badge">{r.type}</span>
            </div>
            <p>{r.description}</p>
            <div className="wb-row-actions">
              <button className="wb-btn wb-btn-small" onClick={() => (setEditing(r.id), setForm({ from: r.from, to: r.to, type: r.type, description: r.description }))}>
                编辑
              </button>
              <button className="wb-btn wb-btn-small wb-btn-danger" onClick={() => update((p) => ({ ...p, relationships: p.relationships.filter((x) => x.id !== r.id) }))}>
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      {chars.length < 2 ? (
        <p className="wb-empty">至少需要两个角色才能添加关系。</p>
      ) : (
        <form
          className="wb-form wb-rel-form"
          aria-label={editing ? "编辑关系" : "添加关系"}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <h3>{editing ? "编辑关系" : "添加关系"}</h3>
          <div className="wb-form-row">
            <label className="wb-field">
              <span>从</span>
              <select className="wb-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                {chars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wb-field">
              <span>关系类型</span>
              <select className="wb-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {relationTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="wb-field">
              <span>指向</span>
              <select className="wb-input" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
                {chars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Field label="具体内容" rows={2} value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="例如：知道对方的契约，并以此要求对方办事。" />
          {form.from === form.to && <p className="wb-muted">起点与指向不能是同一个角色。</p>}
          <div className="wb-actions">
            <button className="wb-btn wb-btn-primary" type="submit" disabled={form.from === form.to}>
              {editing ? "保存关系" : "添加关系"}
            </button>
            {editing && (
              <button className="wb-btn" type="button" onClick={() => (setEditing(null), setForm(blank))}>
                取消编辑
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Plots({ project, update, item, go }: { project: Project; update: Upd; item: string; go: Go }) {
  const current = project.plots.find((p) => p.id === item) ?? project.plots[0];
  const set = (patch: Partial<Plot>) => current && update((p) => ({ ...p, plots: p.plots.map((x) => (x.id === current.id ? { ...x, ...patch } : x)) }));
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  return (
    <div className="wb-split">
      <div className="wb-list-pane">
        <button
          className="wb-btn wb-btn-primary"
          onClick={() => {
            const pl: Plot = { id: uid("p"), title: "新情节", cause: "", conflict: "", consequence: "", characterIds: [], locationIds: [], entrySlugs: [] };
            update((p) => ({ ...p, plots: [...p.plots, pl] }));
            go("plots", pl.id);
          }}
        >
          <Plus size={16} aria-hidden="true" /> 添加情节
        </button>
        <ul className="wb-pick-list" aria-label="情节列表">
          {project.plots.map((pl) => (
            <li key={pl.id}>
              <button className={pl.id === current?.id ? "active" : ""} aria-current={pl.id === current?.id} onClick={() => go("plots", pl.id)}>
                <span>{pl.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {current ? (
        <div className="wb-editor" key={current.id}>
          <div className="wb-form">
            <Field label="标题" rows={1} value={current.title} onChange={(v) => set({ title: v || "未命名情节" })} />
            <Field label="起因" rows={3} value={current.cause} onChange={(v) => set({ cause: v })} />
            <Field label="冲突" rows={3} value={current.conflict} onChange={(v) => set({ conflict: v })} />
            <Field label="后果" rows={3} value={current.consequence} onChange={(v) => set({ consequence: v })} />
          </div>
          <fieldset className="wb-check-group">
            <legend>关联人物</legend>
            {project.characters.map((c) => (
              <label key={c.id}>
                <input type="checkbox" checked={current.characterIds.includes(c.id)} onChange={() => set({ characterIds: toggle(current.characterIds, c.id) })} />
                {c.name}
              </label>
            ))}
          </fieldset>
          <fieldset className="wb-check-group">
            <legend>关联地点</legend>
            {project.locations.length ? (
              project.locations.map((l) => (
                <label key={l.id}>
                  <input type="checkbox" checked={current.locationIds.includes(l.id)} onChange={() => set({ locationIds: toggle(current.locationIds, l.id) })} />
                  {l.name}
                </label>
              ))
            ) : (
              <span className="wb-muted">暂无地点，可在“地点”中添加。</span>
            )}
          </fieldset>
          <EntryPicker selected={current.entrySlugs} onChange={(v) => set({ entrySlugs: v })} label="关联设定" />
          <button
            className="wb-btn wb-btn-danger wb-btn-small"
            onClick={() => {
              if (!window.confirm(`删除情节“${current.title}”？`)) return;
              update((p) => ({ ...p, plots: p.plots.filter((x) => x.id !== current.id) }));
              go("plots");
            }}
          >
            删除情节
          </button>
        </div>
      ) : (
        <p className="wb-empty">还没有情节。</p>
      )}
    </div>
  );
}

function Locations({ project, update }: { project: Project; update: Upd }) {
  const set = (id: string, patch: Partial<Project["locations"][number]>) => update((p) => ({ ...p, locations: p.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  return (
    <div>
      <button className="wb-btn wb-btn-primary" onClick={() => update((p) => ({ ...p, locations: [...p.locations, { id: uid("l"), name: "新地点", description: "", entrySlugs: [] }] }))}>
        <Plus size={16} aria-hidden="true" /> 添加地点
      </button>
      <div className="wb-loc-list">
        {project.locations.map((l) => (
          <div key={l.id} className="wb-loc">
            <Field label="名称" rows={1} value={l.name} onChange={(v) => set(l.id, { name: v || "未命名地点" })} />
            <Field label="描述" rows={2} value={l.description} onChange={(v) => set(l.id, { description: v })} />
            <EntryPicker selected={l.entrySlugs} onChange={(v) => set(l.id, { entrySlugs: v })} />
            <button
              className="wb-btn wb-btn-small wb-btn-danger"
              onClick={() =>
                update((p) => ({ ...p, locations: p.locations.filter((x) => x.id !== l.id), plots: p.plots.map((pl) => ({ ...pl, locationIds: pl.locationIds.filter((x) => x !== l.id) })) }))
              }
            >
              删除地点
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings({ project, update, item }: { project: Project; update: Upd; item: string }) {
  useEffect(() => {
    if (item) document.getElementById(`adapt-${item}`)?.scrollIntoView({ block: "start" });
  }, [item]);
  const set = (slug: string, patch: { adopted?: string; changed?: string }) =>
    update((p) => ({ ...p, adaptations: p.adaptations.map((a) => (a.slug === slug ? { ...a, ...patch } : a)) }));
  return (
    <div>
      <p className="wb-muted">
        每条设定分两部分：上方是原始条目的摘要与来源（只读）；下方是本项目的采用与改动，单独保存，不会修改原条目。<a href="#/browse">浏览资料</a>并使用“收藏到项目”添加更多设定。
      </p>
      {project.adaptations.length === 0 && <p className="wb-empty">还没有收藏设定。</p>}
      {project.adaptations.map((a) => {
        const e = getEntry(a.slug);
        return (
          <section key={a.slug} id={`adapt-${a.slug}`} className={`wb-adapt ${item === a.slug ? "highlight" : ""}`} data-testid="adaptation">
            <div className="wb-adapt-source">
              {e ? <EntryCard entry={e} /> : <p>条目“{a.slug}”已不存在。</p>}
              {e && (
                <p className="wb-muted wb-small">
                  来源：
                  {e.sources
                    .map(([sid, loc]) => `${sources[sid]?.title.split("（")[0] ?? sid}${loc ? ` ${loc}` : ""}`)
                    .join("；")}
                  · 版本 {e.edition}
                </p>
              )}
            </div>
            <div className="wb-adapt-notes">
              <span className="wb-prov-label wb-prov-label-original">本项目内容</span>
              <Field label="本项目采用" rows={2} value={a.adopted} onChange={(v) => set(a.slug, { adopted: v })} />
              <Field label="本项目改动" rows={2} value={a.changed} onChange={(v) => set(a.slug, { changed: v })} />
              <button className="wb-btn wb-btn-small wb-btn-danger" onClick={() => update((p) => ({ ...p, adaptations: p.adaptations.filter((x) => x.slug !== a.slug) }))}>
                从项目移除
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
