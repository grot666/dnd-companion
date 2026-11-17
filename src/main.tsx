import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Codex from "./Codex";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Codex />
  </StrictMode>,
);
