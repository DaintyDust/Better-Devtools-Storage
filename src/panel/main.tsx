import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@theme/ThemeProvider.tsx";
import Panel from "@/panel/components/Panel";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Panel />
    </ThemeProvider>
  </StrictMode>,
);
