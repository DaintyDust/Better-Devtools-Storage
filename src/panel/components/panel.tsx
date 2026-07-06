import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AppShell, Splitter } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchStorage, deleteStorageKey, clearStorage, saveStorageKey } from "../services/storage";
import { type StorageSource, type KeyType, type StorageKey } from "../services/storage";
import Header from "./Header";
import Sidebar from "./Sidebar";
import KeyContent from "./KeyContent";
import styles from "../styles/Panel.module.css";

function detectType(value: string): KeyType {
  if (value === "true" || value === "false") return "boolean";
  if (value.trim() !== "" && !Number.isNaN(Number(value))) return "number";

  const trimmed = value.trim();
  if (trimmed.length < 2) return "string";
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return "string";

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) return "json";
  } catch {
    // Ignore JSON parsing errors
  }
  return "string";
}

function Panel() {
  const [activeSource, setActiveSource] = useState<StorageSource>("localStorage");
  const [storage, setStorage] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<StorageKey | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isJson, setIsJson] = useState(false);
  const [lastValidJson, setLastValidJson] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const jsonDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const sourceIndex = ["localStorage", "sessionStorage", "cookies"].indexOf(activeSource);

  const loadStorage = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const data = await fetchStorage(activeSource);
      setStorage(data as Record<string, string>);
      setSelectedKey((prev) => {
        if (!prev) return null;
        if (!(prev.name in data)) return null;
        const newValue = data[prev.name];
        if (newValue === undefined) return null;

        return {
          name: prev.name,
          type: detectType(newValue),
          value: newValue,
        };
      });
    } catch (err) {
      console.error(err);
      setStorage({});
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  }, [activeSource]);

  useEffect(() => {
    // eslint-disable-next-line
    loadStorage();
  }, [loadStorage]);

  useEffect(() => {
    if (activeSource === "cookies") {
      const handleCookieChange = () => {
        loadStorage();
      };

      chrome.cookies.onChanged.addListener(handleCookieChange);
      return () => {
        chrome.cookies.onChanged.removeListener(handleCookieChange);
      };
    }
  }, [activeSource, loadStorage]);

  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line
      setIsJson(false);
      setLastValidJson(null);
      return;
    }

    if (jsonDebounceRef.current) clearTimeout(jsonDebounceRef.current);

    jsonDebounceRef.current = setTimeout(() => {
      const trimmed = editValue.trim();
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        setIsJson(false);
        setLastValidJson(null);
        return;
      }
      try {
        const parsed = JSON.parse(editValue);
        if (typeof parsed === "object" && parsed !== null) {
          setIsJson(true);
          setLastValidJson(JSON.stringify(parsed, null, 2));
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }, 300);

    return () => {
      if (jsonDebounceRef.current) clearTimeout(jsonDebounceRef.current);
    };
  }, [editValue, isEditing]);

  const keys = useMemo<StorageKey[]>(() => {
    return Object.entries(storage)
      .map(([name, value]) => ({
        name,
        type: detectType(value),
        value,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storage]);

  const filteredKeys = useMemo(() => keys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()) || k.value.toLowerCase().includes(searchQuery.toLowerCase())), [keys, searchQuery]);
  const handleSelectKey = (key: StorageKey) => {
    if (selectedKey?.name === key.name) {
      setSelectedKey(null);
      setIsEditing(false);
    } else {
      setSelectedKey(key);
      setEditValue(storage[key.name] ?? "");
      setIsEditing(false);
      setIsAddingMode(false);
    }
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    try {
      let valueToSave = editValue;

      try {
        const parsed = JSON.parse(editValue);
        if (typeof parsed === "object" && parsed !== null) {
          valueToSave = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // Fallback to saving raw string if it's not valid JSON
      }
      await saveStorageKey(activeSource, selectedKey.name, valueToSave);
      notifications.show({
        title: "Success",
        message: `Successfully saved key "${selectedKey.name}"`,
        color: "green",
      });
      setIsEditing(false);
      await loadStorage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      notifications.show({
        title: "Error",
        message: `Failed to save "${selectedKey.name}": ${errorMessage}`,
        color: "red",
      });
      console.error(err);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyName.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Key name cannot be empty.",
        color: "orange",
      });
      return;
    }
    try {
      let valueToSave = newValue;

      try {
        const parsed = JSON.parse(newValue);
        if (typeof parsed === "object" && parsed !== null) {
          valueToSave = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // Fallback to saving raw string if it's not valid JSON
      }
      await saveStorageKey(activeSource, newKeyName, valueToSave);
      notifications.show({
        title: "Success",
        message: `Successfully added key "${newKeyName}"`,
        color: "green",
      });
      setIsAddingMode(false);
      setNewKeyName("");
      setNewValue("");
      await loadStorage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      notifications.show({
        title: "Error",
        message: `Failed to add key "${newKeyName}": ${errorMessage}`,
        color: "red",
      });
      console.error(err);
    }
  };
  const handleDelete = async (keyName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteStorageKey(activeSource, keyName);

      if (selectedKey?.name === keyName) {
        setSelectedKey(null);
      }

      await loadStorage();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearStorage(activeSource);
      setSelectedKey(null);
      await loadStorage();
      notifications.show({
        title: "Success",
        message: `Successfully cleared all keys in ${activeSource}`,
        color: "green",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      notifications.show({
        title: "Error",
        message: `Failed to clear storage ${activeSource}: ${errorMessage}`,
        color: "red",
      });
    }
  };

  const handleAddClick = useCallback(() => {
    setIsAddingMode((prev) => !prev);
    setIsEditing(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <AppShell className={styles.appShell} header={{ height: 44 }} padding="0">
      <AppShell.Header>
        <Header
          activeSource={activeSource}
          onSourceChange={setActiveSource}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={handleAddClick}
          onRefresh={loadStorage}
          onClearAll={handleClearAll}
          isRefreshing={isRefreshing}
        />
      </AppShell.Header>
      <AppShell.Main>
        <Splitter className={styles.splitter}>
          <Splitter.Pane className={styles.splitterPane} defaultSize={20} min={15} max={45}>
            <Sidebar
              keys={keys}
              filteredKeys={filteredKeys}
              selectedKey={selectedKey}
              onSelectKey={handleSelectKey}
              onDeleteKey={handleDelete}
              onClearSearch={handleClearSearch}
              sourceIndex={sourceIndex}
              activeSource={activeSource}
              isLoading={isLoading}
            />
          </Splitter.Pane>
          <Splitter.Pane className={`${styles.mainArea} ${styles.splitterPane}`} defaultSize={80} min={55} max={85}>
            <KeyContent
              activeSource={activeSource}
              selectedKey={selectedKey}
              storage={storage}
              isEditing={isEditing}
              onSetEditing={setIsEditing}
              editValue={editValue}
              onEditValueChange={setEditValue}
              onSave={handleSave}
              onDelete={handleDelete}
              isAddingMode={isAddingMode}
              onSetAddingMode={setIsAddingMode}
              newKeyName={newKeyName}
              onNewKeyNameChange={setNewKeyName}
              newValue={newValue}
              onNewValueChange={setNewValue}
              onAddKey={handleAddKey}
              isJson={isJson}
              lastValidJson={lastValidJson}
              isLoading={isLoading}
            />
          </Splitter.Pane>
        </Splitter>
      </AppShell.Main>
    </AppShell>
  );
}

export default Panel;
