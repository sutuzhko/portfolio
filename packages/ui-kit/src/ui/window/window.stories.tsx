import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import { Button } from '../button';
import { Heading } from '../heading';
import { Tabs } from '../tabs';
import { Text } from '../text';

import { Window } from './window';

const meta = {
  title: 'Shared/components/Window',
  component: Window,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    title: '~/portfolio',
    closeLabel: 'Закрыть',
    minimizeLabel: 'Свернуть',
    maximizeLabel: 'Развернуть',
    onClose: fn(),
    onMinimize: fn(),
    onMaximize: fn(),
    children: 'Содержимое окна',
  },

  argTypes: {
    title: { control: 'text', description: 'Подпись в шапке.', table: { category: 'Контент' } },
    flush: {
      control: 'boolean',
      description: 'Убрать отступы тела (окно с собственной раскладкой).',
      table: { category: 'Оформление' },
    },
    toolbar: { control: false, table: { category: 'Контент' } },
    children: { control: false, table: { category: 'Контент' } },
    onClose: { control: false, table: { category: 'События' } },
    onMinimize: { control: false, table: { category: 'События' } },
    onMaximize: { control: false, table: { category: 'События' } },
    closeLabel: { control: 'text', table: { category: 'Доступность' } },
    minimizeLabel: { control: 'text', table: { category: 'Доступность' } },
    maximizeLabel: { control: 'text', table: { category: 'Доступность' } },
  },

  decorators: [(Story) => <div style={{ width: 460 }}>{Story()}</div>],
} satisfies Meta<typeof Window>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Интерактивный пример',
  args: {
    children: (
      <div style={{ display: 'grid', gap: 12 }}>
        <Heading level="h3">Full Stack Developer</Heading>
        <Text tone="muted" size="small">
          Портфолио как демонстрация инженерных практик.
        </Text>
      </div>
    ),
  },
  play: async ({ canvas, userEvent, args, step }) => {
    await step('Показаны все три кнопки светофора', async () => {
      await expect(canvas.getAllByRole('button')).toHaveLength(3);
    });
    await step('Клик по «Закрыть» вызывает обработчик', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }));
      await expect(args.onClose).toHaveBeenCalledOnce();
    });
  },
};

export const Декоративное: Story = {
  name: 'Декоративное (без кнопок)',
  args: {
    onClose: undefined,
    onMinimize: undefined,
    onMaximize: undefined,
    children: (
      <Text family="mono" size="caption" tone="muted">
        $ pnpm dev
      </Text>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const СВкладками: Story = {
  name: 'С вкладками в шапке',
  render: (args) => {
    const [tab, setTab] = useState('profile');
    return (
      <Window
        {...args}
        toolbar={
          <Tabs
            aria-label="Разделы кабинета"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'profile', label: 'Профиль', icon: 'user' },
              { id: 'projects', label: 'Проекты' },
            ]}
          />
        }
      >
        <Text tone="muted">Активная вкладка: {tab}</Text>
      </Window>
    );
  },
};

export const КакМодальноеОкно: Story = {
  name: 'Как модальное окно',
  args: {
    title: 'confirm-delete',
    children: (
      <div style={{ display: 'grid', gap: 16 }}>
        <Heading level="h3">Удалить проект?</Heading>
        <Text tone="muted" size="small">
          Действие необратимо. Проект и его галерея будут удалены безвозвратно.
        </Text>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost">Отмена</Button>
          <Button variant="primary">Удалить</Button>
        </div>
      </div>
    ),
  },
};

export const БезОтступов: Story = {
  name: 'Тело без отступов (flush)',
  args: {
    flush: true,
    title: 'log',
    children: (
      <div
        style={{
          padding: 'var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-fg-muted)',
        }}
      >
        [INFO] server started on :3000
      </div>
    ),
  },
};
