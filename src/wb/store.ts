import { useCallback, useEffect, useRef, useState } from "react";
import { loadWb, saveWb, touch, type Series, type WbState } from "./series";

export function useWorkbench() {
  const [boot] = useState(() => loadWb());
  const [state, setState] = useState<WbState>(boot.state);
  const [blocked, setBlocked] = useState(boot.blocked);
  const [warning, setWarning] = useState(boot.warning);
  const [notice, setNotice] = useState(boot.notice);
  const [savedAt, setSavedAt] = useState<string>("");
  const first = useRef(true);

  useEffect(() => {
    // Persist a migration immediately; otherwise skip the initial render.
    if (first.current) {
      first.current = false;
      if (!boot.state.migratedFrom || blocked) return;
    }
    if (blocked) return;
    try {
      saveWb(state);
      setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (e) {
      setWarning(`保存失败：${(e as Error).message}`);
    }
  }, [state, blocked, boot.state.migratedFrom]);

  const updateSeries = useCallback((id: string, fn: (s: Series) => Series) => {
    setState((st) => ({ ...st, series: st.series.map((s) => (s.id === id ? touch(fn(s)) : s)) }));
  }, []);

  const resumeSaving = useCallback(() => {
    setBlocked(false);
    setWarning("");
  }, []);

  return { state, setState, updateSeries, blocked, warning, notice, dismissNotice: () => setNotice(""), savedAt, resumeSaving };
}
export type WorkbenchApi = ReturnType<typeof useWorkbench>;
