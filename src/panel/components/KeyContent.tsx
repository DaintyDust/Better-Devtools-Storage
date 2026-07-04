import { useMemo } from "react";
import { Group, TextInput, Text, Badge, ScrollArea, Box, Flex, Button, Center, Textarea, EmptyState } from "@mantine/core";
import { IconEdit, IconTrash, IconDatabase } from "@tabler/icons-react";
import { type StorageSource, type StorageKey } from "../services/storage";
import styles from "../styles/KeyContent.module.css";

interface KeyContentProps {
  activeSource: StorageSource;
  selectedKey: StorageKey | null;
  storage: Record<string, string>;
  isEditing: boolean;
  onSetEditing: (editing: boolean) => void;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onSave: () => void;
  onDelete: (name: string) => void;
  isAddingMode: boolean;
  onSetAddingMode: (mode: boolean) => void;
  newKeyName: string;
  onNewKeyNameChange: (name: string) => void;
  newValue: string;
  onNewValueChange: (value: string) => void;
  onAddKey: () => void;
  isJson: boolean;
  lastValidJson: string | null;
}

export default function KeyContent({
  activeSource,
  selectedKey,
  storage,
  isEditing,
  onSetEditing,
  editValue,
  onEditValueChange,
  onSave,
  onDelete,
  isAddingMode,
  onSetAddingMode,
  newKeyName,
  onNewKeyNameChange,
  newValue,
  onNewValueChange,
  onAddKey,
  isJson,
  lastValidJson,
}: KeyContentProps) {
  const isValidJson = useMemo(() => {
    try {
      const parsed = JSON.parse(editValue);
      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  }, [editValue]);

  return (
    <>
      <Flex className={`${styles.newKeyBar} ${isAddingMode ? styles.newKeyBarActive : ""}`}>
        <TextInput placeholder="Key name…" size="xs" value={newKeyName} onChange={(e) => onNewKeyNameChange(e.currentTarget.value)} className={styles.newKeyInput} />
        <TextInput placeholder="Value (string or JSON)…" size="xs" value={newValue} onChange={(e) => onNewValueChange(e.currentTarget.value)} className={styles.newValInput} />
        <Button size="xs" variant="filled" onClick={onAddKey}>
          Add
        </Button>
        <Button size="xs" variant="default" onClick={() => onSetAddingMode(false)}>
          Cancel
        </Button>
      </Flex>
      {/* )} */}

      {!selectedKey ? (
        <Center className={styles.emptyStateContainer}>
          <EmptyState size="sm" icon={<IconDatabase size={48} stroke={1.2} className={styles.emptyStateIcon} />} title="No Key Selected" align="center" withIndicatorBackground={false}>
            <EmptyState.Description className={styles.emptyStateDescription}>Select a key from the sidebar list to inspect, edit, or delete its value.</EmptyState.Description>
          </EmptyState>
        </Center>
      ) : (
        <Flex direction="column" style={{ flex: 1, overflow: "hidden" }}>
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
                <Text key={selectedKey.name} ff="monospace" size="sm" fw={600} c="indigo" truncate className={`${styles.topbarTitle} ${styles.slideIn}`}>
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
                  <Button variant="default" size="xs" onClick={() => onSetEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="xs" onClick={onSave}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" size="xs" leftSection={<IconEdit size={14} />} onClick={() => onSetEditing(true)}>
                    Edit
                  </Button>
                  <Button variant="light" color="red" size="xs" leftSection={<IconTrash size={14} />} onClick={() => onDelete(selectedKey.name)}>
                    Delete
                  </Button>
                </>
              )}
            </Group>
          </Flex>

          <Box className={styles.contentArea}>
            {isEditing ? (
              <Flex key={selectedKey.name} className={`${styles.editSplit} ${styles.slideIn}`}>
                {isJson && (
                  <Box className={styles.previewPane}>
                    <Flex justify="space-between" align="center" className={styles.previewLabel} mb="xs">
                      <Text size="xs" fw={600} tt="uppercase" lts={0.7} c="dimmed">
                        Live Preview
                      </Text>
                      {!isValidJson && (
                        <Badge size="xs" color="orange" variant="light">
                          Invalid JSON
                        </Badge>
                      )}
                    </Flex>

                    <ScrollArea className={styles.previewScroll}>
                      <Text ff="monospace" size="sm" className={styles.previewText} style={{ opacity: isValidJson ? 1 : 0.55 }}>
                        {lastValidJson || "Invalid JSON"}
                      </Text>
                    </ScrollArea>
                  </Box>
                )}

                <Flex className={styles.editorPane}>
                  <Textarea
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.currentTarget.value)}
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
              <ScrollArea key={selectedKey.name} className={`${styles.readOnlyArea} ${styles.slideIn}`}>
                <Text ff="monospace" style={{ whiteSpace: "pre-wrap" }}>
                  {storage[selectedKey.name] ?? ""}
                </Text>
              </ScrollArea>
            )}
          </Box>
        </Flex>
      )}
    </>
  );
}
