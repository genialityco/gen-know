import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { ActionIcon, Avatar, Button, Container, Drawer, Menu, rem } from '@mantine/core';
import {
  IconMenu2,
  IconHome,
  IconMessageChatbot,
  IconSettings,
  IconEaseInOut,
  IconLogout,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LandingChat } from '@/components/LandingChat/LandingChat';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user, logout } = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);

  return (
    <div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 0 5px white',
          marginBottom: '20px',
        }}
      >
        <div>
          <ActionIcon onClick={open} size="xl" variant="transparent" style={{ margin: 'auto' }}>
            <IconMenu2 />
          </ActionIcon>
        </div>
        <div>
          {user && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar radius="xl" style={{ margin: '5px' }} />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Aplicación</Menu.Label>
                <Menu.Item
                  disabled
                  leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  disabled
                  leftSection={<IconMessageChatbot style={{ width: rem(14), height: rem(14) }} />}
                >
                  Messages
                </Menu.Item>

                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={logout}
                >
                  Cerrar sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </div>

      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Menu>
          <Menu.Item
            mt="xs"
            leftSection={<IconHome style={{ width: rem(30), height: rem(30) }} />}
            onClick={() => setIsWelcomeVisible(true)}
          >
            Inicio
          </Menu.Item>
          <Menu.Item
            mt="xs"
            leftSection={<IconMessageChatbot style={{ width: rem(30), height: rem(30) }} />}
            onClick={() => setIsWelcomeVisible(false)}
          >
            Chat
          </Menu.Item>
        </Menu>
      </Drawer>

      {isWelcomeVisible ? (
        <div>
          <Welcome />
          <ColorSchemeToggle setIsWelcomeVisible={setIsWelcomeVisible} />
        </div>
      ) : (
        <div>
          <LandingChat />
        </div>
      )}
    </div>
  );
}
