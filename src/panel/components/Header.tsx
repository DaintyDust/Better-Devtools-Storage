import { Group, SegmentedControl, TextInput, ActionIcon, Tooltip, Text, Box, Flex, CloseButton } from "@mantine/core";
import { IconSearch, IconPlus, IconRefresh, IconDatabaseX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { type StorageSource } from "../services/storage";
import styles from "../styles/Header.module.css";

interface HeaderProps {
  activeSource: StorageSource;
  onSourceChange: (source: StorageSource) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onRefresh: () => void;
  onClearAll: () => void;
  isRefreshing: boolean;
}

export default function Header({ activeSource, onSourceChange, searchQuery, onSearchChange, onAddClick, onRefresh, onClearAll, isRefreshing }: HeaderProps) {
  return (
    <>
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
          onChange={(value) => onSourceChange(value as StorageSource)}
        />

        <Box className={styles.spacer} />
        <TextInput
          placeholder="Filter keys…"
          size="xs"
          leftSection={<IconSearch size={14} />}
          rightSection={searchQuery && <CloseButton size="xs" onClick={() => onSearchChange("")} style={{ cursor: "pointer" }} />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          classNames={{ input: styles.searchInput }}
        />
        <Tooltip label="Add new key">
          <ActionIcon
            onClick={() => {
              onAddClick();
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Refresh">
          <ActionIcon onClick={onRefresh}>
            <IconRefresh size={16} className={isRefreshing ? styles.spinning : undefined} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Clear all keys">
          <ActionIcon
            color="red"
            className={styles.clearBtn}
            onClick={() => {
              modals.openConfirmModal({
                title: "Clear all keys",
                centered: true,
                children: (
                  <Text size="sm">
                    Are you sure you want to delete all keys in <strong>{activeSource}</strong>? This action cannot be undone.
                  </Text>
                ),
                labels: { confirm: "Clear keys", cancel: "Cancel" },
                confirmProps: { color: "red" },
                onConfirm: onClearAll,
                onCancel: () => {
                  notifications.show({
                    title: "Cancelled",
                    message: "Clear all keys action was cancelled.",
                    color: "gray",
                  });
                },
              });
            }}
          >
            <IconDatabaseX size={16} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    </>
  );
}
