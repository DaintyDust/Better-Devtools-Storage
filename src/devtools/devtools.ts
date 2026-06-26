chrome.devtools.panels.create("Better Devtools Storage", "icons/icon16.png", "src/panel/panel.html", (panel) => {
  panel.onShown.addListener((win) => {
    const panelWindow = win as Window & { refreshAll?: () => void };
    if (panelWindow.refreshAll) panelWindow.refreshAll();
  });
});
