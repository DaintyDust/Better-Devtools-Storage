chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void sender;
  if (message.type === "EXT_LIST") {
    chrome.management.getAll((extensions) => {
      const list = extensions.filter((ext) => ext.type === "extension" && ext.enabled).map((ext) => ({ id: ext.id, name: ext.name }));
      sendResponse({ success: true, data: list });
    });
    return true;
  }

  if (message.type === "EXT_GET_ALL") {
    const area = message.area || "local";
    const storageArea = area === "local" ? chrome.storage.local : area === "sync" ? chrome.storage.sync : area === "managed" ? chrome.storage.managed : area === "session" ? chrome.storage.session : undefined;

    if (storageArea) {
      storageArea.get(null, (items) => {
        sendResponse({ success: true, data: items });
      });
    } else {
      sendResponse({
        success: false,
        error: `Storage area "${area}" not found`,
      });
    }
    return true;
  }

  if (message.type === "EXT_SET") {
    const area = message.area || "local";
    const storageArea = area === "local" ? chrome.storage.local : area === "sync" ? chrome.storage.sync : area === "managed" ? chrome.storage.managed : area === "session" ? chrome.storage.session : undefined;

    if (storageArea) {
      storageArea.set({ [message.key]: message.value }, () => {
        sendResponse({ success: true });
      });
    } else {
      sendResponse({
        success: false,
        error: `Storage area "${area}" not found`,
      });
    }
    return true;
  }

  if (message.type === "EXT_DELETE") {
    const area = message.area || "local";
    const storageArea = area === "local" ? chrome.storage.local : area === "sync" ? chrome.storage.sync : area === "managed" ? chrome.storage.managed : area === "session" ? chrome.storage.session : undefined;

    if (storageArea) {
      storageArea.remove(message.key, () => {
        sendResponse({ success: true });
      });
    } else {
      sendResponse({
        success: false,
        error: `Storage area "${area}" not found`,
      });
    }
    return true;
  }

  if (message.type === "EXT_CLEAR") {
    const area = message.area || "local";
    const storageArea = area === "local" ? chrome.storage.local : area === "sync" ? chrome.storage.sync : area === "managed" ? chrome.storage.managed : area === "session" ? chrome.storage.session : undefined;

    if (storageArea) {
      storageArea.clear(() => {
        sendResponse({ success: true });
      });
    } else {
      sendResponse({
        success: false,
        error: `Storage area "${area}" not found`,
      });
    }
    return true;
  }
});
