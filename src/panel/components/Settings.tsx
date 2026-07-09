import { Modal, SegmentedControl, Center, Text, Stack, Button, useMantineColorScheme, rem } from "@mantine/core";
import styles from "../styles/Settings.module.css";
import { IconMoon, IconSun, IconDeviceDesktop, IconBrandGithub, IconCoffee } from "@tabler/icons-react";

interface SettingsProps {
  opened: boolean;
  onClose: () => void;
}

export default function Settings({ opened, onClose }: SettingsProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      centered
      size={320}
      transitionProps={{ transition: "slide-up", duration: 250, timingFunction: "ease-out" }}
      classNames={{
        header: styles.modalHeader,
        title: styles.modalTitle,
      }}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.8}>
            Appearance
          </Text>
          <SegmentedControl
            value={colorScheme}
            onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
            data={[
              {
                value: "light",
                label: (
                  <Center style={{ gap: rem(6) }}>
                    <IconSun style={{ width: rem(16), height: rem(16) }} />
                    <Text size="xs">Light</Text>
                  </Center>
                ),
              },
              {
                value: "dark",
                label: (
                  <Center style={{ gap: rem(6) }}>
                    <IconMoon style={{ width: rem(16), height: rem(16) }} />
                    <Text size="xs">Dark</Text>
                  </Center>
                ),
              },
              {
                value: "auto",
                label: (
                  <Center style={{ gap: rem(6) }}>
                    <IconDeviceDesktop style={{ width: rem(16), height: rem(16) }} />
                    <Text size="xs">Auto</Text>
                  </Center>
                ),
              },
            ]}
            fullWidth
            size="xs"
          ></SegmentedControl>
          {/* <Switch
            size="md"
            onLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
            offLabel={<IconMoon size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
            checked={colorScheme === "dark"}
            onChange={handleToggleTheme}
            style={{ cursor: "pointer" }}
          /> */}
        </Stack>
        <Stack gap="sm" mt="sm">
          <Text size="sm" fw={500} c="dimmed" tt="uppercase" lts={0.8}>
            About
          </Text>
          <Button
            component="a"
            href="https://github.com/DaintyDust/Better-Devtools-Storage"
            target="_blank"
            size="sm"
            leftSection={<IconBrandGithub size={16} />}
            fullWidth
            styles={{ inner: { justifyContent: "flex-start" } }}
          >
            Github Source
          </Button>
          <Button component="a" href="https://www.buymeacoffee.com/daintydust" target="_blank" size="sm" leftSection={<IconCoffee size={16} />} fullWidth styles={{ inner: { justifyContent: "flex-start" } }}>
            Buy me a coffee
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
