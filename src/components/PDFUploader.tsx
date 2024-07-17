import React, { useState } from 'react';
import { Dropzone, MIME_TYPES, FileRejection } from '@mantine/dropzone';
import { Button, Text, Loader, Group, rem, Modal } from '@mantine/core';
import axios from 'axios';
import { IconPdf, IconX, IconCheck, IconAlertCircle, IconBrandWhatsapp } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { db, doc, setDoc } from '@/config/firebaseConfig';

interface PDFUploaderProps {
  onUpload: (value: Function) => void;
  numberDocuments: number;
}

const generateUniqueFolderName = () => `folder_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const PDFUploader = ({ onUpload, numberDocuments }: PDFUploaderProps) => {
  const { user, folderId, setFolderId } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModalDemo, setShowModalDemo] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const whatsappNumber = '3106875756';
  const whatsappLink = `https://wa.me/57${whatsappNumber}?text=Hola,%20quiero%20obtener%20acceso%20completo%20a%20Gen%20Know`;

  const handleShowModalDemo = () => {
    setShowModalDemo(!showModalDemo);
  };

  const handleDrop = async (files: File[]) => {
    setFiles(files);
    setStatus('idle');

    if (numberDocuments >= 5) {
      setShowModalDemo(true);
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      if (!folderId) {
        await handleCreateFolder();
      }
      if (folderId) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('secretkey', import.meta.env.VITE_CHATPDF_KEY);
          formData.append('folder_id', folderId);

          const uploadResponse = await axios.post('/api-upload-file', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const fileRef = doc(db, 'folders', folderId, 'files', uploadResponse.data.documentId);
          await setDoc(fileRef, {
            file_id: uploadResponse.data.documentId,
            file_name: uploadResponse.data.fileName,
            file_url: uploadResponse.data.file_url,
          });

          onUpload(uploadResponse.data);
        }
        setStatus('success');
        handleClear();
      } else {
        throw new Error('Failed to create or retrieve folder');
      }
    } catch (error) {
      setStatus('error');
      console.error(error);
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };
  const handleReject = (files: FileRejection[]) => {
    setFiles([]);
    setStatus('error');
  };

  const handleCreateFolder = async () => {
    const folderName = generateUniqueFolderName();
    const folderResponse = await axios.post('/api-create-folder', {
      folder_name: folderName,
      secretkey: import.meta.env.VITE_CHATPDF_KEY,
    });
    const folder = folderResponse.data.data.folder_id;

    const folderRef = doc(db, 'folders', folder);
    await setDoc(folderRef, {
      folder_id: folder,
      user_id: user?.uid,
      folder_name: folderName,
    });

    setFolderId(folder);
    return folder;
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   if (files.length === 0) {
  //     setStatus('error');
  //     return;
  //   }

  //   if (numberDocuments >= 5) {
  //     setShowModalDemo(true);
  //     return;
  //   }

  //   setLoading(true);
  //   setStatus('loading');

  //   try {
  //     if (!folderId) {
  //       await handleCreateFolder();
  //     }
  //     if (folderId) {
  //       for (const file of files) {
  //         const formData = new FormData();
  //         formData.append('file', file);
  //         formData.append('secretkey', import.meta.env.VITE_CHATPDF_KEY);
  //         formData.append('folder_id', folderId);

  //         const uploadResponse = await axios.post('/api-upload-file', formData, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         });

  //         const fileRef = doc(db, 'folders', folderId, 'files', uploadResponse.data.documentId);
  //         await setDoc(fileRef, {
  //           file_id: uploadResponse.data.documentId,
  //           file_name: uploadResponse.data.fileName,
  //           file_url: uploadResponse.data.file_url,
  //         });

  //         onUpload(uploadResponse.data);
  //       }
  //       setStatus('success');
  //     } else {
  //       throw new Error('Failed to create or retrieve folder');
  //     }
  //   } catch (error) {
  //     setStatus('error');
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleClear = () => {
    setFiles([]);
    setStatus('idle');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
        <Dropzone
          onReject={handleReject}
          accept={[MIME_TYPES.pdf]}
          onDrop={handleDrop}
          style={{ maxWidth: '250px' }}
          multiple
        >
          <Group justify="center" gap="xs" mih={80} style={{ pointerEvents: 'none' }}>
            {status === 'idle' && (
              <Dropzone.Idle>
                <IconPdf
                  style={{ width: rem(30), height: rem(30), color: 'var(--mantine-color-dimmed)' }}
                  stroke={1.5}
                />
              </Dropzone.Idle>
            )}
            {status === 'loading' && <Loader style={{ width: rem(30), height: rem(30) }} />}
            {status === 'success' && (
              <IconCheck
                style={{ width: rem(30), height: rem(30), color: 'var(--mantine-color-green-6)' }}
                stroke={1.5}
              />
            )}
            {status === 'error' && (
              <IconX
                style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }}
                stroke={1.5}
              />
            )}
            <div>
              {files.length > 0 ? (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <Text size="sm" style={{ display: 'flex', flexDirection: 'column' }}>
                    Documentos seleccionados:
                    {files.map((file) => (
                      <span key={file.name}>{file.name}</span>
                    ))}
                  </Text>
                </div>
              ) : (
                <Text size="md" inline style={{textAlign: 'center'}}>
                  Haz clic o arrastra los documentos aquí
                </Text>
              )}
            </div>
          </Group>
        </Dropzone>
        {/* <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <Button type="submit" disabled={loading}>
            Cargar
          </Button>
          <Button variant="outline" color="red" onClick={handleClear}>
            Limpiar
          </Button>
        </div>
      </form> */}
      <Modal
        opened={showModalDemo}
        onClose={handleShowModalDemo}
        title="Modo demostración"
        centered
        styles={{
          header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          },
        }}
      >
        <Group align="center">
          <IconAlertCircle size={50} color="var(--mantine-color-yellow-7)" />
          <Text size="xl" fw={900} variant="gradient" gradient={{ from: 'pink', to: 'yellow' }}>
            Estás en modo demostración
          </Text>
          <Text size="md">
            En este modo hay limitaciones de uso, solo puedes cargar hasta 5 documentos.
          </Text>
          <Text size="md">
            Para obtener acceso completo a Gen Know, por favor contacta a ventas vía WhatsApp:
          </Text>
          <Button
            leftSection={<IconBrandWhatsapp />}
            variant="gradient"
            gradient={{ from: 'green', to: 'lime' }}
            component="a"
            href={whatsappLink}
            target="_blank"
            style={{ margin: 'auto' }}
          >
            Contactar a ventas
          </Button>
          <Button variant="default" fullWidth onClick={handleShowModalDemo} mt="md">
            Cerrar
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default PDFUploader;
