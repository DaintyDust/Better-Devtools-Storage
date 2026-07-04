import { ActionIcon, Text, Badge, ScrollArea, Flex, Button, Center, UnstyledButton, EmptyState } from "@mantine/core";
import { IconDatabaseX, IconTrash, IconDatabase } from "@tabler/icons-react";
import { type StorageSource, type KeyType, type StorageKey } from "../services/storage";
import styles from "../styles/Sidebar.module.css";

interface SidebarProps {
  keys: StorageKey[];
  filteredKeys: StorageKey[];
  selectedKey: StorageKey | null;
  onSelectKey: (key: StorageKey) => void;
  onDeleteKey: (name: string, e?: React.MouseEvent) => void;
  onClearSearch: () => void;
  sourceIndex: number;
  activeSource: StorageSource;
}

export default function Sidebar({ keys, filteredKeys, selectedKey, onSelectKey, onDeleteKey, onClearSearch, sourceIndex, activeSource }: SidebarProps) {
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
    <>
      <div className={styles.carouselViewport}>
        <div className={styles.carouselTrack} style={{ transform: `translateX(-${sourceIndex * 33.3333}%)` }}>
          {(["localStorage", "sessionStorage", "cookies"] as StorageSource[]).map((source) => (
            <div key={source} className={styles.carouselSlide}>
              {source === activeSource ? (
                <>
                  <Flex className={styles.sidebarHeader}>
                    <Text size="xs" fw={600} tt="uppercase" lts={0.8} c="dimmed">
                      Keys
                    </Text>
                    <Badge size="sm" radius="xl">
                      {filteredKeys.length}
                    </Badge>
                  </Flex>

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
                          <Button size="xs" variant="default" onClick={onClearSearch}>
                            Clear Search
                          </Button>
                        </EmptyState.Actions>
                      </EmptyState>
                    </Center>
                  ) : (
                    <ScrollArea className={styles.sidebarScroll} type="hover">
                      {filteredKeys.map((item) => (
                        <UnstyledButton component="div" key={item.name} className={styles.keyItem} data-selected={selectedKey?.name === item.name} onClick={() => onSelectKey(item)}>
                          <Flex className={styles.keyItemInner}>
                            <Badge size="sm" variant="light" color={getKeyColor(item.type)} radius="sm" className={styles.keyBadge}>
                              {getKeyAbbr(item.type)}
                            </Badge>

                            <Text size="sm" truncate className={styles.keyNameText} fw={selectedKey?.name === item.name ? 500 : 400}>
                              {item.name}
                            </Text>

                            <ActionIcon size="sm" variant="subtle" color="red" onClick={(e) => onDeleteKey(item.name, e)} className={styles.deleteIcon}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Flex>
                        </UnstyledButton>
                      ))}
                    </ScrollArea>
                  )}
                </>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
