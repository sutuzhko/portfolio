import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Tabs, type TabItem } from './tabs';

const cabinetTabs: TabItem[] = [
  { id: 'profile', label: 'Профиль', icon: 'user' },
  { id: 'projects', label: 'Проекты' },
  { id: 'settings', label: 'Настройки' },
];

const meta = {
  title: 'Shared/components/Tabs',
  component: Tabs,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    'aria-label': 'Кабинет',
    tabs: cabinetTabs,
    value: 'profile',
    onChange: () => undefined,
  },

  argTypes: {
    tabs: {
      control: 'object',
      description: 'Вкладки {id, label, icon?}.',
      table: { category: 'Контент' },
    },
    value: { control: false, table: { category: 'Состояние' } },
    onChange: { control: false, table: { category: 'События' } },
    'aria-label': {
      control: 'text',
      description: 'Подпись полосы вкладок для скринридера.',
      table: { category: 'Доступность' },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик по вкладке делает её выбранной. */
export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.tabs[0]?.id ?? '');
    return <Tabs {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Проекты' }));
    await expect(canvas.getByRole('tab', { name: 'Проекты' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

/** С иконками в ярлыках. */
export const WithIcons: Story = {
  name: 'С иконками',
  render: () => {
    const [value, setValue] = useState('terminal');
    return (
      <Tabs
        aria-label="Разделы"
        value={value}
        onChange={setValue}
        tabs={[
          { id: 'terminal', label: 'Терминал', icon: 'terminal' },
          { id: 'files', label: 'Файлы', icon: 'folder' },
          { id: 'search', label: 'Поиск', icon: 'search' },
        ]}
      />
    );
  },
};

/** С привязанными панелями: панель — ответственность потребителя. */
export const WithPanels: Story = {
  name: 'С привязанными панелями',
  render: () => {
    const [value, setValue] = useState('profile');
    const tabs: TabItem[] = [
      { id: 'profile', label: 'Профиль', icon: 'user' },
      { id: 'projects', label: 'Проекты' },
    ];
    return (
      <div style={{ width: 360 }}>
        <Tabs aria-label="Кабинет" value={value} onChange={setValue} tabs={tabs} />
        <div
          role="tabpanel"
          aria-labelledby={`tab-${value}`}
          style={{ padding: 16, color: 'var(--color-fg-muted)' }}
        >
          Содержимое вкладки: {value}
        </div>
      </div>
    );
  },
};

/** Клавиатура: стрелки по кругу, Home/End — к краям. */
export const KeyboardNavigation: Story = {
  name: 'Клавиатурная навигация',
  render: () => {
    const [value, setValue] = useState('a');
    return (
      <Tabs
        aria-label="Демо"
        value={value}
        onChange={setValue}
        tabs={[
          { id: 'a', label: 'Первая' },
          { id: 'b', label: 'Вторая' },
          { id: 'c', label: 'Третья' },
        ]}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('tab', { name: 'Первая' });
    first.focus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Третья' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Первая' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

/** Край: много вкладок с длинными ярлыками. */
export const ManyTabs: Story = {
  name: 'Край: много вкладок',
  render: () => {
    const [value, setValue] = useState('t0');
    const tabs: TabItem[] = Array.from({ length: 7 }, (_, i) => ({
      id: `t${i}`,
      label: `Раздел ${i + 1}`,
    }));
    return (
      <div style={{ maxWidth: 360 }}>
        <Tabs aria-label="Много" value={value} onChange={setValue} tabs={tabs} />
      </div>
    );
  },
};
