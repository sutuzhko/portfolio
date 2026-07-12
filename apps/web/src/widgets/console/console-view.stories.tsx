import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { mockProfile } from '@/entities/profile/mocks';

import type { ConsoleEntry } from './model/commands';
import { ConsoleView } from './ui/console-view';

// Пример «прожитой» сессии: приветствие, справка и пара выполненных команд.
const history: readonly ConsoleEntry[] = [
  { id: 0, kind: 'welcome' },
  { id: 1, kind: 'input', text: 'help' },
  { id: 2, kind: 'help' },
  { id: 3, kind: 'input', text: 'cat stack.txt' },
  { id: 4, kind: 'text', body: 'React · Vue 3 · Next.js · Node · NestJS · TypeScript' },
  { id: 5, kind: 'input', text: 'theme dark' },
  { id: 6, kind: 'text', body: '✓ тема: dark' },
];

const meta = {
  title: 'Widgets/Console',
  component: ConsoleView,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    isOpen: true,
    windowState: 'normal',
    routeLabel: '~',
    entries: [{ id: 0, kind: 'welcome' }],
    input: '',
    profile: mockProfile,
    clock: '12:34',
    onInputChange: fn(),
    onInputKeyDown: fn(),
    onClose: fn(),
    onMinimize: fn(),
    onToggleMaximize: fn(),
    onRestore: fn(),
  },
  argTypes: {
    windowState: {
      control: 'radio',
      options: ['normal', 'maximized', 'minimized'],
      table: { category: 'Состояние' },
    },
    isOpen: { control: 'boolean', table: { category: 'Состояние' } },
    input: { control: 'text', table: { category: 'Данные' } },
    routeLabel: { control: 'text', table: { category: 'Данные' } },
    clock: { control: 'text', table: { category: 'Данные' } },
    profile: { control: 'object', table: { category: 'Данные' } },
    entries: { control: 'object', table: { category: 'Данные' } },
    onInputChange: { control: false, table: { disable: true } },
    onInputKeyDown: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
    onMinimize: { control: false, table: { disable: true } },
    onToggleMaximize: { control: false, table: { disable: true } },
    onRestore: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ConsoleView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Terminal: Story = {
  name: 'Терминал',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog', { name: 'Консоль' })).toBeInTheDocument();
  },
};

export const WithHistory: Story = {
  name: 'С историей команд',
  args: { entries: history },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Доступные команды')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  name: 'Загрузка профиля',
  args: { profile: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Ответы whoami/stack/location под скелетоном — имени профиля ещё нет.
    await expect(canvas.queryByText(new RegExp(mockProfile.name))).not.toBeInTheDocument();
  },
};

export const Maximized: Story = {
  name: 'На всю ширину',
  args: { windowState: 'maximized' },
};

export const Minimized: Story = {
  name: 'Свёрнута в трей',
  args: { windowState: 'minimized' },
  play: async () => {
    // Свёрнутая консоль порталится в трей (TrayPortal → document.body), поэтому
    // ищем пилюлю там, а не в canvasElement (он остаётся пустым).
    const body = within(document.body);
    await expect(body.getByRole('button', { name: /bash — ~/ })).toBeInTheDocument();
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
