import { Button, Group, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle({ setIsWelcomeVisible }: { setIsWelcomeVisible: (value: boolean) => void }) {
  const { setColorScheme } = useMantineColorScheme();

  const showWelcome = () => {
    setIsWelcomeVisible(false);
  }

  return (
    <Group justify="center" mt="xl">
      <Button onClick={showWelcome}>Chatear</Button>
      <Button variant="default" onClick={() => setColorScheme('light')}>
        Light
      </Button>
      <Button variant="default" onClick={() => setColorScheme('dark')}>
        Dark
      </Button>
    </Group>
  );
}
