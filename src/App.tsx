import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  Backpack,
  ScrollText,
  Users,
  Plus,
  Search,
  ChevronRight,
  Shield,
  Heart,
  Sparkles,
  Download,
  Upload,
  Printer,
  Copy,
  Trash2,
  X,
  Moon,
  Sun,
  Dice5,
  Check,
  Compass,
  Feather,
} from "lucide-react";
import * as R from "./rules";
import type { Ability, Character, Entry } from "./rules";
import conditionData from "./data/Conditions.json";
const conditionNames: Record<string, string> = {
  blinded: "目盲",
  charmed: "魅惑",
  deafened: "耳聋",
  exhaustion: "力竭",
  frightened: "恐慌",
  grappled: "受擒",
  incapacitated: "失能",
  invisible: "隐形",
  paralyzed: "麻痹",
  petrified: "石化",
  poisoned: "中毒",
  prone: "倒地",
  restrained: "束缚",
  stunned: "震慑",
  unconscious: "昏迷",
};
const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((i) => i !== id) : [...list, id];
const entryTitle = (e: Entry) => (e.zh ? `${e.zh} · ${e.name}` : e.name);
const clamp = (n: number, min = 0, max = 9999) =>
  Math.min(max, Math.max(min, Math.floor(Number.isFinite(n) ? n : 0)));
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Num({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
      />
    </Field>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      className={wide ? "wide" : ""}
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="关闭弹窗">
          <X size={20} />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}
function Section({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Wizard({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Character) => void;
}) {
  const [step, setStep] = useState(0),
    [name, setName] = useState(""),
    [race, setRace] = useState("human"),
    [cls, setCls] = useState("wizard"),
    [bg, setBg] = useState("侍僧 Acolyte"),
    [mode, setMode] = useState<"array" | "point">("array");
  const [base, setBase] = useState<Record<Ability, number>>({
    str: 8,
    dex: 14,
    con: 13,
    int: 15,
    wis: 12,
    cha: 10,
  });
  const [chosen, setChosen] = useState<string[]>([]);
  const cl = R.classes.find((c) => c.index === cls)!;
  const choice = cl.proficiency_choices[0];
  const allowed =
    (choice?.from as { options?: { item?: { index: string } }[] }).options
      ?.map((x) => x.item?.index.replace("skill-", ""))
      .filter((x): x is string => Boolean(x)) ?? [];
  const valid = R.validateAbilities(Object.values(base), mode);
  const raceObj = R.races.find((r) => r.index === race)!;
  const preview = R.createCharacter(name, race, cls, base, chosen);
  return (
    <Modal title="写下新的冒险" onClose={onClose} wide>
      <div className="wizard-steps">
        {["身份与来历", "六项属性", "整装出发"].map((s, i) => (
          <span className={step === i ? "current" : ""} key={s}>
            <b>{i + 1}</b>
            {s}
          </span>
        ))}
      </div>
      {step === 0 ? (
        <>
          <p className="muted">
            从一张角色卡开始。所有选择均基于 2014 版开放规则，不混用 2024 版。
          </p>
          <Field label="角色姓名">
            <input
              autoFocus
              value={name}
              maxLength={80}
              placeholder="旅人的名字"
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="grid two">
            <Field label="种族 Race">
              <select value={race} onChange={(e) => setRace(e.target.value)}>
                {R.races.map((r) => (
                  <option key={r.index} value={r.index}>
                    {R.raceNames[r.index]} · {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="职业 Class">
              <select
                value={cls}
                onChange={(e) => {
                  setCls(e.target.value);
                  setChosen([]);
                }}
              >
                {R.classes.map((c) => (
                  <option key={c.index} value={c.index}>
                    {R.classNames[c.index]} · {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="背景 Background">
            <select value={bg} onChange={(e) => setBg(e.target.value)}>
              <option>侍僧 Acolyte</option>
              <option>自定义背景（手动配置）</option>
            </select>
          </Field>
          <div className="notice">
            {bg.startsWith("侍僧")
              ? "侍僧提供洞悉、宗教熟练。语言、背景特性、起始装备与金币请按团规手动填写。"
              : "自定义背景的熟练、语言、装备和金币需在角色卡手动填写。"}
            <br />
            种族固定属性加值自动计入；亚种族、半精灵自选加值、种族特性与职业能力请手动记录。
            {raceObj.traits.length > 0 && (
              <>
                <br />
                种族特性参考：{raceObj.traits.map((t) => t.name).join(" · ")}
              </>
            )}
          </div>
          <h3>职业技能 · 选择 {choice?.choose ?? 0} 项</h3>
          <p className="muted small">
            与背景重复的熟练，创建后可在技能区换成其他熟练。
          </p>
          <div className="check-grid">
            {allowed.map((id) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={chosen.includes(id)}
                  disabled={
                    !chosen.includes(id) &&
                    chosen.length >= (choice?.choose ?? 0)
                  }
                  onChange={() => setChosen(toggle(chosen, id))}
                />
                {R.skillNames[id] ?? id}
              </label>
            ))}
          </div>
        </>
      ) : step === 1 ? (
        <>
          <div className="segmented">
            <button
              className={mode === "array" ? "selected" : ""}
              onClick={() => {
                setMode("array");
                setBase({
                  str: 8,
                  dex: 14,
                  con: 13,
                  int: 15,
                  wis: 12,
                  cha: 10,
                });
              }}
            >
              标准数组
            </button>
            <button
              className={mode === "point" ? "selected" : ""}
              onClick={() => {
                setMode("point");
                setBase({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
              }}
            >
              27 点购点
            </button>
          </div>
          <p className="muted">
            {mode === "array"
              ? "将 15、14、13、12、10、8 各分配一次。"
              : "加值前各项 8–15；14 花费 7 点，15 花费 9 点。可保留未使用点数。"}
          </p>
          <div className="ability-assign">
            {R.abilities.map((a) => {
              const bonus =
                raceObj.ability_bonuses.find((b) => b.ability_score.index === a)
                  ?.bonus ?? 0;
              return (
                <Field
                  key={a}
                  label={`${R.abilityNames[a]} ${a.toUpperCase()}`}
                  hint={`种族 +${bonus} → ${base[a] + bonus}`}
                >
                  <select
                    value={base[a]}
                    onChange={(e) =>
                      setBase({ ...base, [a]: Number(e.target.value) })
                    }
                  >
                    {(mode === "array"
                      ? [8, 10, 12, 13, 14, 15]
                      : [8, 9, 10, 11, 12, 13, 14, 15]
                    ).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Field>
              );
            })}
          </div>
          <div role="status" className={valid ? "notice" : "notice error"}>
            {mode === "point"
              ? `已用 ${R.pointTotal(Object.values(base))} / 27 点`
              : valid
                ? "标准数组分配有效"
                : "每个数值只能使用一次，请调整重复项。"}
          </div>
        </>
      ) : (
        <>
          <div className="creation-summary">
            <div className="character-emblem">
              <Dice5 size={42} />
            </div>
            <h2>{name}</h2>
            <p>
              {R.raceNames[race]} · 1 级{R.classNames[cls]} · {bg}
            </p>
            <div className="summary-stats">
              <span>
                <b>{R.maxHP(preview)}</b>生命上限
              </span>
              <span>
                <b>{R.armorClass(preview)}</b>无甲 AC
              </span>
              <span>
                <b>+2</b>熟练加值
              </span>
            </div>
          </div>
          <div className="notice">
            这是一张可编辑的基础角色卡，不自动完成亚种族、专长、子职、升级特性或兼职。HP
            使用首级满骰、以后固定平均值；装备、初始金币与法术待你选择。请与 DM
            核对。
          </div>
        </>
      )}
      <div className="dialog-actions">
        <button
          className="btn"
          onClick={() => (step ? setStep(step - 1) : onClose())}
        >
          {step ? "上一步" : "取消"}
        </button>
        {step < 2 ? (
          <button
            className="btn primary"
            disabled={
              step === 0
                ? !name.trim() || chosen.length !== (choice?.choose ?? 0)
                : !valid
            }
            onClick={() => setStep(step + 1)}
          >
            下一步 <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn primary"
            onClick={() => {
              const c = R.createCharacter(name, race, cls, base, chosen);
              c.background = bg;
              if (!bg.startsWith("侍僧")) c.skillProfs = chosen;
              onCreate(c);
            }}
          >
            创建角色 <Check size={16} />
          </button>
        )}
      </div>
    </Modal>
  );
}

export default function App({
  initialView = "sheet",
  initialQuery = "",
  onNavigate,
}: {
  initialView?: string;
  initialQuery?: string;
  onNavigate?: (view: string) => void;
}) {
  const [initial] = useState(R.loadState);
  const [state, setState] = useState(initial.state),
    [blocked, setBlocked] = useState(Boolean(initial.warning)),
    [saveError, setSaveError] = useState(initial.warning),
    [view, setView] = useState(initialView),
    [tab, setTab] = useState("overview");
  const [wizard, setWizard] = useState(false),
    [detail, setDetail] = useState<Entry | null>(null),
    [about, setAbout] = useState(false),
    [rest, setRest] = useState<"short" | "long" | null>(null),
    [custom, setCustom] = useState(false),
    [toast, setToast] = useState("");
  const [amount, setAmount] = useState(1),
    [restDice, setRestDice] = useState(1),
    [restHealing, setRestHealing] = useState(1),
    [query, setQuery] = useState(initialQuery),
    [levelFilter, setLevelFilter] = useState("all"),
    [classFilter, setClassFilter] = useState("all"),
    [category, setCategory] = useState("all"),
    [schoolFilter, setSchoolFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const c =
    state.characters.find((x) => x.id === state.activeId) ??
    state.characters[0];
  useEffect(() => {
    if (blocked) return;
    try {
      R.persist(state);
      setSaveError("");
    } catch {
      setSaveError(
        "保存失败：浏览器存储空间不足或已被禁用。请立即导出备份，避免丢失修改。",
      );
    }
  }, [state, blocked]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  function update(p: Partial<Character>) {
    if (!c) return;
    setState((s) => ({
      ...s,
      characters: s.characters.map((x) => (x.id === c.id ? { ...x, ...p } : x)),
    }));
  }
  function addCharacter(n: Character) {
    if (state.characters.length >= 100) {
      setToast("最多支持 100 个角色，请先导出并整理。");
      return;
    }
    setState((s) => ({
      ...s,
      characters: [...s.characters, n],
      activeId: n.id,
    }));
    setWizard(false);
    setView("sheet");
    setTab("overview");
    setToast("角色已加入冒险队伍");
  }
  function addEntry(e: Entry) {
    if (!c) {
      setToast("请先创建或选择一个角色");
      return;
    }
    if (e.kind === "spell" || (e.kind === "custom" && e.level !== undefined)) {
      if (c.spellIds.includes(e.index)) {
        setToast("已在角色法术列表中");
        return;
      }
      update({ spellIds: [...c.spellIds, e.index] });
    } else {
      const old = c.inventory.find((i) => i.id === e.index);
      update({
        inventory: old
          ? c.inventory.map((i) =>
              i.id === e.index ? { ...i, qty: Math.min(9999, i.qty + 1) } : i,
            )
          : [...c.inventory, { id: e.index, qty: 1, equipped: false }],
      });
    }
    setToast(`已添加到 ${c.name}`);
  }
  function backup() {
    download("旅人手札-backup.json", JSON.stringify(state, null, 2));
    setToast("备份已导出，请妥善保管");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw Error("文件超过 5 MB");
      const imported = R.parseBackup(await file.text());
      if (
        !confirm(
          `导入 ${imported.characters.length} 个角色将替换当前本地存档。建议先导出备份。继续？`,
        )
      )
        return;
      setState(imported);
      setBlocked(false);
      setSaveError("");
      setToast("备份导入成功");
    } catch (err) {
      setToast(
        `导入失败：${err instanceof Error ? (err.message.length > 160 ? "备份结构或数值无效，请使用本应用导出的 v1 JSON。" : err.message) : "文件无效"}`,
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  const entries = [...R.allEntries, ...((c?.custom ?? []) as Entry[])];
  function entry(id: string) {
    return entries.find((e) => e.index === id);
  }
  function itemEntry(id: string) {
    return (
      R.items.find((e) => e.index === id) ??
      c?.custom.find((e) => e.index === id)
    );
  }
  const currentSpells =
    c?.spellIds.map(entry).filter((e): e is Entry => Boolean(e)) ?? [];
  const catalog = (view === "spells" ? R.spells : R.items).filter((e) => {
    const text = [e.name, e.zh, e.index, ...(e.desc ?? [])]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (view !== "spells" ||
        ((levelFilter === "all" || e.level === Number(levelFilter)) &&
          (classFilter === "all" ||
            e.classes?.some((x) => x.index === classFilter)) &&
          (schoolFilter === "all" || e.school?.index === schoolFilter))) &&
      (view !== "items" ||
        category === "all" ||
        (category === "magic"
          ? e.kind === "magic"
          : e.equipment_category?.index === category))
    );
  });
  const [page, setPage] = useState(1);
  useEffect(
    () => setPage(1),
    [view, query, levelFilter, classFilter, category, schoolFilter],
  );
  const navigate = (v: string) => {
    if (onNavigate) {
      onNavigate(v);
      return;
    }
    setView(v);
    setQuery("");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="旅人手札首页"
        >
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <span>
            旅人手札<small>THE WAYFARER’S COMPANION</small>
          </span>
        </a>
        <div className="edition">
          5E · 2014 EDITION <span>SRD 5.1</span>
        </div>
        <div className="nav-label">冒险工作台</div>
        <nav aria-label="主导航">
          {[
            { id: "sheet", name: "角色手札", sub: "CHARACTERS", icon: Users },
            {
              id: "spells",
              name: "法术典籍",
              sub: "SPELL COMPENDIUM",
              icon: BookOpen,
            },
            {
              id: "items",
              name: "装备宝库",
              sub: "EQUIPMENT & MAGIC",
              icon: Backpack,
            },
          ].map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={21} />
              <span>
                {n.name}
                <small>{n.sub}</small>
              </span>
              {view === n.id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="party-head">
          <span>
            我的旅人 <b>{state.characters.length}</b>
          </span>
          <button
            className="icon-btn"
            aria-label="新建角色"
            onClick={() => setWizard(true)}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="party-list">
          {state.characters.map((ch) => (
            <button
              className={`party-member ${c?.id === ch.id ? "chosen" : ""}`}
              key={ch.id}
              onClick={() => {
                setState((s) => ({ ...s, activeId: ch.id }));
                navigate("sheet");
              }}
            >
              <span className="avatar">{ch.name.slice(0, 1)}</span>
              <span>
                {ch.name}
                <small>
                  Lv.{ch.level} · {R.classNames[ch.classId] ?? ch.classId}
                </small>
              </span>
              {c?.id === ch.id && <span className="active-dot" />}
            </button>
          ))}
          {!state.characters.length && (
            <p className="sidebar-empty">空白的一页，等待你的故事。</p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="local-note">
            <span className="active-dot" />
            <span>
              只在这台设备保存<small>无需账号 · 没有云端同步</small>
            </span>
          </div>
          <button className="text-btn" onClick={() => setAbout(true)}>
            <ScrollText size={16} /> 规则范围与开放许可
          </button>
          <a href="https://grot666.github.io/" className="back-link">
            ← 返回博客
          </a>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            冒险工作台 <ChevronRight size={13} />{" "}
            <span>
              {view === "sheet"
                ? "角色手札"
                : view === "spells"
                  ? "法术典籍"
                  : "装备宝库"}
            </span>
          </div>
          <div className="toolbar">
            <span className={`save-status ${saveError ? "bad" : ""}`}>
              <span className="active-dot" />
              {saveError ? "保存需注意" : "本地自动保存"}
            </span>
            <button
              className="icon-btn"
              title="导入 JSON 备份"
              aria-label="导入备份"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={18} />
            </button>
            <button
              className="icon-btn"
              title="导出全部角色 JSON"
              aria-label="导出备份"
              onClick={backup}
            >
              <Download size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
          </div>
        </header>
        <main>
          {saveError && (
            <div role="alert" className="notice error">
              {saveError}
              {blocked && (
                <div className="button-row">
                  <button
                    className="btn"
                    onClick={() =>
                      download(
                        "损坏存档-original.json",
                        localStorage.getItem(R.STORAGE_KEY) ?? "",
                      )
                    }
                  >
                    下载原始存档
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (confirm("确定丢弃损坏存档并保存当前状态？")) {
                        setBlocked(false);
                        setState({ ...state });
                      }
                    }}
                  >
                    重置损坏存档
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {view === "sheet"
                  ? "EVERY ADVENTURE STARTS WITH A CHARACTER"
                  : view === "spells"
                    ? "KNOWLEDGE IS ITS OWN KIND OF MAGIC"
                    : "PACK LIGHT. ADVENTURE FAR."}
              </div>
              <h1>
                {view === "sheet"
                  ? "你的冒险，由此落笔。"
                  : view === "spells"
                    ? "翻开法术典籍。"
                    : "下一段旅途，准备妥当。"}
              </h1>
              <p>
                {view === "sheet"
                  ? "记录每一次成长，也留住旅途中的细枝末节。"
                  : view === "spells"
                    ? `${R.spells.length} 道开放规则法术 · 英文原文离线可查 · 常用名称中文检索`
                    : `${R.items.length} 件装备与魔法物品 · 将需要的带在身边`}
              </p>
            </div>
            {view === "sheet" ? (
              <button className="btn primary" onClick={() => setWizard(true)}>
                <Plus size={17} /> 新的旅人
              </button>
            ) : (
              <span className="source-tag">
                <BookOpen size={15} /> SRD 5.1 · 2014
              </span>
            )}
          </div>
          {state.characters.length > 0 && (
            <label className="mobile-character-select">
              <span>当前旅人</span>
              <select
                aria-label="切换角色"
                value={c?.id ?? ""}
                onChange={(e) =>
                  setState((s) => ({ ...s, activeId: e.target.value }))
                }
              >
                {state.characters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} · Lv.{ch.level} {R.classNames[ch.classId]}
                  </option>
                ))}
              </select>
              <button
                className="icon-btn"
                aria-label="新建另一角色"
                onClick={() => setWizard(true)}
              >
                <Plus size={18} />
              </button>
            </label>
          )}
          {view === "sheet" ? (
            !c ? (
              <section className="empty-hero">
                <div className="hero-art">
                  <Compass size={120} strokeWidth={0.6} />
                  <span className="orbit one" />
                  <span className="orbit two" />
                  <i>✦</i>
                </div>
                <span className="eyebrow">A BLANK PAGE. AN OPEN ROAD.</span>
                <h2>每一个传奇，都始于一个名字。</h2>
                <p>
                  创建你的第一位旅人，管理生命、法术与行囊。
                  <br />
                  规则已在手边，故事由你书写。
                </p>
                <button className="btn primary" onClick={() => setWizard(true)}>
                  <Feather size={18} /> 创建第一位角色
                </button>
                <div className="empty-features">
                  <span>
                    <Shield size={18} /> 清晰的角色卡
                  </span>
                  <span>
                    <Sparkles size={18} /> {R.spells.length} 道法术
                  </span>
                  <span>
                    <Backpack size={18} /> {R.items.length} 件物品
                  </span>
                </div>
                <p className="small muted">
                  所有数据仅存于此浏览器，请定期使用右上角导出备份。
                </p>
              </section>
            ) : (
              <>
                <section className="character-banner">
                  <div className="banner-main">
                    <div className="character-emblem">
                      <Dice5 size={38} />
                      <span>{c.level}</span>
                    </div>
                    <div>
                      <span className="eyebrow">
                        CHARACTER JOURNAL / 角色档案
                      </span>
                      <h2>{c.name}</h2>
                      <p>
                        {R.raceNames[c.race] ?? c.race} ·{" "}
                        {R.classNames[c.classId] ?? c.classId}{" "}
                        <span className="banner-dot">◆</span> {c.background}
                      </p>
                    </div>
                  </div>
                  <div className="banner-actions">
                    <button className="ghost" onClick={() => setRest("short")}>
                      <Sun size={16} /> 短休
                    </button>
                    <button className="ghost" onClick={() => setRest("long")}>
                      <Moon size={16} /> 长休
                    </button>
                    <button
                      className="ghost icon-btn"
                      onClick={() => window.print()}
                      aria-label="打印角色卡"
                    >
                      <Printer size={17} />
                    </button>
                  </div>
                </section>
                <div
                  className="sheet-tabs"
                  role="tablist"
                  aria-label="角色卡分区"
                >
                  {[
                    { id: "overview", name: "角色总览", icon: Users },
                    { id: "magic", name: "我的法术", icon: Sparkles },
                    { id: "bag", name: "行囊物品", icon: Backpack },
                    { id: "journal", name: "笔记与设置", icon: Feather },
                  ].map((t) => (
                    <button
                      role="tab"
                      aria-selected={tab === t.id}
                      className={tab === t.id ? "selected" : ""}
                      key={t.id}
                      onClick={() => setTab(t.id)}
                    >
                      <t.icon size={16} />
                      {t.name}
                      {t.id === "magic" && <b>{c.spellIds.length}</b>}
                      {t.id === "bag" && <b>{c.inventory.length}</b>}
                    </button>
                  ))}
                </div>
                <div
                  className={`tab-panel ${tab === "overview" ? "visible" : ""}`}
                >
                  <div className="stat-row">
                    <div className="stat">
                      <Shield />
                      <span>
                        护甲等级 <small>AC</small>
                      </span>
                      <strong>{R.armorClass(c)}</strong>
                      <small>装备 / 无甲 · 可覆盖</small>
                    </div>
                    <div className="stat">
                      <Dice5 />
                      <span>
                        先攻 <small>INITIATIVE</small>
                      </span>
                      <strong>
                        {R.signed(c.initiativeOverride ?? R.mod(c.scores.dex))}
                      </strong>
                      <small>敏捷调整值</small>
                    </div>
                    <div className="stat">
                      <Check />
                      <span>
                        熟练加值 <small>PROFICIENCY</small>
                      </span>
                      <strong>{R.signed(R.proficiency(c.level))}</strong>
                      <small>{c.level} 级角色</small>
                    </div>
                    <div className="stat">
                      <Compass />
                      <span>
                        被动察觉 <small>PERCEPTION</small>
                      </span>
                      <strong>{10 + R.skillBonus(c, "perception")}</strong>
                      <small>10 + 察觉加值</small>
                    </div>
                  </div>
                  <div className="sheet-grid">
                    <div className="main-col">
                      <Section title="六项属性" eyebrow="ABILITY SCORES">
                        <div className="abilities">
                          {R.abilities.map((a) => (
                            <div className="ability" key={a}>
                              <span>
                                {R.abilityNames[a]}
                                <small>{a.toUpperCase()}</small>
                              </span>
                              <strong>{R.signed(R.mod(c.scores[a]))}</strong>
                              <input
                                aria-label={`${R.abilityNames[a]}属性值`}
                                type="number"
                                min={1}
                                max={30}
                                value={c.scores[a]}
                                onChange={(e) =>
                                  update({
                                    scores: {
                                      ...c.scores,
                                      [a]: clamp(Number(e.target.value), 1, 30),
                                    },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                        <p className="footnote">
                          数值已含创建时的固定种族加值。升级属性、亚种族与自选加值请直接调整。
                        </p>
                      </Section>
                      <Section
                        title="技能与豁免"
                        eyebrow="CHECKS & SAVING THROWS"
                      >
                        <div className="saving-throws">
                          {R.abilities.map((a) => (
                            <label key={a}>
                              <input
                                type="checkbox"
                                checked={c.saveProfs.includes(a)}
                                onChange={() =>
                                  update({
                                    saveProfs: toggle(
                                      c.saveProfs,
                                      a,
                                    ) as Ability[],
                                  })
                                }
                              />
                              <span>{R.abilityNames[a]}</span>
                              <b>
                                {R.signed(
                                  R.mod(c.scores[a]) +
                                    (c.saveProfs.includes(a)
                                      ? R.proficiency(c.level)
                                      : 0),
                                )}
                              </b>
                            </label>
                          ))}
                        </div>
                        <div className="skill-list">
                          {R.skills.map((s) => (
                            <div className="skill" key={s.index}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={c.skillProfs.includes(s.index)}
                                  onChange={() =>
                                    update({
                                      skillProfs: toggle(c.skillProfs, s.index),
                                    })
                                  }
                                />
                                <span>
                                  {R.skillNames[s.index]}{" "}
                                  <small>
                                    {s.ability_score.index.toUpperCase()}
                                  </small>
                                </span>
                              </label>
                              <label
                                className="expertise"
                                title="双倍熟练；不自动授予职业资格"
                              >
                                <input
                                  type="checkbox"
                                  aria-label={`${R.skillNames[s.index]}专精`}
                                  disabled={!c.skillProfs.includes(s.index)}
                                  checked={c.expertise.includes(s.index)}
                                  onChange={() =>
                                    update({
                                      expertise: toggle(c.expertise, s.index),
                                    })
                                  }
                                />
                                专精
                              </label>
                              <b>{R.signed(R.skillBonus(c, s.index))}</b>
                            </div>
                          ))}
                        </div>
                        <p className="footnote">
                          复选框代表熟练。专精需自行核对资格；博学等半熟练特性未自动计入。
                        </p>
                      </Section>
                    </div>
                    <div className="side-col">
                      <Section
                        title="生命状态"
                        eyebrow="HIT POINTS"
                        action={<Heart size={20} className="red" />}
                      >
                        <div className="hp-display">
                          <strong data-testid="current-hp">{c.hp}</strong>
                          <span>
                            / {R.maxHP(c)}
                            <small>当前 / 最大生命</small>
                          </span>
                        </div>
                        <div className="hp-track">
                          <span
                            style={{
                              width: `${Math.min(100, (c.hp / R.maxHP(c)) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="grid two compact">
                          <Num
                            label="当前生命 HP"
                            value={c.hp}
                            onChange={(n) => update({ hp: n })}
                            max={R.maxHP(c)}
                          />
                          <Num
                            label="临时生命"
                            value={c.tempHp}
                            onChange={(n) => update({ tempHp: n })}
                          />
                        </div>
                        <div className="hp-control">
                          <input
                            aria-label="伤害或治疗数值"
                            type="number"
                            min={0}
                            max={9999}
                            value={amount}
                            onChange={(e) =>
                              setAmount(clamp(Number(e.target.value)))
                            }
                          />
                          <button
                            className="btn damage"
                            onClick={() => update(R.damage(c, amount))}
                          >
                            − 受伤
                          </button>
                          <button
                            className="btn heal"
                            onClick={() => update(R.heal(c, amount))}
                          >
                            + 治疗
                          </button>
                        </div>
                        <p className="footnote">
                          伤害先扣临时生命。瞬死、专注检定与抗性由玩家判断。
                        </p>
                        <div className="divider" />
                        <Num
                          label={`剩余生命骰 d${R.classOf(c).hit_die} / ${c.level}`}
                          value={c.hitDice}
                          max={c.level}
                          onChange={(n) => update({ hitDice: n })}
                        />
                        <h3>死亡豁免</h3>
                        {(["deathSuccess", "deathFailure"] as const).map(
                          (k, i) => (
                            <div className="death-row" key={k}>
                              <span>{i ? "失败" : "成功"}</span>
                              {[1, 2, 3].map((n) => (
                                <button
                                  key={n}
                                  className={`pip ${c[k] >= n ? "filled" : ""} ${i ? "fail" : ""}`}
                                  onClick={() =>
                                    update({ [k]: c[k] === n ? n - 1 : n })
                                  }
                                  aria-label={`${i ? "失败" : "成功"} ${n} 次`}
                                  aria-pressed={c[k] >= n}
                                />
                              ))}
                              {c[k] === 3 && <b>{i ? "死亡" : "稳定"}</b>}
                            </div>
                          ),
                        )}
                      </Section>
                      <Section title="当前状态" eyebrow="CONDITIONS">
                        <div className="condition-grid">
                          {conditionData.map((cond) => (
                            <button
                              key={cond.index}
                              title={cond.desc.join("\n")}
                              className={`condition ${c.conditions.includes(cond.index) ? "on" : ""}`}
                              aria-pressed={c.conditions.includes(cond.index)}
                              onClick={() =>
                                update({
                                  conditions: toggle(c.conditions, cond.index),
                                })
                              }
                            >
                              {conditionNames[cond.index] ?? cond.name}
                            </button>
                          ))}
                        </div>
                        <p className="footnote">
                          状态仅作标记，不自动应用效果；力竭等级请记入笔记。
                        </p>
                      </Section>
                      <div className="note-card">
                        <Feather size={23} />
                        <h3>好故事，值得备份。</h3>
                        <p>
                          存档不会离开你的设备。换浏览器或清理缓存前，记得导出。
                        </p>
                        <button className="text-btn" onClick={backup}>
                          导出角色备份 <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`tab-panel ${tab === "magic" ? "visible" : ""}`}
                >
                  <div className="grid two">
                    <Section title="施法概览" eyebrow="SPELLCASTING">
                      <div className="summary-stats">
                        <span>
                          <b>{R.abilityNames[R.castingAbility(c)]}</b>
                          默认施法属性
                        </span>
                        <span>
                          <b>
                            {8 +
                              R.proficiency(c.level) +
                              R.mod(c.scores[R.castingAbility(c)])}
                          </b>
                          豁免 DC
                        </span>
                        <span>
                          <b>
                            {R.signed(
                              R.proficiency(c.level) +
                                R.mod(c.scores[R.castingAbility(c)]),
                            )}
                          </b>
                          法术攻击
                        </span>
                      </div>
                      <p className="footnote">
                        无施法职业显示智力参考值，不授予施法资格。法术数量、仪式、材料与职业资格需自行核对。
                      </p>
                    </Section>
                    <Section
                      title={
                        c.classId === "warlock" ? "契约魔法法术位" : "法术位"
                      }
                      eyebrow="SPELL SLOTS"
                    >
                      <div className="slots">
                        {Object.entries(R.slots(c))
                          .filter(([, n]) => n > 0)
                          .map(([lv, n]) => (
                            <div className="slot-row" key={lv}>
                              <span>{lv} 环</span>
                              <div className="pips">
                                {Array.from({ length: n }, (_, i) => (
                                  <button
                                    key={i}
                                    aria-label={`${lv}环法术位 ${i + 1}`}
                                    aria-pressed={(c.slotsUsed[lv] ?? 0) > i}
                                    className={`pip ${(c.slotsUsed[lv] ?? 0) > i ? "filled" : ""}`}
                                    onClick={() =>
                                      update({
                                        slotsUsed: {
                                          ...c.slotsUsed,
                                          [lv]:
                                            (c.slotsUsed[lv] ?? 0) === i + 1
                                              ? i
                                              : i + 1,
                                        },
                                      })
                                    }
                                  />
                                ))}
                              </div>
                              <small>
                                {Math.max(0, n - (c.slotsUsed[lv] ?? 0))} / {n}{" "}
                                可用
                              </small>
                            </div>
                          ))}
                      </div>
                      {!Object.values(R.slots(c)).some((n) => n > 0) && (
                        <p className="muted">
                          当前职业 /
                          等级没有基础法术位。子职等特殊情况可在下方覆盖。
                        </p>
                      )}
                      <details>
                        <summary>手动法术位上限</summary>
                        <p className="footnote">
                          空值使用职业默认；手动值用于团规或特殊能力，不代表合法兼职计算。
                        </p>
                        <div className="slot-overrides">
                          {Array.from({ length: 9 }, (_, i) =>
                            String(i + 1),
                          ).map((lv) => (
                            <Field label={`${lv}环`} key={lv}>
                              <input
                                aria-label={`${lv}环法术位上限`}
                                type="number"
                                min={0}
                                max={20}
                                placeholder="自动"
                                value={c.slotOverrides[lv] ?? ""}
                                onChange={(e) => {
                                  const overrides = { ...c.slotOverrides };
                                  if (e.target.value === "")
                                    delete overrides[lv];
                                  else
                                    overrides[lv] = clamp(
                                      Number(e.target.value),
                                      0,
                                      20,
                                    );
                                  update({ slotOverrides: overrides });
                                }}
                              />
                            </Field>
                          ))}
                        </div>
                      </details>
                      <p className="footnote">
                        实心表示已用。邪术师短休恢复契约位；其他职业通常长休恢复。高阶秘法等另记笔记。
                      </p>
                    </Section>
                  </div>
                  <Section
                    title="法术书 / 已知法术"
                    eyebrow="MY SPELLS"
                    action={
                      <div className="button-row">
                        <button className="btn" onClick={() => setCustom(true)}>
                          <Plus size={15} /> 自定义
                        </button>
                        <button
                          className="btn primary"
                          onClick={() => navigate("spells")}
                        >
                          浏览典籍
                        </button>
                      </div>
                    }
                  >
                    {!currentSpells.length ? (
                      <div className="inline-empty">
                        <Sparkles size={32} />
                        <h3>把第一道法术写入手札</h3>
                        <p>去典籍查找法术并添加；准备状态与法术位分别管理。</p>
                      </div>
                    ) : (
                      <div className="my-list">
                        {currentSpells.map((s) => (
                          <div className="my-list-row" key={s.index}>
                            <button
                              className="entry-link"
                              onClick={() => setDetail(s)}
                            >
                              <span className="mini-rune">
                                {s.level === 0 ? "✦" : s.level}
                              </span>
                              <span>
                                {entryTitle(s)}
                                <small>
                                  {s.kind === "custom"
                                    ? "自定义"
                                    : s.school?.name}{" "}
                                  · {s.level === 0 ? "戏法" : `${s.level}环`} ·{" "}
                                  {s.casting_time ?? "自定义"}
                                </small>
                              </span>
                            </button>
                            <label className="prepared">
                              <input
                                type="checkbox"
                                checked={c.prepared.includes(s.index)}
                                onChange={() =>
                                  update({
                                    prepared: toggle(c.prepared, s.index),
                                  })
                                }
                              />
                              已准备
                            </label>
                            <button
                              className="icon-btn"
                              aria-label={`移除法术 ${s.name}`}
                              onClick={() => {
                                if (confirm(`从法术书移除 ${s.name}？`))
                                  update({
                                    spellIds: c.spellIds.filter(
                                      (i) => i !== s.index,
                                    ),
                                    prepared: c.prepared.filter(
                                      (i) => i !== s.index,
                                    ),
                                  });
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
                <div className={`tab-panel ${tab === "bag" ? "visible" : ""}`}>
                  <div className="grid two">
                    <Section title="钱袋" eyebrow="COIN PURSE">
                      <div className="coin-grid">
                        {(["cp", "sp", "ep", "gp", "pp"] as const).map(
                          (unit) => (
                            <Num
                              key={unit}
                              label={
                                {
                                  cp: "铜币 CP",
                                  sp: "银币 SP",
                                  ep: "琥珀金币 EP",
                                  gp: "金币 GP",
                                  pp: "铂金币 PP",
                                }[unit]
                              }
                              value={c.coins[unit]}
                              max={999999}
                              onChange={(n) =>
                                update({ coins: { ...c.coins, [unit]: n } })
                              }
                            />
                          ),
                        )}
                      </div>
                    </Section>
                    <Section title="携行重量" eyebrow="CARRYING LOAD">
                      <div className="weight-display">
                        <b>
                          {Number(
                            c.inventory
                              .reduce(
                                (total, b) =>
                                  total +
                                  (itemEntry(b.id)?.weight ?? b.weight ?? 0) *
                                    b.qty,
                                0,
                              )
                              .toFixed(2),
                          )}
                        </b>{" "}
                        lb <span>/ 常规容量 {c.scores.str * 15} lb</span>
                      </div>
                      <p className="footnote">
                        常规容量按中 / 小型力量 × 15 磅参考。未知重量记
                        0；强大体型、变体负重、容器与金币重量不自动计入。
                      </p>
                    </Section>
                  </div>
                  <Section
                    title="旅人的行囊"
                    eyebrow="INVENTORY"
                    action={
                      <div className="button-row">
                        <button className="btn" onClick={() => setCustom(true)}>
                          <Plus size={15} /> 自定义
                        </button>
                        <button
                          className="btn primary"
                          onClick={() => navigate("items")}
                        >
                          浏览宝库
                        </button>
                      </div>
                    }
                  >
                    {!c.inventory.length ? (
                      <div className="inline-empty">
                        <Backpack size={32} />
                        <h3>轻装上路，还是准备周全？</h3>
                        <p>从宝库添加武器、护甲、冒险用具与魔法物品。</p>
                      </div>
                    ) : (
                      <div className="my-list">
                        {c.inventory.map((b) => {
                          const e = itemEntry(b.id) as Entry | undefined;
                          return (
                            <div className="my-list-row" key={b.id}>
                              <button
                                className="entry-link"
                                onClick={() => e && setDetail(e)}
                              >
                                <span className="mini-rune">
                                  <Backpack size={17} />
                                </span>
                                <span>
                                  {e ? entryTitle(e) : (b.name ?? b.id)}
                                  <small>
                                    {e?.kind === "custom"
                                      ? "自定义物品"
                                      : (e?.equipment_category?.name ??
                                        e?.rarity?.name ??
                                        "未知引用")}{" "}
                                    · {e?.weight ?? b.weight ?? "?"} lb / 件
                                  </small>
                                </span>
                              </button>
                              <input
                                className="qty"
                                aria-label={`${e?.name ?? b.id} 数量`}
                                type="number"
                                min={1}
                                max={9999}
                                value={b.qty}
                                onChange={(ev) =>
                                  update({
                                    inventory: c.inventory.map((i) =>
                                      i.id === b.id
                                        ? {
                                            ...i,
                                            qty: clamp(
                                              Number(ev.target.value),
                                              1,
                                            ),
                                          }
                                        : i,
                                    ),
                                  })
                                }
                              />
                              <label className="prepared">
                                <input
                                  type="checkbox"
                                  checked={b.equipped}
                                  onChange={() =>
                                    update({
                                      inventory: c.inventory.map((i) =>
                                        i.id === b.id
                                          ? { ...i, equipped: !i.equipped }
                                          : i,
                                      ),
                                    })
                                  }
                                />
                                装备
                              </label>
                              <button
                                className="icon-btn"
                                aria-label={`移除物品 ${e?.name ?? b.id}`}
                                onClick={() => {
                                  if (confirm(`移除 ${e?.name ?? b.id}？`))
                                    update({
                                      inventory: c.inventory.filter(
                                        (i) => i.id !== b.id,
                                      ),
                                    });
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="footnote">
                      勾选普通护甲 / 盾牌会影响
                      AC，不核验熟练资格；魔法加值、同调与攻击能力请手动记录。请勿同时装备多套护甲。
                    </p>
                  </Section>
                </div>
                <div
                  className={`tab-panel ${tab === "journal" ? "visible" : ""}`}
                >
                  <div className="grid two">
                    <Section title="旅途笔记" eyebrow="ADVENTURE NOTES">
                      <Field label="特性、语言、羁绊与冒险记录">
                        <textarea
                          rows={16}
                          value={c.notes}
                          maxLength={50000}
                          placeholder="记下你的故事、职业能力、亚种族特性与尚未兑现的承诺……"
                          onChange={(e) => update({ notes: e.target.value })}
                        />
                      </Field>
                    </Section>
                    <Section title="角色设置" eyebrow="CHARACTER SETTINGS">
                      <Field label="姓名">
                        <input
                          value={c.name}
                          maxLength={80}
                          onChange={(e) => {
                            if (e.target.value.trim())
                              update({ name: e.target.value });
                          }}
                        />
                      </Field>
                      <Field label="背景与来历">
                        <input
                          value={c.background}
                          maxLength={120}
                          onChange={(e) =>
                            update({ background: e.target.value })
                          }
                        />
                      </Field>
                      <Num
                        label="角色等级"
                        min={1}
                        max={20}
                        value={c.level}
                        onChange={(n) =>
                          update({ level: n, hitDice: Math.min(c.hitDice, n) })
                        }
                      />
                      <p className="footnote">
                        升级自动重算熟练、固定平均 HP 与基础法术位；当前 HP
                        不变。升级所得能力、属性与额外生命骰由你调整。
                      </p>
                      <h3>手动覆盖</h3>
                      <div className="grid three">
                        {(
                          [
                            {
                              key: "hpOverride",
                              label: "生命上限",
                              min: 1,
                              max: 9999,
                            },
                            {
                              key: "acOverride",
                              label: "护甲 AC",
                              min: 0,
                              max: 99,
                            },
                            {
                              key: "initiativeOverride",
                              label: "先攻",
                              min: -30,
                              max: 99,
                            },
                          ] as const
                        ).map((o) => (
                          <Field key={o.key} label={o.label}>
                            <input
                              type="number"
                              min={o.min}
                              max={o.max}
                              placeholder="自动"
                              value={c[o.key] ?? ""}
                              onChange={(e) =>
                                update({
                                  [o.key]:
                                    e.target.value === ""
                                      ? null
                                      : clamp(
                                          Number(e.target.value),
                                          o.min,
                                          o.max,
                                        ),
                                })
                              }
                            />
                          </Field>
                        ))}
                      </div>
                      <p className="footnote">
                        清空覆盖值恢复自动计算。HP、AC、先攻的复杂特性与团规可在此处理。
                      </p>
                      <div className="divider" />
                      <div className="button-row">
                        <button
                          className="btn"
                          onClick={() =>
                            addCharacter({
                              ...structuredClone(c),
                              id: crypto.randomUUID(),
                              name: `${c.name.slice(0, 74)}（副本）`,
                            })
                          }
                        >
                          <Copy size={15} /> 复制角色
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => {
                            if (
                              confirm(
                                `永久删除「${c.name}」？本机删除无法撤销，建议先导出备份。`,
                              )
                            ) {
                              const chars = state.characters.filter(
                                (x) => x.id !== c.id,
                              );
                              setState({
                                ...state,
                                characters: chars,
                                activeId: chars[0]?.id ?? null,
                              });
                              setToast("角色已删除");
                            }
                          }}
                        >
                          <Trash2 size={15} /> 删除角色
                        </button>
                      </div>
                    </Section>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div className="catalog-toolbar">
                <div className="search-field">
                  <Search size={19} />
                  <input
                    aria-label="搜索法术或物品"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      view === "spells"
                        ? "搜索英文名称、常用中文名或规则原文…"
                        : "搜索物品名称或英文规则原文…"
                    }
                  />
                  {query && (
                    <button
                      className="icon-btn"
                      aria-label="清空搜索"
                      onClick={() => setQuery("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                {view === "spells" ? (
                  <>
                    <select
                      aria-label="法术环阶"
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <option value="all">所有环阶</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? "戏法" : `${i} 环`}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="施法职业"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <option value="all">所有职业</option>
                      {R.classes.map((c) => (
                        <option key={c.index} value={c.index}>
                          {R.classNames[c.index]}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="法术学派"
                      value={schoolFilter}
                      onChange={(e) => setSchoolFilter(e.target.value)}
                    >
                      <option value="all">所有学派</option>
                      {Array.from(
                        new Map(
                          R.spells.map((s) => [
                            s.school?.index,
                            s.school?.name,
                          ]),
                        ).entries(),
                      ).map(([id, name]) => (
                        <option value={id} key={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <select
                    aria-label="物品分类"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">所有分类</option>
                    <option value="magic">魔法物品</option>
                    {Array.from(
                      new Map(
                        R.items
                          .filter((i) => i.kind === "gear")
                          .map((i) => [
                            i.equipment_category?.index,
                            i.equipment_category?.name,
                          ]),
                      ).entries(),
                    ).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="results-label">
                <span>
                  找到 <b>{catalog.length}</b> 条记录
                </span>
                <span>
                  {c ? `添加目标：${c.name}` : "先创建角色，即可收录到手札"} ·
                  英文为规则原文
                </span>
              </div>
              <div className="catalog-grid">
                {catalog.slice((page - 1) * 24, page * 24).map((e) => (
                  <article
                    className="catalog-card"
                    key={`${e.kind}-${e.index}`}
                  >
                    <div className="catalog-card-top">
                      <span
                        className={`rune ${e.kind === "spell" ? "magic" : ""}`}
                      >
                        {view === "spells" ? (
                          e.level === 0 ? (
                            "✦"
                          ) : (
                            e.level
                          )
                        ) : e.kind === "magic" ? (
                          <Sparkles size={23} />
                        ) : e.armor_class ? (
                          <Shield size={23} />
                        ) : (
                          <Backpack size={23} />
                        )}
                      </span>
                      <span className="entry-category">
                        {view === "spells"
                          ? e.school?.name
                          : e.kind === "magic"
                            ? e.rarity?.name
                            : e.equipment_category?.name}
                      </span>
                    </div>
                    <button
                      className="catalog-title"
                      onClick={() => setDetail(e)}
                    >
                      {e.zh && <span>{e.zh}</span>}
                      <h2>{e.name}</h2>
                    </button>
                    <p className="catalog-meta">
                      {view === "spells"
                        ? `${e.level === 0 ? "戏法" : `${e.level} 环`} · ${e.casting_time} · ${e.range}`
                        : e.cost
                          ? `${e.cost.quantity} ${e.cost.unit} · ${e.weight ?? "?"} lb`
                          : e.kind === "magic"
                            ? "魔法物品 · 效果见原文"
                            : "详情见原文"}
                    </p>
                    <div className="catalog-card-bottom">
                      <div className="tags">
                        {e.concentration && <span>专注</span>}
                        {e.ritual && <span>仪式</span>}
                        {e.kind === "spell" && (
                          <span>{e.components?.join(" / ")}</span>
                        )}
                        {e.kind !== "spell" && e.damage?.damage_type && (
                          <span>
                            {e.damage.damage_dice} {e.damage.damage_type.name}
                          </span>
                        )}
                        {e.armor_class && (
                          <span>
                            AC {e.armor_class.base}
                            {e.armor_class.dex_bonus ? " + DEX" : ""}
                          </span>
                        )}
                      </div>
                      <button
                        className="add-btn"
                        aria-label={`添加 ${e.name}`}
                        title={c ? `添加到 ${c.name}` : "请先创建角色"}
                        disabled={!c}
                        onClick={() => addEntry(e)}
                      >
                        {c?.spellIds.includes(e.index) ? (
                          <Check size={19} />
                        ) : (
                          <Plus size={19} />
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {catalog.length === 0 && (
                <div className="inline-empty">
                  <Search size={32} />
                  <h3>未找到记录</h3>
                  <p>试试英文名称，或放宽筛选条件。仅收录 SRD 5.1 开放内容。</p>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuery("");
                      setLevelFilter("all");
                      setClassFilter("all");
                      setCategory("all");
                      setSchoolFilter("all");
                    }}
                  >
                    清空筛选
                  </button>
                </div>
              )}
              {catalog.length > 24 && (
                <div className="pagination">
                  <button
                    className="btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一页
                  </button>
                  <span>
                    {page} / {Math.ceil(catalog.length / 24)}
                  </span>
                  <button
                    className="btn"
                    disabled={page >= Math.ceil(catalog.length / 24)}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页
                  </button>
                </div>
              )}
              <div className="notice small">
                中文名称为本项目辅助翻译（非官方译本）；未翻译条目保留英文。具体效果以条目中的
                SRD 5.1 英文原文及 DM 裁定为准。
              </div>
            </>
          )}
          <footer>
            <span>
              ✦ 旅人手札 <small>FOR THE STORIES YET TO BE TOLD.</small>
            </span>
            <button className="text-btn" onClick={() => setAbout(true)}>
              2014 SRD 5.1 · CC BY 4.0 <ChevronRight size={13} />
            </button>
          </footer>
        </main>
      </div>
      {wizard && (
        <Wizard onClose={() => setWizard(false)} onCreate={addCharacter} />
      )}
      {detail && (
        <Modal title={entryTitle(detail)} onClose={() => setDetail(null)} wide>
          <div className="detail-tags">
            <span className="source-tag">
              {detail.kind === "custom"
                ? "自定义 · 非 SRD"
                : detail.kind === "spell"
                  ? `${detail.level === 0 ? "戏法" : detail.level + "环"} · ${detail.school?.name}`
                  : (detail.equipment_category?.name ??
                    detail.rarity?.name ??
                    "魔法物品")}
            </span>
            {detail.kind !== "custom" && (
              <span className="muted small">SRD 5.1 / 2014 · 英文规则原文</span>
            )}
          </div>
          {detail.kind === "spell" && (
            <dl className="detail-grid">
              {[
                ["施法时间", detail.casting_time],
                ["施法距离", detail.range],
                ["持续时间", detail.duration],
                ["成分", detail.components?.join(", ")],
                [
                  "专注 / 仪式",
                  `${detail.concentration ? "专注" : "非专注"} / ${detail.ritual ? "仪式" : "非仪式"}`,
                ],
                [
                  "职业",
                  detail.classes
                    ?.map((x) => R.classNames[x.index] ?? x.name)
                    .join("、"),
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {detail.material && <p className="notice">材料：{detail.material}</p>}
          {detail.kind !== "spell" && detail.damage?.damage_type && (
            <p>
              伤害：{detail.damage.damage_dice} {detail.damage.damage_type.name}
            </p>
          )}
          {detail.armor_class && (
            <p>
              护甲等级：{detail.armor_class.base}{" "}
              {detail.armor_class.dex_bonus
                ? `+ DEX${detail.armor_class.max_bonus !== undefined ? "（上限 " + detail.armor_class.max_bonus + "）" : ""}`
                : ""}{" "}
              · 最低力量 {detail.str_minimum ?? 0}
              {detail.stealth_disadvantage ? " · 隐匿劣势" : ""}
            </p>
          )}
          {detail.cost && (
            <p>
              价格 {detail.cost.quantity} {detail.cost.unit} · 重量{" "}
              {detail.weight ?? "?"} lb
            </p>
          )}
          {detail.properties && (
            <p>武器属性：{detail.properties.map((p) => p.name).join(" · ")}</p>
          )}
          <div className="rules-text" lang="en">
            {detail.desc?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {detail.contents?.map((x, i) => (
              <p key={`c${i}`}>
                {x.quantity} × {x.item.name}
              </p>
            ))}
            {detail.higher_level && (
              <>
                <h3>At Higher Levels</h3>
                {detail.higher_level.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </>
            )}
            {!detail.desc?.length && !detail.contents?.length && (
              <p>该数据条目无额外说明；请参考上述结构化属性与 SRD 原文。</p>
            )}
          </div>
          <div className="dialog-actions">
            <button className="btn" onClick={() => setDetail(null)}>
              关闭
            </button>
            <button
              className="btn primary"
              disabled={!c}
              onClick={() => addEntry(detail)}
            >
              <Plus size={16} /> {c ? `添加到 ${c.name}` : "请先创建角色"}
            </button>
          </div>
        </Modal>
      )}
      {rest && c && (
        <Modal
          title={rest === "short" ? "短休 · 喘息片刻" : "长休 · 迎接黎明"}
          onClose={() => setRest(null)}
        >
          {rest === "short" ? (
            <>
              <p>
                至少休息 1
                小时。可花费生命骰并手动掷骰，每骰加体质调整值（每次最低回复
                0）。
              </p>
              <Num
                label={`花费生命骰（剩余 ${c.hitDice}d${R.classOf(c).hit_die}）`}
                value={Math.min(restDice, c.hitDice)}
                max={c.hitDice}
                onChange={setRestDice}
              />
              <Num
                label="实际回复总量（已计入体质）"
                value={restHealing}
                onChange={setRestHealing}
              />
              <p className="notice">
                {c.classId === "warlock"
                  ? "契约魔法法术位将恢复。"
                  : "普通法术位不会恢复。"}
                奥术回想等特性请手动调整。
              </p>
            </>
          ) : (
            <>
              <p>
                长休通常至少 8 小时；24 小时内只能获益一次，开始时需至少 1
                HP。请自行确认是否符合条件。
              </p>
              <ul className="rest-list">
                <li>生命回复至 {R.maxHP(c)}，清空临时生命</li>
                <li>恢复全部基础法术位与死亡豁免记录</li>
                <li>
                  恢复 {Math.max(1, Math.floor(c.level / 2))} 颗生命骰（上限{" "}
                  {c.level}）
                </li>
              </ul>
              <p className="notice">
                不自动移除状态或降低力竭；职业资源、食宿与特殊效果请手动核对。
              </p>
            </>
          )}
          <div className="dialog-actions">
            <button className="btn" onClick={() => setRest(null)}>
              取消
            </button>
            <button
              className="btn primary"
              onClick={() => {
                update(
                  rest === "short"
                    ? R.shortRest(
                        c,
                        Math.min(restDice, c.hitDice),
                        Math.min(restDice, c.hitDice) > 0 ? restHealing : 0,
                      )
                    : R.longRest(c),
                );
                setRest(null);
                setToast("休息已记录");
              }}
            >
              完成休息
            </button>
          </div>
        </Modal>
      )}
      {custom && c && (
        <CustomModal
          onClose={() => setCustom(false)}
          onSave={(e) => {
            const next = { ...c, custom: [...c.custom, e] };
            if (e.level !== undefined) next.spellIds = [...c.spellIds, e.index];
            else
              next.inventory = [
                ...c.inventory,
                { id: e.index, qty: 1, equipped: false },
              ];
            update(next);
            setCustom(false);
            setToast("自定义条目已保存");
          }}
        />
      )}
      {about && (
        <Modal title="规则、数据与边界" onClose={() => setAbout(false)} wide>
          <h3>2014 版 · 5E compatible</h3>
          <p>
            本项目只采用 SRD 5.1（2014），不混入 2024 SRD
            5.2。支持单职业基础角色卡；不是完整规则裁判，不代替 DM。
          </p>
          <ul>
            <li>
              自动：属性调整值、熟练、技能 / 豁免、固定平均 HP、普通护甲与盾牌
              AC、无甲防御、基础职业法术位。
            </li>
            <li>
              手动：亚种族、自选加值、兼职、专长、子职、职业资源、起始装备 /
              金币、法术学习 /
              准备数量、同调、魔法加值、抗性、状态效果。可用覆盖值与笔记管理。
            </li>
            <li>
              SRD
              只含一个背景（侍僧），并不包含玩家手册所有内容。法术和物品详情为英文原文，部分名称为本项目辅助中文翻译。
            </li>
            <li>
              所有角色存在浏览器
              localStorage；不上传、不跨设备同步。清理浏览器数据会丢失记录，请导出
              JSON 备份。
            </li>
          </ul>
          <h3>开放内容署名</h3>
          <p className="legal">
            This work includes material taken from the System Reference Document
            5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at{" "}
            <a
              href="https://dnd.wizards.com/resources/systems-reference-document"
              target="_blank"
              rel="noreferrer"
            >
              https://dnd.wizards.com/resources/systems-reference-document
            </a>
            . The SRD 5.1 is licensed under the Creative Commons Attribution 4.0
            International License available at{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode"
              target="_blank"
              rel="noreferrer"
            >
              https://creativecommons.org/licenses/by/4.0/legalcode
            </a>
            .
          </p>
          <p>
            结构化数据来源：
            <a
              href="https://github.com/5e-bits/5e-srd-api/tree/3b6da29a45b3b328c2409cf97a14e2507e291bf8/packages/5e-database/src/2014/en"
              target="_blank"
              rel="noreferrer"
            >
              5e-bits / 2014 英文数据快照
            </a>
            。已本地打包，无需在线
            API。改动：格式筛选、辅助名称翻译与自建计算逻辑。
          </p>
          <p>
            <a
              href="https://github.com/grot666/dnd-companion"
              target="_blank"
              rel="noreferrer"
            >
              项目源码与使用说明 ↗
            </a>{" "}
            · 代码 MIT；规则内容 CC BY 4.0。
          </p>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function CustomModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (e: {
    index: string;
    name: string;
    kind: "custom";
    desc: string[];
    level?: number;
    weight?: number;
  }) => void;
}) {
  const [name, setName] = useState(""),
    [kind, setKind] = useState("item"),
    [desc, setDesc] = useState(""),
    [level, setLevel] = useState(0),
    [weight, setWeight] = useState(0);
  return (
    <Modal title="自定义条目 · 非 SRD 内容" onClose={onClose}>
      <Field label="条目类型">
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="item">物品</option>
          <option value="spell">法术</option>
        </select>
      </Field>
      <Field label="名称">
        <input
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      {kind === "spell" ? (
        <Num
          label="环阶（0 为戏法）"
          value={level}
          max={9}
          onChange={setLevel}
        />
      ) : (
        <Num
          label="重量（lb）"
          value={weight}
          max={100000}
          onChange={setWeight}
        />
      )}
      <Field label="效果 / 备注（由 DM 确认）">
        <textarea
          rows={6}
          maxLength={10000}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </Field>
      <p className="footnote">
        自定义内容仅存于当前角色，不会被当作 SRD 规则。AC 等额外效果请手动覆盖。
      </p>
      <div className="dialog-actions">
        <button className="btn" onClick={onClose}>
          取消
        </button>
        <button
          className="btn primary"
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              index: "custom:" + crypto.randomUUID(),
              name: name.trim(),
              kind: "custom",
              desc: [desc],
              ...(kind === "spell" ? { level } : { weight }),
            })
          }
        >
          保存并添加
        </button>
      </div>
    </Modal>
  );
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
