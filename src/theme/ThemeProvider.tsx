import React from "react";
import { createTheme, MantineProvider, SegmentedControl, Tooltip, ActionIcon, Splitter } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import ActionIconStyles from "./ActionIcon.module.css";
import SplitterStyles from "./Splitter.module.css";


const mantineTheme = createTheme({
  primaryColor: "indigo",
  cursorType: "pointer",
  defaultRadius: "md",
  components: {
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { color: "indigo", radius: "md" },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        transitionProps: { transition: "pop", duration: 200 },
        arrowSize: 8,
        withArrow: true,
        color: "indigo",
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { color: "indigo", variant: "filled" },
      classNames: { root: ActionIconStyles.root },
    }),
    Splitter: Splitter.extend({
      classNames: { handle: SplitterStyles.handle, thumb: SplitterStyles.thumb },
    }),
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="auto" theme={mantineTheme} classNamesPrefix="bds-">
      <Notifications position="bottom-right" />
      <main>{children}</main>
    </MantineProvider>
  );
}
