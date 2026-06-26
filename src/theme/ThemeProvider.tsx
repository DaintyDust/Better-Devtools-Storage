import React from "react";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/core/styles/baseline.css";
import "@mantine/core/styles/default-css-variables.css";
import "@mantine/core/styles/global.css";
import "@mantine/notifications/styles.css";

const mantineTheme = createTheme({
  cursorType: "pointer",
  defaultRadius: "md",
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    function updateTheme() {
      setTheme("dark");
    }
    updateTheme();
  }, [setTheme]);

  return (
    <MantineProvider theme={mantineTheme} classNamesPrefix="bds-" forceColorScheme={theme} withGlobalClasses={false}>
      <main>{children}</main>
    </MantineProvider>
  );
}
