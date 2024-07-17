import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  List,
  Text,
  Button,
  ActionIcon,
  Card,
  Group,
  ScrollArea,
  TextInput,
  Loader,
  Paper,
  Box,
} from '@mantine/core';
import { IconTrash, IconSend } from '@tabler/icons-react';
import axios from 'axios';
import PDFUploader from '../PDFUploader';
import Chat from '../Chat';
import { useAuth } from '@/context/AuthContext';
import { LoginAnonymously } from '@/pages/auth/LoginAnonymously.page';
import { query, collection, db, where, getDocs, doc, deleteDoc } from '@/config/firebaseConfig';

export const LandingChat = () => {
  const { user, folderId, setFolderId } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [numberDocuments, setNumberDocuments] = useState<number>(0);
  const [isLoadingGetDocuments, setIsLoadingGetDocuments] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // const getDocuments = async () => {
  //   const formData = new FormData();
  //   formData.append('secretkey', import.meta.env.VITE_CHATPDF_KEY);
  //   setIsLoadingGetDocuments(true);
  //   try {
  //     const response = await axios.post('/api-get-documents', formData);
  //     setDocuments(response.data.data.list);
  //   } catch (error: any) {
  //     console.log(error);
  //   } finally {
  //     setIsLoadingGetDocuments(false);
  //   }
  // };

  const getDocuments = async () => {
    if (!user) return;

    setIsLoadingGetDocuments(true);

    try {
      const q = query(collection(db, 'folders'), where('user_id', '==', user.uid));

      const querySnapshot = await getDocs(q);
      const docsArray: any[] = [];

      if (querySnapshot.empty) {
        setDocuments([]);
        setIsLoadingGetDocuments(false);
        return;
      }

      for (const folderDoc of querySnapshot.docs) {
        setFolderId(folderDoc.id);
        const filesCollection = collection(db, 'folders', folderDoc.id, 'files');
        const filesSnapshot = await getDocs(filesCollection);

        filesSnapshot.forEach((fileDoc) => {
          const fileData = fileDoc.data();
          docsArray.push({
            id: fileDoc.id,
            ...fileData,
          });
        });
      }
      setNumberDocuments(docsArray.length);
      setDocuments(docsArray);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoadingGetDocuments(false);
    }
  };

  const deleteDocument = async (fileId: any, folderId: any) => {
    const formData = new FormData();
    formData.append('secretkey', import.meta.env.VITE_CHATPDF_KEY);
    formData.append('documentId', fileId);

    setLoading((prev) => ({ ...prev, [fileId]: true }));

    try {
      await axios.post('/api-delete-document', formData);
      const fileDocRef = doc(db, 'folders', folderId, 'files', fileId);
      await deleteDoc(fileDocRef);
      getDocuments();
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  useEffect(() => {
    getDocuments();
  }, [user]);

  return (
    <Container fluid>
      {user === null && <LoginAnonymously />}
      <Grid>
      <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="xl" mb="lg">
              Lista de PDFs
            </Text>
            <PDFUploader onUpload={getDocuments} numberDocuments={numberDocuments} />
            <Text mt="md">Documentos Cargados:</Text>
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
                {documents.length > 0 &&
                  documents.map((doc, index) => (
                    <List.Item
                      key={index}
                      icon={
                        <ActionIcon
                          color="red"
                          size="xs"
                          loading={loading[doc.id]}
                          onClick={() => deleteDocument(doc.id, folderId)}
                        >
                          <IconTrash />
                        </ActionIcon>
                      }
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        {doc.file_name}
                      </a>
                    </List.Item>
                  ))}
                {documents.length === 0 && <Text>No hay documentos cargados</Text>}
              </List>
            )}
          </Card>
        </Grid.Col>
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
            <Chat folderId={folderId} />
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
