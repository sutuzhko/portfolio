import type { Meta, StoryObj } from '@storybook/react-vite';
import { type Components } from 'react-markdown';

import { Markdown } from './markdown';

const showcase = `## Заголовок раздела

Абзац с [внешней ссылкой](https://example.com), **жирным** акцентом и \`inline code\`.
GFM-возможности: ~~зачёркнутый~~ текст и автоссылка https://reactjs.org.

- пункт списка
- ещё пункт

- [x] выполненная задача
- [ ] невыполненная задача

| Технология | Роль        | Уровень |
| ---------- | ----------- | ------- |
| React      | UI          | Senior  |
| NestJS     | API         | Middle  |
| PostgreSQL | Данные      | Middle  |
`;

const meta = {
  title: 'Shared/Markdown',
  component: Markdown,
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
  },
  args: {
    children: showcase,
  },
  argTypes: {
    children: { control: 'text', table: { category: 'Контент' } },
    className: { control: false, table: { category: 'Оформление' } },
    components: { control: false, table: { category: 'Оформление' } },
  },
} satisfies Meta<typeof Markdown>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Полный набор: заголовки, ссылки, код, списки, таск-листы, зачёркивание и таблица. */
export const Playground: Story = {
  name: 'Все возможности',
};

/** GFM-таблица — главная причина плагина remark-gfm. */
export const Table: Story = {
  name: 'Таблица',
  args: {
    children: `| Метрика      | 2024 | 2025 |
| ------------ | ---- | ---- |
| Пользователи | 1.2k | 4.8k |
| Проекты      | 34   | 112  |
| Uptime       | 99.1 | 99.9 |
`,
  },
};

/** Широкая таблица скроллится по горизонтали внутри своего контейнера. */
export const WideTable: Story = {
  name: 'Широкая таблица (скролл)',
  args: {
    children: `| Колонка A | Колонка B | Колонка C | Колонка D | Колонка E | Колонка F | Колонка G |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| значение  | значение  | значение  | значение  | значение  | значение  | значение  |
`,
  },
};

// Перехват «вики-ссылки» — демонстрация расширения через `components` (как в БЗ).
const wikiComponents: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

/** Переопределение рендереров через проп `components`. */
export const CustomComponents: Story = {
  name: 'Кастомные рендереры',
  args: {
    children: 'Абзац с [обычной ссылкой](https://example.com).',
    components: wikiComponents,
  },
};
