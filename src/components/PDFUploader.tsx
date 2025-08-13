/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Dropzone, FileRejection } from '@mantine/dropzone';
import { Button, Text, Loader, Group, rem, Modal } from '@mantine/core';
import axios from 'axios';
import { IconPdf, IconX, IconCheck, IconAlertCircle, IconBrandWhatsapp } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { db, doc, setDoc } from '@/config/firebaseConfig';

interface PDFUploaderProps {
  onUpload: (value: any) => void; // si prefieres, tipa el shape de la respuesta de /load-docs
  numberDocuments: number;
}

const RAG_URL = import.meta.env.VITE_RAG_URL as string;

const PDFUploader = ({ onUpload, numberDocuments }: PDFUploaderProps) => {
  const { user, folderId } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModalDemo, setShowModalDemo] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const whatsappNumber = '3106875756';
  const whatsappLink = `https://wa.me/57${whatsappNumber}?text=Hola,%20quiero%20obtener%20acceso%20completo%20a%20Gen%20Know`;

  const handleShowModalDemo = () => setShowModalDemo((v) => !v);

  const handleDrop = async (incomingFiles: File[]) => {
    setFiles(incomingFiles);
    setStatus('idle');
    setErrorMsg(null);

    // Límite demo (tu lógica existente)
    if (numberDocuments >= 5) {
      setShowModalDemo(true);
      return;
    }

    if (!RAG_URL) {
      setStatus('error');
      setErrorMsg('RAG_URL no está configurada. Define VITE_RAG_URL en tu .env.');
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      // Enviar todos los archivos en un único FormData (campo "files")
      const formData = new FormData();
      for (const f of incomingFiles) formData.append('files', f);

      const { data } = await axios.post(`${RAG_URL}/load-docs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // data esperado: { status: "ok", uploaded_ids: ["a.pdf", ...] } o { error: "..."}
      if (data?.error) {
        throw new Error(data.error);
      }

      // Registro opcional en Firestore si ya manejas "folders"
      if (folderId && Array.isArray(data?.uploaded_ids)) {
        for (const id of data.uploaded_ids) {
          const fileRef = doc(db, 'folders', folderId, 'files', id);
          await setDoc(fileRef, {
            file_id: id,
            file_name: id,
            file_url: null, // si luego generas URL pública, actualízala aquí
            user_id: user?.uid ?? null,
            created_at: new Date().toISOString(),
          });
        }
      }

      onUpload(data);
      setStatus('success');
      handleClear();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err?.message || 'Ocurrió un error al subir los documentos.');
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  const handleReject = (rejections: FileRejection[]) => {
    setFiles([]);
    setStatus('error');
    setErrorMsg(
      rejections?.[0]?.errors?.[0]?.message ||
        'Archivo(s) rechazado(s). Verifica el tipo o tamaño permitido.'
    );
  };

  const handleClear = () => {
    setFiles([]);
    setStatus('idle');
    setErrorMsg(null);
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
        onDrop={handleDrop}
        multiple
        disabled={loading}
        // Acepta PDF, DOCX y TXT (tipos MIME explícitos para mejor compatibilidad)
        accept={[
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ]}
        style={{ maxWidth: '280px', width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        <Group justify="center" gap="xs" mih={90} style={{ pointerEvents: 'none' }}>
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
              <Text size="sm" inline style={{ textAlign: 'center' }}>
                Arrastra o haz clic para subir PDF, DOCX o TXT
              </Text>
            )}
            {errorMsg && (
              <Text size="xs" c="red" ta="center" mt={6} style={{ maxWidth: 260 }}>
                {errorMsg}
              </Text>
            )}
          </div>
        </Group>
      </Dropzone>

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
