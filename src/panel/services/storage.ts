export type StorageSource = "localStorage" | "sessionStorage" | "cookies";
export interface StorageData {
  [key: string]: string;
}

export type KeyType = "json" | "string" | "number" | "boolean" | "other";
export interface StorageKey {
  name: string;
  type: KeyType;
  value: string;
}

// function sendBackgroundMessage<T>(message: unknown): Promise<T> {
//   return new Promise((resolve, reject) => {
//     chrome.runtime.sendMessage(message, (response) => {
//       if (chrome.runtime.lastError) {
//         reject(new Error(chrome.runtime.lastError.message));
//         return;
//       }
//       resolve(response);
//     });
//   });
// }

function sendPageMessage<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

function getInspectedUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval("window.location.href", (result, isException) => {
      if (isException || !result) {
        resolve("");
      } else {
        resolve(result as unknown as string);
      }
    });
  });
}

export async function fetchStorage(source: StorageSource): Promise<StorageData> {
  if (source === "cookies") {
    const url = await getInspectedUrl();
    if (!url) return {};
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll({ url }, (cookies) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const data: StorageData = {};
        for (const cookie of cookies) {
          data[cookie.name] = cookie.value;
        }
        resolve(data);
      });
    });
  }

  const res = await sendPageMessage<{ success: boolean; data: StorageData }>({ type: "PAGE_GET_ALL", storageType: source });
  return res.data;
}

export async function saveStorageKey(source: StorageSource, key: string, value: string) {
  if (source === "cookies") {
    const url = await getInspectedUrl();
    if (!url) throw new Error("Could not retrieve inspected URL");
    return new Promise((resolve, reject) => {
      chrome.cookies.set({ url, name: key, value }, (cookie) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(cookie);
        }
      });
    });
  }
  return sendPageMessage({ type: "PAGE_SET", storageType: source, key, value });
}

export async function deleteStorageKey(source: StorageSource, key: string) {
  if (source === "cookies") {
    const url = await getInspectedUrl();
    if (!url) throw new Error("Could not retrieve inspected URL");
    return new Promise((resolve, reject) => {
      chrome.cookies.remove({ url, name: key }, (cookie) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(cookie);
        }
      });
    });
  }
  return sendPageMessage({ type: "PAGE_DELETE", storageType: source, key });
}

export async function clearStorage(source: StorageSource) {
  if (source === "cookies") {
    const url = await getInspectedUrl();
    if (!url) throw new Error("Could not retrieve inspected URL");
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll({ url }, (cookies) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const promises = cookies.map((cookie) => {
          return new Promise((res) => {
            chrome.cookies.remove({ url, name: cookie.name }, res);
          });
        });
        Promise.all(promises)
          .then(() => resolve(true))
          .catch(reject);
      });
    });
  }
  return sendPageMessage({ type: "PAGE_CLEAR", storageType: source });
}
