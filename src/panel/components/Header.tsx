import { memo, useState } from "react";
import { Group, SegmentedControl, TextInput, ActionIcon, Tooltip, Text, Box, Flex, CloseButton, Menu, Divider } from "@mantine/core";
import { IconSearch, IconPlus, IconRefresh, IconDatabaseX, IconDotsVertical, IconSettings } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { type StorageSource } from "../services/storage";
import styles from "../styles/Header.module.css";
import settingStyles from "../styles/Settings.module.css";
import Settings from "./Settings";

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

const Header = memo(function Header({ activeSource, onSourceChange, searchQuery, onSearchChange, onAddClick, onRefresh, onClearAll, isRefreshing }: HeaderProps) {
  const [settingsOpened, setSettingsOpened] = useState(false);
  const showLogo = useMediaQuery("(max-width: 750px)");
  const collapseActions = useMediaQuery("(max-width: 550px)");
  return (
    <>
      <Flex className={styles.header} style={{ gap: collapseActions ? "5px" : undefined, padding: collapseActions ? "0 5px" : undefined }}>
        {!showLogo && (
          <Group className={styles.logoGroup}>
            <img src="/icons/icon16.png" alt="Better Devtools Storage Logo" width={16} height={16} />
            <Text fw={700} size="sm" c="indigo" className={styles.logoText}>
              Better Devtools Storage
            </Text>
          </Group>
        )}

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
          classNames={{ root: styles.searchRoot, input: styles.searchInput }}
        />

        {collapseActions ? (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPlus size={16} />} onClick={onAddClick}>
                Add new key
              </Menu.Item>
              <Menu.Item leftSection={<IconRefresh size={16} className={isRefreshing ? styles.spinning : undefined} />} onClick={onRefresh}>
                Refresh
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => setSettingsOpened(true)}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconDatabaseX size={16} />}
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
                Clear all keys
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <>
            <Group gap="xs">
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

              <Tooltip label="Settings">
                <ActionIcon className={settingStyles.settingsIcon} onClick={() => setSettingsOpened(true)}>
                  <IconSettings size={16} className={`${settingsOpened ? settingStyles.settingIconSpin : settingStyles.settingIconSpinBackwards}`} />
                </ActionIcon>
              </Tooltip>

              <Divider orientation="vertical" />

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
            </Group>
          </>
        )}
        <Settings opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
      </Flex>
    </>
  );
});

export default Header;
