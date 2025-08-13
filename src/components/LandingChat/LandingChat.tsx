/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  List,
  Text,
  ActionIcon,
  Card,
  Group,
  Loader,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import PDFUploader from '../PDFUploader';
import Chat from '../Chat';
// Si ya no necesitas auth/Firestore, puedes quitar estas dos líneas:
import { useAuth } from '@/context/AuthContext';
import { LoginAnonymously } from '@/pages/auth/LoginAnonymously.page';

const RAG_URL = import.meta.env.VITE_RAG_URL as string;

type RagDoc = {
  id: string;
  original_name?: string | null;
  stored_name?: string | null;
  ext?: string | null;
  file_url?: string | null; // relativa, ej: /uploads/archivo__abcd1234.pdf
};

export const LandingChat = () => {
  // Si no necesitas auth/anon login, elimina estas dos líneas y el bloque <LoginAnonymously/>
  const { user, folderId } = useAuth();

  const [documents, setDocuments] = useState<RagDoc[]>([]);
  const [numberDocuments, setNumberDocuments] = useState<number>(0);
  const [isLoadingGetDocuments, setIsLoadingGetDocuments] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const absoluteUrl = (relative?: string | null) =>
    relative ? `${RAG_URL}${relative}` : undefined;

  const getDocuments = async () => {
    setIsLoadingGetDocuments(true);
    try {
      if (!RAG_URL) throw new Error('VITE_RAG_URL no está definida en .env');
      const { data } = await axios.get<{ count: number; docs: RagDoc[] }>(`${RAG_URL}/list-docs`);
      const docs = Array.isArray(data?.docs) ? data.docs : [];

      setDocuments(docs);
      setNumberDocuments(docs.length);
    } catch (err) {
      console.error(err);
      setDocuments([]);
      setNumberDocuments(0);
    } finally {
      setIsLoadingGetDocuments(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.post(`${RAG_URL}/delete-doc`, { id });
      await getDocuments();
    } catch (error: any) {
      console.log(error?.response ? error.response.data : error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    // Si no necesitas auth, simplemente llama getDocuments() sin condicional
    if (user !== null) getDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Container fluid>
      {/* Si no usas login anónimo, elimina esta línea */}
      {user === null && <LoginAnonymously />}

      <Grid>
        {/* Columna izquierda: lista + uploader */}
        <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="xl" mb="lg">
              Lista de documentos
            </Text>

            {/* Uploader sube a /load-docs y luego refrescamos la lista */}
            <PDFUploader onUpload={getDocuments} numberDocuments={numberDocuments} />

            <Text mt="md">Documentos cargados:</Text>

            {isLoadingGetDocuments ? (
              <Group mt="lg">
                <Loader />
                <Text>Cargando documentos...</Text>
              </Group>
            ) : (
              <List
                size="xs"
                style={{ height: 'calc(100% - 80px)', overflowY: 'auto', marginTop: '10px' }}
              >
                {documents.length > 0 ? (
                  documents.map((d) => {
                    const name = d.original_name || d.stored_name || d.id;
                    const href = absoluteUrl(d.file_url);
                    return (
                      <List.Item
                        key={d.id}
                        icon={
                          <ActionIcon
                            color="red"
                            size="xs"
                            loading={!!loading[d.id]}
                            onClick={() => deleteDocument(d.id)}
                            title="Eliminar del índice y archivo físico"
                          >
                            <IconTrash />
                          </ActionIcon>
                        }
                      >
                        {href ? (
                          <a href={href} target="_blank" rel="noreferrer">
                            {name}
                          </a>
                        ) : (
                          <span>{name}</span>
                        )}
                      </List.Item>
                    );
                  })
                ) : (
                  <Text>No hay documentos cargados</Text>
                )}
              </List>
            )}
          </Card>
        </Grid.Col>

        {/* Columna derecha: chat */}
        <Grid.Col span={{ base: 12, sm: 12, md: 8 }}>
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ height: '550px', maxHeight: '550px' }}
          >
            <Text size="xl" mb="lg">
              Chat
            </Text>
            {/* folderId ya no es necesario para RAG; puedes remover la prop si limpias el componente Chat */}
            <Chat folderId={folderId} />
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
