/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Accordion,
  Avatar,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/Accordion.module.css';

interface ChatProps {
  folderId: string | null; // ya no se usa para RAG, lo dejo para compatibilidad con tu estado global
}

type RefWithMeta = {
  id?: string;
  file?: string;
  page?: number;
  paragraph?: string;
  file_url?: string;
  score?: number;
};

interface Message {
  role: 'user' | 'bot';
  content: string;
  // Puede venir como strings (context chunks) o como objetos con metadatos si más adelante lo agregas:
  references?: Array<string | RefWithMeta>;
  pdfUrl?: string;
}

type RagQueryResponse = {
  context: string[]; // lo que devuelve tu /query actual
  answer: string;
};

const RAG_URL = import.meta.env.VITE_RAG_URL as string;

const Chat = ({ folderId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Drawer para PDF (hoy no se usa porque el backend no entrega file_url; queda listo por si agregas metadatos)
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const [openedModalReference, { close }] = useDisclosure(false); // modal no usado ahora

  const sendMessage = async () => {
    const q = input.trim();
    if (!q) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!RAG_URL) throw new Error('RAG_URL no está definida. Configura VITE_RAG_URL en tu .env');

      // Llamada a FastAPI RAG
      const { data } = await axios.post<RagQueryResponse>(`${RAG_URL}/query`, {
        query: `${q}. Responde en español`,
        k: 3,
      });

      const botMessage: Message = {
        role: 'bot',
        content: data.answer ?? '',
        references: Array.isArray(data.context) ? data.context : [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error?.message || error);
      const errMsg: Message = {
        role: 'bot',
        content:
          'Ocurrió un error al procesar tu pregunta. Verifica la URL del servicio RAG o revisa la consola.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = (url: string) => {
    setPdfUrl(url);
    close();
    setDrawerOpened(true);
  };

  // Render de referencias: soporta string (chunk de contexto) o objeto con metadatos (futuro)
  const renderReferences = (refs: Array<string | RefWithMeta>) => {
    if (!refs?.length) return null;

    return (
      <>
        <Text size="sm" my="sm">
          Referencias:
        </Text>
        <Accordion classNames={classes}>
          {refs.map((ref, idx) => {
            const isString = typeof ref === 'string';
            const key = isString ? `ref-${idx}` : ref.id ?? `ref-${idx}`;
            const title = isString
              ? `Fragmento ${idx + 1}`
              : `${ref.file ?? 'Documento'} ${ref.page != null ? `- Página: ${ref.page}` : ''}`;

            const paragraph = isString ? (ref as string) : ref.paragraph || '';

            return (
              <Accordion.Item value={key} key={key}>
                <Accordion.Control>{title}</Accordion.Control>
                <Accordion.Panel>
                  <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                    {paragraph || (isString ? ref : 'Sin texto disponible para este fragmento')}
                  </Text>

                  {/* Botón "Ver documento" sólo si hay file_url */}
                  {!isString && (ref as RefWithMeta).file_url ? (
                    <div style={{ textAlign: 'center' }}>
                      <Button
                        variant="light"
                        onClick={() => openPdf((ref as RefWithMeta).file_url!)}
                        mt="sm"
                      >
                        Ver documento
                      </Button>
                    </div>
                  ) : null}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </>
    );
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
                // usa una ruta válida en tu proyecto; si no tienes logo, deja undefined
                src={msg.role === 'user' ? undefined : '/LOGOS_GEN.iality_web-15.svg'}
                style={{ width: rem(28), height: rem(28) }}
              />
              <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
            </div>

            {msg.role === 'bot' && Array.isArray(msg.references) && msg.references.length > 0
              ? renderReferences(msg.references)
              : null}
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
        <Button onClick={sendMessage} disabled={loading}>
          Enviar
        </Button>
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
