import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Demo{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          Gen Know
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        VALORAMOS TU TIEMPO. No gastes tu activo más importante organizando y buscando información
        manualmente. Con GEN KNOW puedes hacerlo de manera rápida y sencilla
      </Text>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        Este DEMO te permite cargar PDFs para facilitar el uso e interacción de la información.
        CHATEA Y VISUALIZA TU INFORMACIÓN YA
      </Text>
    </>
  );
}
