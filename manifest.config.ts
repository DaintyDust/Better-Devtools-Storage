import type { ManifestV3Export } from "@crxjs/vite-plugin";

export default {
  manifest_version: 3,
  name: "Better-Devtools-Storage",
  version: "1.0.0",
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
    16: "icons/Better-Storage-Icon.png",
    48: "icons/Better-Storage-Icon.png",
    128: "icons/Better-Storage-Icon.png",
  },
} satisfies ManifestV3Export;
