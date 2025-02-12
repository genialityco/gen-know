import { useState } from 'react';
import axios from 'axios';
import {
  TextInput,
  Button,
  Group,
  ScrollArea,
  Text,
  Box,
  Loader,
  Paper,
  Drawer,
  HoverCard,
  Popover,
  Modal,
  Center,
  Accordion,
  Avatar,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/Accordion.module.css';

interface ChatProps {
  folderId: string | null;
}

interface Message {
  role: string;
  content: string;
  references?: Array<any>;
  pdfUrl?: string;
}

const Chat = ({ folderId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfPage, setPdfPage] = useState(1);
  const [openedModalReference, { open, close }] = useDisclosure(false);

  const sendMessage = async () => {
    if (input) {
      const userMessage = { role: 'user', content: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);
      console.log(folderId);
      const formData = new FormData();
      formData.append('secretkey', import.meta.env.VITE_CHATPDF_KEY);
      formData.append('question', input + '. Responde en español');
      formData.append('folder_id', folderId as string);

      console.log(formData);
      try {
        const response = await axios.post('/api-ask-from-collection', formData);

        const { answer, documents } = response.data.data;
        // const bestMatch = documents.reduce((prev: any, current: any) =>
        //   prev.score > current.score ? prev : current
        // );
        // const documentReference = `${bestMatch.paragraph}`;
        console.log(documents);
        const botMessageContent = `${answer}`;

        const botMessage = {
          role: 'bot',
          content: botMessageContent,
          references: documents,
          // pdfUrl: `${bestMatch.file_url}#page=${bestMatch.page + 1}`,
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setLoading(false);
      } catch (error: any) {
        console.error('Error sending message:', error.message);
        setLoading(false);
      }
    }
  };

  const openPdf = (url: string) => {
    setPdfUrl(url);
    close();
    setDrawerOpened(true);
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '490px', maxHeight: '460px' }}>
      <ScrollArea
        style={{
          flex: 1,
          padding: 10,
          border: '1px solid #ccc',
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        {messages.map((msg, index) => (
          <Paper
            key={index}
            shadow="xs"
            mb="sm"
            p="sm"
            style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Avatar
                radius="xl"
                src={msg.role === 'user' ? undefined : '/src/public/LOGOS_GEN.iality_web-15.svg'}
              />
              <Text>{msg.content}</Text>
            </div>
            {msg.role === 'bot' && msg.references && (
              <div>
                <Text size="sm" my="sm">
                  Referencias:
                </Text>
                {msg.references.map(
                  (reference: any) =>
                    reference.paragraph !== '' && (
                      <Accordion classNames={classes}>
                        <Accordion.Item value={reference.file} key={reference.id}>
                          <Accordion.Control>
                            {reference.file} - Pagina: {reference.page}
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Text size="xs">{reference.paragraph}</Text>
                            <div style={{ textAlign: 'center' }}>
                              <Button
                                variant="light"
                                onClick={() => openPdf(reference.file_url || '')}
                                mt="sm"
                              >
                                Ver documento
                              </Button>
                            </div>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    )
                )}
              </div>
            )}
            <Modal opened={openedModalReference} onClose={close} title="Referencias" size="xl">
              <Center>
                <Text size="xs">{msg.references}</Text>
              </Center>
              <Center mt="20">
                <Button variant="link" onClick={() => openPdf(msg.pdfUrl || '')}>
                  Ver documento
                </Button>
              </Center>
            </Modal>
          </Paper>
        ))}
        {loading && (
          <Group>
            <Loader size="sm" />
            <Text>Cargando respuesta...</Text>
          </Group>
        )}
      </ScrollArea>
      <Group>
        <TextInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1 }}
          placeholder="Escribe tu mensaje..."
        />
        <Button onClick={sendMessage}>Enviar</Button>
      </Group>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Documento PDF"
        padding="xl"
        size="xl"
      >
        <iframe src={pdfUrl} style={{ border: 'none', width: '100%', height: '78vh' }} />
      </Drawer>
    </Box>
  );
};

export default Chat;
