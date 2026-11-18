import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Workbench from "./Workbench";
import "./style.css";
import "./legacy-tools.css";
import "./workbench.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Workbench />
  </StrictMode>,
);
