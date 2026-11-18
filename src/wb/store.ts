import { useCallback, useEffect, useRef, useState } from "react";
import { loadWb, saveWb, type Project, type WbState } from "./project";

export function useWorkbench() {
  const [boot] = useState(() => loadWb());
  const [state, setState] = useState<WbState>(boot.state);
  const [blocked, setBlocked] = useState(boot.blocked);
  const [warning, setWarning] = useState(boot.warning);
  const [savedAt, setSavedAt] = useState<string>("");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (blocked) return;
    try {
      saveWb(state);
      setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (e) {
      setWarning(`保存失败：${(e as Error).message}`);
    }
  }, [state, blocked]);

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? fn(p) : p)) }));
  }, []);

  const resumeSaving = useCallback(() => {
    setBlocked(false);
    setWarning("");
  }, []);

  return { state, setState, updateProject, blocked, warning, savedAt, resumeSaving };
}
export type WorkbenchApi = ReturnType<typeof useWorkbench>;
