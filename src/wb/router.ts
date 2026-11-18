import { useEffect, useState } from "react";

export type SeriesTab = "overview" | "world" | "characters" | "places" | "stories" | "timeline" | "adoptions";
export const seriesTabs: [SeriesTab, string][] = [
  ["overview", "概览"],
  ["world", "世界"],
  ["characters", "人物"],
  ["places", "地点与势力"],
  ["stories", "故事"],
  ["timeline", "时间线"],
  ["adoptions", "采用的设定"],
];
export type StoryMode = "read" | "edit" | "influence";

export type Route =
  | { name: "home" }
  | { name: "series"; id: string; tab: SeriesTab; item: string; story: string; mode: StoryMode; pub: boolean }
  | { name: "library"; cat: string; q: string }
  | { name: "entry"; slug: string; tab: string }
  | { name: "themes"; q: string }
  | { name: "theme"; slug: string }
  | { name: "drafts" }
  | { name: "tools"; view: "sheet" | "spells" | "items"; q: string };

const legacy: Record<string, string> = {
  "#tools": "#/tools",
  "#spells": "#/tools/spells",
  "#equipment": "#/tools/items",
  "#classes": "#/library?cat=class",
  "#races": "#/library?cat=race",
  "#backgrounds": "#/library?cat=background",
  "#world": "#/library?cat=plane",
  "#start": "#/",
};
const v3Tab: Record<string, SeriesTab> = { characters: "characters", relationships: "characters", plots: "stories", locations: "places", settings: "adoptions" };

export function parseHash(hash: string): Route {
  const h = legacy[hash] ?? hash;
  const raw = h.replace(/^#\/?/, "");
  const [path, qs = ""] = raw.split("?");
  const params = new URLSearchParams(qs);
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  const q = params.get("q") ?? "";
  switch (parts[0]) {
    case undefined:
      return { name: "home" };
    case "library":
    case "browse": // round-3 links
      return { name: "library", cat: params.get("cat") ?? "", q };
    case "favorites":
      return { name: "library", cat: "fav", q: "" };
    case "entry":
      return parts[1] ? { name: "entry", slug: parts[1], tab: params.get("tab") ?? "body" } : { name: "library", cat: "", q: "" };
    case "themes":
      return parts[1] ? { name: "theme", slug: parts[1] } : { name: "themes", q };
    case "drafts":
      return { name: "drafts" };
    case "projects": // round-3 project links: projects became series with the same id
      return parts[1] ? seriesRoute(parts[1], v3Tab[parts[2] ?? ""] ?? "overview") : { name: "home" };
    case "series": {
      if (!parts[1]) return { name: "home" };
      const tab = (parts[2] ?? "overview") as SeriesTab;
      const mode = params.get("mode");
      return {
        name: "series",
        id: parts[1],
        tab: seriesTabs.some(([t]) => t === tab) ? tab : "overview",
        item: parts[3] ?? "",
        story: params.get("story") ?? "",
        mode: mode === "edit" || mode === "influence" ? mode : "read",
        pub: params.get("pub") === "1",
      };
    }
    case "tools":
      return { name: "tools", view: parts[1] === "spells" ? "spells" : parts[1] === "items" ? "items" : "sheet", q };
    default:
      return { name: "home" };
  }
}

export const seriesRoute = (id: string, tab: SeriesTab = "overview", item = "", extra: { story?: string; mode?: StoryMode; pub?: boolean } = {}): Route => ({
  name: "series",
  id,
  tab,
  item,
  story: extra.story ?? "",
  mode: extra.mode ?? "read",
  pub: extra.pub ?? false,
});

export function href(r: Route): string {
  const qs = (o: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(o)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  switch (r.name) {
    case "home":
      return "#/";
    case "series":
      return `#/series/${encodeURIComponent(r.id)}/${r.tab}${r.item ? `/${encodeURIComponent(r.item)}` : ""}${qs({ story: r.story, mode: r.mode === "read" ? "" : r.mode, pub: r.pub ? "1" : "" })}`;
    case "library":
      return `#/library${qs({ cat: r.cat, q: r.q })}`;
    case "entry":
      return `#/entry/${encodeURIComponent(r.slug)}${r.tab && r.tab !== "body" ? qs({ tab: r.tab }) : ""}`;
    case "themes":
      return `#/themes${qs({ q: r.q })}`;
    case "theme":
      return `#/themes/${encodeURIComponent(r.slug)}`;
    case "drafts":
      return "#/drafts";
    case "tools":
      return `#/tools${r.view === "sheet" ? "" : `/${r.view}`}${qs({ q: r.q })}`;
  }
}

// ---- Scroll memory: forward navigation starts at the top, back/forward restores. ----
const SCROLL_KEY = "wb-scroll";
let forward = false;
const readScroll = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "{}");
  } catch {
    return {};
  }
};
const writeScroll = (hash: string, y: number) => {
  const m = readScroll();
  m[hash] = y;
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify(m));
};

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) {
    const y = window.scrollY;
    history.replaceState(history.state, "", to);
    writeScroll(to, y);
    window.dispatchEvent(new Event("wb-replace"));
  } else {
    writeScroll(location.hash || "#/", window.scrollY);
    forward = true;
    location.hash = to;
  }
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => location.hash || "#/");
  useEffect(() => {
    let current = location.hash || "#/";
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => writeScroll(current, window.scrollY), 80);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      const target = a?.getAttribute("href");
      if (target && target.startsWith("#/")) {
        writeScroll(current, window.scrollY);
        forward = true;
      }
    };
    const onHash = () => {
      const next = location.hash || "#/";
      current = next;
      setHash(next);
      const restore = !forward;
      forward = false;
      const y = restore ? readScroll()[next] ?? 0 : 0;
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    };
    const onReplace = () => {
      current = location.hash || "#/";
      setHash(current);
    };
    const initial = readScroll()[current];
    if (initial) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, initial)));
    window.addEventListener("hashchange", onHash);
    window.addEventListener("wb-replace", onReplace);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("wb-replace", onReplace);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return parseHash(hash);
}
