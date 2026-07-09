import type { ManifestV3Export } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

export default {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,

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
