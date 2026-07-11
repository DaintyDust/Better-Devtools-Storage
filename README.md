## Better Devtools Storage

Better Devtools Storage is a DevTools tab taht replaces the default chrome application storage tab with a user friendly interface for viewing, editing and searching localstorage, sessionstorage and cookies.

Features:
- **Search** - Search across all keys and values instandly
- **Syntax Highlighting** - Live syntax highlighting for JSON values
- **Edit Keys**: Add, update, and delete localStorage, sessionStorage, and site cookies.
- **Clear Values** – Clear localStorage, sessionstorage and site cookies.
- **Delete Keys** – Delete keys from localStorage, sessionstorage and site cookies.
- **Copy Values**: Easily copy values to your clipboard.
- **Responsive**: Handles different devttool layouts: horizontal, vertical and docked/undocked.

> [!NOTE]
> The extension is currently pending review on the Chrome Web Store. In the meantime, you can manually load the extension by downloading the packaged build from the [GitHub Releases page](https://github.com/DaintyDust/Better-Devtools-Storage/releases).

## How to Compile

1. Clone or fork the respository `git@github.com:daintydust/better-devtools-storage.git`.
2. Install dependencies, typically by `npm install` in the root of the directory.
3. Run `npm run build` to build the extension.
4. The compiled extension will be available in the `/dist` directory.

## How to Contribute

1. Clone or fork the respository `git@github.com:daintydust/better-devtools-storage.git`.
2. Install dependencies, typically by `npm install` in the root of the directory.
3. Run `npm run dev` to run the development server.
4. Navigate to `chrome://extensions/` and enable developer-mode (top-right).
5. Click `Load Unpacked` and add `/dist` from your cloned repository.
6. Finally, open your DevTools and navigate to the "Better Devtools Storage" tab.

## Support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/daintydust)