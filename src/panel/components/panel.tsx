import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell, Group, SegmentedControl, TextInput, ActionIcon, Tooltip, Text, Badge, ScrollArea, Box, Flex, Button, Center, Textarea, UnstyledButton, Splitter, EmptyState } from "@mantine/core";
import { IconSearch, IconPlus, IconRefresh, IconDatabaseX, IconEdit, IconTrash, IconDatabase } from "@tabler/icons-react";
import { fetchStorage, deleteStorageKey, clearStorage, type StorageSource, type KeyType, type StorageKey } from "../services/storage";
import ThemeProvider from "@theme/ThemeProvider.tsx";
import styles from "../styles/panel.module.css";

function detectType(value: string): KeyType {
  if (value === "true" || value === "false") {
    return "boolean";
  }

  if (value.trim() !== "" && !Number.isNaN(Number(value))) {
    return "number";
  }

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "object" && parsed !== null) {
      return "json";
    }
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

  const loadStorage = useCallback(async () => {
    try {
      const data = await fetchStorage(activeSource);

      setStorage(data as Record<string, string>);

      setSelectedKey((prev) => (prev && !(prev.name in data) ? null : prev));
    } catch (err) {
      console.error(err);
      setStorage({});
    }
  }, [activeSource]);

  useEffect(() => {
    // eslint-disable-next-line
    loadStorage();
  }, [loadStorage]);

  const keys = useMemo<StorageKey[]>(() => {
    return Object.entries(storage)
      .map(([name, value]) => ({
        name,
        type: detectType(value),
        value,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storage]);

  const filteredKeys = keys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()) || k.value.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSelectKey = (key: StorageKey) => {
    setSelectedKey(key);
    setEditValue(storage[key.name] ?? "");
    setIsEditing(false);
    setIsAddingMode(false);
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

  const getKeyColor = (type: KeyType) => {
    switch (type) {
      case "json":
        return "blue";
      case "string":
        return "green";
      case "number":
        return "orange";
      case "boolean":
        return "red";
      default:
        return "gray";
    }
  };

  const getKeyAbbr = (type: KeyType) => {
    switch (type) {
      case "json":
        return "{ }";
      case "string":
        return '" "';
      case "number":
        return "123";
      case "boolean":
        return "tf";
      default:
        return "??";
    }
  };

  return (
    <ThemeProvider>
      <AppShell className={styles.appShell} header={{ height: 44 }} padding="0">
        <AppShell.Header>
          <Flex className={styles.header}>
            <Group className={styles.logoGroup}>
              <img src="/icons/icon16.png" alt="Better Devtools Storage Logo" width={16} height={16} />
              <Text fw={700} size="sm" c="indigo" className={styles.logoText}>
                Better Devtools Storage
              </Text>
            </Group>

            <SegmentedControl
              size="xs"
              data={[
                { label: "localStorage", value: "localStorage" },
                { label: "sessionStorage", value: "sessionStorage" },
                { label: "Cookies", value: "cookies" },
              ]}
              value={activeSource}
              onChange={(value) => setActiveSource(value as StorageSource)}
            />

            <Box className={styles.spacer} />
            <TextInput placeholder="Filter keys…" size="xs" leftSection={<IconSearch size={14} />} value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)} classNames={{ input: styles.searchInput }} />
            <Tooltip label="Add new key">
              <ActionIcon
                onClick={() => {
                  setIsAddingMode(true);
                  setSelectedKey(null);
                  setIsEditing(false);
                }}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Refresh">
              <ActionIcon onClick={loadStorage}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Clear all keys">
              <ActionIcon
                color="red"
                className={styles.clearBtn}
                onClick={async () => {
                  await clearStorage(activeSource);
                  setSelectedKey(null);
                  loadStorage();
                }}
              >
                <IconDatabaseX size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </AppShell.Header>
        <AppShell.Main>
          <Splitter style={{ height: "calc(100vh - 44px)" }}>
            <Splitter.Pane defaultSize={20} min={15} max={45} style={{ display: "flex", flexDirection: "column" }}>
              <Flex className={styles.sidebarHeader}>
                <Text size="xs" fw={600} tt="uppercase" lts={0.8} c="dimmed">
                  Keys
                </Text>
                <Badge size="sm" radius="xl">
                  {filteredKeys.length}
                </Badge>
              </Flex>

              {/* {filteredKeys.length === 0 ? (
                  <Text size="xs" c="dimmed" ta="center" py="xl">
                  No keys found
                  </Text>
                  ) : ( */}
              {keys.length === 0 ? (
                <Center className={styles.emptyStateContainer}>
                  <EmptyState size="xs" icon={<IconDatabase size={32} stroke={1.2} className={styles.emptyStateIcon} />} title="Storage is empty" align="center" withIndicatorBackground={false} p="md">
                    <EmptyState.Description className={styles.emptyStateDescription}>No keys found in this storage source.</EmptyState.Description>
                  </EmptyState>
                </Center>
              ) : filteredKeys.length === 0 ? (
                <Center className={styles.emptyStateContainer}>
                  <EmptyState size="xs" icon={<IconDatabaseX size={48} stroke={1.2} className={styles.emptyStateIcon} />} title="No matching keys" align="center" withIndicatorBackground={false}>
                    <EmptyState.Description className={styles.emptyStateDescription}>Try adjusting your search query or clear it.</EmptyState.Description>
                    <EmptyState.Actions>
                      <Button size="xs" variant="default" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </EmptyState.Actions>
                  </EmptyState>
                </Center>
              ) : (
                <ScrollArea className={styles.sidebarScroll} type="hover" style={{ flex: 1 }}>
                  {filteredKeys.map((item) => (
                    <UnstyledButton component="div" key={item.name} className={styles.keyItem} data-selected={selectedKey?.name === item.name} onClick={() => handleSelectKey(item)}>
                      <Flex className={styles.keyItemInner}>
                        <Badge size="sm" variant="light" color={getKeyColor(item.type)} radius="sm" className={styles.keyBadge}>
                          {getKeyAbbr(item.type)}
                        </Badge>

                        <Text size="sm" truncate className={styles.keyNameText} fw={selectedKey?.name === item.name ? 500 : 400}>
                          {item.name}
                        </Text>

                        <ActionIcon size="sm" variant="subtle" color="red" onClick={(e) => handleDelete(item.name, e)} className={styles.deleteIcon}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Flex>
                    </UnstyledButton>
                  ))}
                </ScrollArea>
              )}
            </Splitter.Pane>
            <Splitter.Pane className={styles.mainArea} defaultSize={80} min={55} max={85} style={{ display: "flex", flexDirection: "column" }}>
              {!selectedKey && !isAddingMode && (
                <Center className={styles.emptyStateContainer}>
                  <EmptyState size="sm" icon={<IconDatabase size={48} stroke={1.2} className={styles.emptyStateIcon} />} title="No Key Selected" align="center" withIndicatorBackground={false}>
                    <EmptyState.Description className={styles.emptyStateDescription}>Select a key from the sidebar list to inspect, edit, or delete its value.</EmptyState.Description>
                  </EmptyState>
                </Center>
              )}

              {selectedKey && (
                <>
                  <Flex className={styles.topbar}>
                    {isEditing ? (
                      <Text size="xs" c="dimmed" className={styles.topbarTitle}>
                        Editing as{" "}
                        <Text component="strong" c="text">
                          raw string
                        </Text>{" "}
                        in{" "}
                        <Text component="strong" c="text">
                          {activeSource}
                        </Text>
                      </Text>
                    ) : (
                      <>
                        <Text ff="monospace" size="sm" fw={600} c="indigo" truncate className={styles.topbarTitle}>
                          {selectedKey.name}
                        </Text>
                        <Badge size="sm" variant="light" color="gray" radius="xl" tt="lowercase">
                          {selectedKey.type}
                        </Badge>
                      </>
                    )}

                    <Group className={styles.topbarActions}>
                      {isEditing ? (
                        <>
                          <Button variant="default" size="xs" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button size="xs">Save</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="default" size="xs" leftSection={<IconEdit size={14} />} onClick={() => setIsEditing(true)}>
                            Edit
                          </Button>
                          <Button variant="light" color="red" size="xs" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(selectedKey.name)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </Group>
                  </Flex>

                  <Box className={styles.contentArea}>
                    {isEditing ? (
                      <Flex className={styles.editSplit}>
                        <Box className={styles.previewPane}>
                          <Text size="xs" fw={600} tt="uppercase" lts={0.7} c="dimmed" className={styles.previewLabel}>
                            Live Preview
                          </Text>
                          <Box ff="monospace" size="sm" c="dimmed">
                            {"{ ... }"}
                          </Box>
                        </Box>

                        <Flex className={styles.editorPane}>
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.currentTarget.value)}
                            classNames={{
                              root: styles.textareaRoot,
                              wrapper: styles.textareaWrapper,
                              input: styles.textareaInput,
                            }}
                            spellCheck={false}
                          />
                        </Flex>
                      </Flex>
                    ) : (
                      <ScrollArea className={styles.readOnlyArea}>
                        <Text ff="monospace" style={{ whiteSpace: "pre-wrap" }}>
                          {storage[selectedKey.name] ?? ""}
                        </Text>
                      </ScrollArea>
                    )}
                  </Box>
                </>
              )}

              {isAddingMode && (
                <Flex className={styles.newKeyBar}>
                  <TextInput placeholder="Key name…" size="xs" value={newKeyName} onChange={(e) => setNewKeyName(e.currentTarget.value)} className={styles.newKeyInput} />
                  <TextInput placeholder="Value (string or JSON)…" size="xs" value={newValue} onChange={(e) => setNewValue(e.currentTarget.value)} className={styles.newValInput} />
                  <Button size="xs" variant="filled">
                    Add
                  </Button>
                  <Button size="xs" variant="default" onClick={() => setIsAddingMode(false)}>
                    Cancel
                  </Button>
                </Flex>
              )}
            </Splitter.Pane>
          </Splitter>
        </AppShell.Main>
      </AppShell>
    </ThemeProvider>
  );
}

export default Panel;
