chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void sender;
  if (!message.type || !message.type.startsWith("PAGE_")) return;

  const store = message.storageType === "sessionStorage" ? sessionStorage : localStorage;

  try {
    switch (message.type) {
      case "PAGE_GET_ALL": {
        const data: Record<string, string | null> = {};
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k !== null) {
            data[k] = store.getItem(k);
          }
        }
        sendResponse({ success: true, data });
        break;
      }
      case "PAGE_SET": {
        store.setItem(message.key, message.value);
        sendResponse({ success: true });
        break;
      }
      case "PAGE_DELETE": {
        store.removeItem(message.key);
        sendResponse({ success: true });
        break;
      }
      case "PAGE_CLEAR": {
        store.clear();
        sendResponse({ success: true });
        break;
      }
      default:
        sendResponse({ success: false, error: "Unknown type" });
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    sendResponse({ success: false, error: errorMsg });
  }

  return true;
});
