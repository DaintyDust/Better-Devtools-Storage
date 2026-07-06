import type { ManifestV3Export } from "@crxjs/vite-plugin";

export default {
  manifest_version: 3,
  name: "Better-Devtools-Storage",
  version: "0.0.1",
  description: "A powerful DevTools panel for inspecting and editing localStorage, sessionStorage, and chrome.storage.local.",

  host_permissions: ["<all_urls>"],
  permissions: ["storage", "cookies"],
  incognito: "split",
  devtools_page: "src/devtools/devtools.html",

  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/contentScript.ts"],
      run_at: "document_start",
    },
  ],

  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
} satisfies ManifestV3Export;
