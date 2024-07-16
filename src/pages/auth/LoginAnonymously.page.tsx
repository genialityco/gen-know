// LoginAnonymously.tsx
import { Modal, TextInput, Button, Loader } from '@mantine/core';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { loginAnonymously } from '../../services/authServices';
import { useAuth } from '../../context/AuthContext';

export const LoginAnonymously = () => {
  const [opened, setOpened] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Por favor, ingresa tu nombre' : null),
    },
  });

  const handleLogin = async (values: any) => {
    setLoading(true); // Iniciar el estado de carga
    try {
      const user = await loginAnonymously();
      if (user !== undefined) {
        setUser(user);
        setOpened(false);
        console.log('Logged in anonymously with name:', values.name);
      }
    } catch (error) {
      console.error('Error logging in anonymously:', error);
    } finally {
      setLoading(false); // Finalizar el estado de carga
    }
  };

  const closeModal = () => {
    if (form.validateField('name').hasError === false) {
      setOpened(false);
    } else {
      form.validateField('name');
    }
  };

  return (
    <div>
      <Modal opened={opened} onClose={closeModal} title="Iniciar como invitado" centered>
        <form onSubmit={form.onSubmit(handleLogin)}>
          <TextInput
            label="Para continuar con el demo, por favor ingresa tu nombre"
            placeholder="Ingresa tu nombre"
            {...form.getInputProps('name')}
          />
          <Button type="submit" fullWidth style={{ marginTop: 20 }} disabled={loading}>
            {loading ? <Loader size="sm" /> : 'Ingresar'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
