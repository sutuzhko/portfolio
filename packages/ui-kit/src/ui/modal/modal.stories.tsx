import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../button';

import { Modal } from './modal';

const meta = {
  title: 'Shared/components/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    open: true,
    title: 'Заголовок окна',
    description: 'краткое пояснение под заголовком',
    closeLabel: 'Закрыть',
    onClose: fn(),
    children: <p style={{ margin: 0 }}>Содержимое модального окна.</p>,
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'Состояние' } },
    onClose: { control: false, table: { category: 'События' } },
    children: { control: false, table: { category: 'Слоты' } },
    footer: { control: false, table: { category: 'Слоты' } },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Окно с заголовком, подзаголовком и телом. */
export const Default: Story = {
  name: 'Базовое',
};

/** С кнопками действий внизу. */
export const WithFooter: Story = {
  name: 'С футером',
  args: {
    footer: (
      <>
        <Button variant="ghost">Отмена</Button>
        <Button variant="primary">Сохранить</Button>
      </>
    ),
  },
};
