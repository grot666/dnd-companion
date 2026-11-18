import { useEffect, useState } from "react";

export type ProjectTab = "overview" | "characters" | "relationships" | "plots" | "locations" | "settings";
export const projectTabs: [ProjectTab, string][] = [
  ["overview", "概览"],
  ["characters", "角色"],
  ["relationships", "关系"],
  ["plots", "情节"],
  ["locations", "地点"],
  ["settings", "设定改编"],
];

export type Route =
  | { name: "home" }
  | { name: "browse"; cat: string; q: string }
  | { name: "entry"; slug: string; tab: string }
  | { name: "themes"; q: string }
  | { name: "theme"; slug: string }
  | { name: "projects" }
  | { name: "project"; id: string; tab: ProjectTab; item: string }
  | { name: "favorites" }
  | { name: "tools"; view: "sheet" | "spells" | "items"; q: string };

const legacy: Record<string, string> = {
  "#tools": "#/tools",
  "#spells": "#/tools/spells",
  "#equipment": "#/tools/items",
  "#classes": "#/browse?cat=class",
  "#races": "#/browse?cat=race",
  "#backgrounds": "#/browse?cat=background",
  "#world": "#/browse?cat=plane",
  "#start": "#/",
};

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
    case "browse":
      return { name: "browse", cat: params.get("cat") ?? "", q };
    case "entry":
      return parts[1] ? { name: "entry", slug: parts[1], tab: params.get("tab") ?? "body" } : { name: "browse", cat: "", q: "" };
    case "themes":
      return parts[1] ? { name: "theme", slug: parts[1] } : { name: "themes", q };
    case "projects": {
      if (!parts[1]) return { name: "projects" };
      const tab = (parts[2] ?? "overview") as ProjectTab;
      return {
        name: "project",
        id: parts[1],
        tab: projectTabs.some(([t]) => t === tab) ? tab : "overview",
        item: params.get("item") ?? "",
      };
    }
    case "favorites":
      return { name: "favorites" };
    case "tools":
      return { name: "tools", view: parts[1] === "spells" ? "spells" : parts[1] === "items" ? "items" : "sheet", q };
    default:
      return { name: "home" };
  }
}

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
    case "browse":
      return `#/browse${qs({ cat: r.cat, q: r.q })}`;
    case "entry":
      return `#/entry/${encodeURIComponent(r.slug)}${r.tab && r.tab !== "body" ? qs({ tab: r.tab }) : ""}`;
    case "themes":
      return `#/themes${qs({ q: r.q })}`;
    case "theme":
      return `#/themes/${encodeURIComponent(r.slug)}`;
    case "projects":
      return "#/projects";
    case "project":
      return `#/projects/${encodeURIComponent(r.id)}/${r.tab}${qs({ item: r.item })}`;
    case "favorites":
      return "#/favorites";
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
export function markForward() {
  forward = true;
}

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
      // Wait for the new page to render before scrolling.
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    };
    const onReplace = () => {
      current = location.hash || "#/";
      setHash(current);
    };
    // Initial load / refresh: restore the remembered position for this hash.
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
