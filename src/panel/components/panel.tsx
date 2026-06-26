import React, { useState } from "react";
import { AppShell, Group, SegmentedControl, TextInput, ActionIcon, Tooltip, Text, Badge, ScrollArea, Box, Flex, Button, Center, Stack, Textarea, UnstyledButton } from "@mantine/core";
import { IconSearch, IconPlus, IconRefresh, IconClearAll, IconEdit, IconTrash, IconDatabase } from "@tabler/icons-react";
import ThemeProvider from "@theme/ThemeProvider.tsx";
import styles from "../styles/panel.module.css";

// type StorageSource = "localStorage" | "sessionStorage" | "extension";
type KeyType = "json" | "string" | "number" | "boolean" | "other";

interface StorageKey {
  name: string;
  type: KeyType;
}

function Panel() {
  const [activeSource, setActiveSource] = useState<string>("localStorage");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<StorageKey | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newValue, setNewValue] = useState("");

  const mockKeys: StorageKey[] = [
    { name: "user_preferences", type: "json" },
    { name: "auth_token", type: "string" },
    { name: "theme", type: "string" },
    { name: "visit_count", type: "number" },
    { name: "is_logged_in", type: "boolean" },
  ];

  const filteredKeys = mockKeys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSelectKey = (key: StorageKey) => {
    setSelectedKey(key);
    setIsEditing(false);
    setIsAddingMode(false);
  };

  const handleDelete = (keyName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedKey?.name === keyName) setSelectedKey(null);
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
        return "{}";
      case "string":
        return '""';
      case "number":
        return "12";
      case "boolean":
        return "tf";
      default:
        return "??";
    }
  };

  return (
    <ThemeProvider>
      <AppShell className={styles.appShell} header={{ height: 44 }} navbar={{ width: 220, breakpoint: "sm" }} padding="0">
        <AppShell.Header>
          <Flex className={styles.header}>
            <Group className={styles.logoGroup}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#4c9aff" opacity=".9" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#7ee8a2" opacity=".8" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#ffd166" opacity=".8" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#ff6b6b" opacity=".8" />
              </svg>
              <Text fw={700} size="sm" c="blue.5" className={styles.logoText}>
                Better Devtools Storage
              </Text>
            </Group>

            <SegmentedControl
              size="xs"
              data={[
                { label: "localStorage", value: "localStorage" },
                { label: "sessionStorage", value: "sessionStorage" },
                { label: "Extension", value: "extension" },
              ]}
              value={activeSource}
              onChange={setActiveSource}
            />

            <Box className={styles.spacer} />
            <TextInput placeholder="Filter keys…" size="xs" leftSection={<IconSearch size={14} />} value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)} classNames={{ input: styles.searchInput }} />
            <Tooltip label="Add new key">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  setIsAddingMode(true);
                  setIsEditing(false);
                  setSelectedKey(null);
                }}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Refresh">
              <ActionIcon variant="subtle" color="gray">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Clear all keys">
              <ActionIcon variant="subtle" color="red" className={styles.clearBtn}>
                <IconClearAll size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </AppShell.Header>

        <AppShell.Navbar>
          <Flex className={styles.sidebarHeader}>
            <Text size="xs" fw={600} tt="uppercase" lts={0.8} c="dimmed">
              Keys
            </Text>
            <Badge size="sm" variant="light" color="gray" radius="xl">
              {filteredKeys.length}
            </Badge>
          </Flex>

          <ScrollArea className={styles.sidebarScroll} type="hover">
            {filteredKeys.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="xl">
                No keys found
              </Text>
            ) : (
              filteredKeys.map((item) => (
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
              ))
            )}
          </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main className={styles.mainArea}>
          {!selectedKey && !isAddingMode && (
            <Center className={styles.emptyStateContainer}>
              <Stack align="center" className={styles.emptyStateStack}>
                <IconDatabase size={48} stroke={1.2} className={styles.emptyStateIcon} />
                <Text size="sm" ta="center" className={styles.emptyStateText}>
                  Select a key from the sidebar to inspect its value
                </Text>
              </Stack>
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
                    <Text ff="monospace" size="sm" fw={600} c="blue.5" truncate className={styles.topbarTitle}>
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
                      <Button variant="filled" size="xs" color="blue">
                        Save
                      </Button>
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
                    <Text ff="monospace" size="sm" className={styles.jsonPlaceholder}>
                      {`{\n  "placeholder": "Your JSON tree renderer will mount here"\n}`}
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
              <Button size="xs" variant="filled" color="blue">
                Add
              </Button>
              <Button size="xs" variant="default" onClick={() => setIsAddingMode(false)}>
                Cancel
              </Button>
            </Flex>
          )}
        </AppShell.Main>
      </AppShell>
    </ThemeProvider>
  );
}

export default Panel;
