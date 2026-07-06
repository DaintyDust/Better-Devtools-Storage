import { useEffect, useMemo, useRef, useState } from "react";
import { Group, TextInput, Text, Badge, ScrollArea, Box, Flex, Button, Center, Textarea, EmptyState, Splitter, Transition, CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import { IconEdit, IconTrash, IconDatabase, IconEye, IconCopy, IconCheck, IconTextWrap, IconTextWrapDisabled } from "@tabler/icons-react";
import { type UseSplitterReturnValue } from "@mantine/hooks";
import JsonHighlight from "./JsonHighlight";
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
  isLoading: boolean;
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
  isLoading,
}: KeyContentProps) {
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [lineWrapEnabled, setLineWrapEnabled] = useState(true);
  const splitterSizesRef = useRef<[number, number]>([40, 60]);
  const splitterRef = useRef<UseSplitterReturnValue>(null);

  useEffect(() => {
    if (isEditing && isJson && splitterRef.current) {
      splitterRef.current.setSizes(splitterSizesRef.current);
      setPreviewCollapsed(splitterSizesRef.current[0] === 0);
    }
  }, [isEditing, isJson]);

  const handleExpandPreview = () => {
    splitterRef.current?.expand(0);
    setPreviewCollapsed(false);
  };

  const isValidJson = useMemo(() => {
    try {
      const parsed = JSON.parse(editValue);
      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  }, [editValue]);

  const formattedJson = useMemo(() => {
    if (!selectedKey || selectedKey.type !== "json") return "";
    const value = storage[selectedKey.name] ?? "";
    if (!value) return "";
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }, [selectedKey, storage]);

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

      {!selectedKey || isLoading ? (
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
                {isJson ? (
                  <Splitter
                    className={styles.splitter}
                    splitterRef={splitterRef}
                    onSizeChange={(sizes) => {
                      splitterSizesRef.current = [sizes[0] as number, sizes[1] as number];
                      setPreviewCollapsed(sizes[0] === 0);
                    }}
                    withHandle={!previewCollapsed}
                    lineSize={previewCollapsed ? 0 : 2}
                  >
                    <Splitter.Pane className={styles.splitterPane} defaultSize={40} min={20} max={70} collapsible>
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
                          <Flex justify="center" align="center" mb={0} gap="md">
                            <Tooltip label={lineWrapEnabled ? "Disable line wrap" : "Enable line wrap"} position="bottom">
                              <UnstyledButton className={styles.codeHighlightButton} onClick={() => setLineWrapEnabled(!lineWrapEnabled)}>
                                {lineWrapEnabled ? <IconTextWrapDisabled size={18} /> : <IconTextWrap size={18} />}
                              </UnstyledButton>
                            </Tooltip>
                            <CopyButton value={lastValidJson || ""}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? "Copied" : "Copy"} position="bottom">
                                  <UnstyledButton className={styles.codeHighlightButton} onClick={copy}>
                                    {copied ? <IconCheck size={18} color={copied ? "teal" : "gray"} /> : <IconCopy size={18} />}
                                  </UnstyledButton>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Flex>
                        </Flex>

                        <ScrollArea className={styles.previewScroll}>
                          <JsonHighlight
                            code={lastValidJson || "Invalid JSON"}
                            language={selectedKey.type === "json" ? "json" : "txt"}
                            lineWrap={lineWrapEnabled}
                            withLineNumbers
                            opacity={isValidJson ? 1 : 0.55}
                          />
                          {/* <Text ff="monospace" size="sm" className={styles.previewText} style={{ opacity: isValidJson ? 1 : 0.55 }}>
                            {lastValidJson || "Invalid JSON"}
                          </Text> */}
                        </ScrollArea>
                      </Box>
                    </Splitter.Pane>

                    <Splitter.Pane className={styles.splitterPane} defaultSize={60} min={30} max={80}>
                      <Flex className={styles.editorPane}>
                        <Textarea
                          value={editValue}
                          onChange={(e) => onEditValueChange(e.currentTarget.value)}
                          classNames={{
                            root: styles.textareaRoot,
                            wrapper: styles.textareaWrapper,
                            input: styles.textareaInput,
                          }}
                          styles={{
                            input: {
                              whiteSpace: lineWrapEnabled ? "pre-wrap" : "pre",
                              wordBreak: "break-all",
                            },
                          }}
                          spellCheck={false}
                        />
                        <Transition mounted={previewCollapsed} transition="pop" duration={200}>
                          {(transitionStyles) => (
                            <Button
                              leftSection={<IconEye size={16} />}
                              size="xs"
                              onClick={handleExpandPreview}
                              className={styles.livePreviewButton}
                              style={{
                                ...transitionStyles,
                              }}
                            >
                              Show Live Preview
                            </Button>
                          )}
                        </Transition>
                      </Flex>
                    </Splitter.Pane>
                  </Splitter>
                ) : (
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
                )}
              </Flex>
            ) : (
              <ScrollArea key={selectedKey.name} className={`${styles.readOnlyArea} ${styles.slideIn}`}>
                <Flex justify="end" align="center" mb={0} gap="md">
                  <Tooltip label={lineWrapEnabled ? "Disable line wrap" : "Enable line wrap"} position="bottom">
                    <UnstyledButton className={styles.codeHighlightButton} onClick={() => setLineWrapEnabled(!lineWrapEnabled)}>
                      {lineWrapEnabled ? <IconTextWrapDisabled size={18} /> : <IconTextWrap size={18} />}
                    </UnstyledButton>
                  </Tooltip>
                  <CopyButton value={storage[selectedKey.name] || ""}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy"} position="bottom">
                        <UnstyledButton className={styles.codeHighlightButton} onClick={copy}>
                          {copied ? <IconCheck size={18} color={copied ? "teal" : "gray"} /> : <IconCopy size={18} />}
                        </UnstyledButton>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
                {(storage[selectedKey.name] ?? "").length > 5000 ? (
                  <Text ff="monospace" style={{ whiteSpace: lineWrapEnabled ? "pre-wrap" : "pre" }}>
                    {storage[selectedKey.name] ?? ""}
                  </Text>
                ) : selectedKey.type === "json" ? (
                  <JsonHighlight code={formattedJson} lineWrap={lineWrapEnabled} language={selectedKey.type === "json" ? "json" : "txt"} />
                ) : (
                  <Text ff="monospace" style={{ whiteSpace: lineWrapEnabled ? "pre-wrap" : "pre" }}>
                    {storage[selectedKey.name] ?? ""}
                  </Text>
                )}
                {/* <Text ff="monospace" style={{ whiteSpace: "pre-wrap" }}>
                  {storage[selectedKey.name] ?? ""}
                </Text> */}
              </ScrollArea>
            )}
          </Box>
        </Flex>
      )}
    </>
  );
}
