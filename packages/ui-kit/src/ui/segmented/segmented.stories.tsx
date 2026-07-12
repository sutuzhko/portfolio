import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Segmented, type SegmentedOption } from './segmented';

const themeOptions: SegmentedOption<string>[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
];

const meta = {
  title: 'Shared/components/Segmented',
  component: Segmented,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    'aria-label': 'Тема',
    value: 'dark',
    onChange: () => undefined,
    options: themeOptions,
  },

  argTypes: {
    options: {
      control: 'object',
      description: 'Список сегментов {label, value}.',
      table: { category: 'Контент' },
    },
    value: { control: false, table: { category: 'Состояние' } },
    onChange: { control: false, table: { category: 'События' } },
    'aria-label': {
      control: 'text',
      description: 'Обязательная подпись группы для скринридера.',
      table: { category: 'Доступность' },
    },
  },
} satisfies Meta<typeof Segmented<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик по сегменту переключает выбор. */
export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.options[0]?.value ?? '');
    return <Segmented {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await expect(canvas.getByRole('radio', { name: 'Light' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};

/** Типовые применения: тема, язык, три режима — сразу. */
export const Examples: Story = {
  name: 'Примеры применения',
  parameters: { controls: { disable: true } },
  render: () => {
    const [theme, setTheme] = useState('dark');
    const [lang, setLang] = useState('ru');
    const [mode, setMode] = useState('edit');
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Segmented aria-label="Тема" value={theme} onChange={setTheme} options={themeOptions} />
        <Segmented
          aria-label="Язык"
          value={lang}
          onChange={setLang}
          options={[
            { label: 'RU', value: 'ru' },
            { label: 'EN', value: 'en' },
          ]}
        />
        <Segmented
          aria-label="Режим редактора"
          value={mode}
          onChange={setMode}
          options={[
            { label: 'edit', value: 'edit' },
            { label: 'preview', value: 'preview' },
            { label: 'split', value: 'split' },
          ]}
        />
      </div>
    );
  },
};

/** Клавиатура: фокус на активном сегменте, стрелки переключают по кругу. */
export const KeyboardNavigation: Story = {
  name: 'Клавиатурная навигация',
  render: () => {
    const [value, setValue] = useState('ru');
    return (
      <Segmented
        aria-label="Язык"
        value={value}
        onChange={setValue}
        options={[
          { label: 'RU', value: 'ru' },
          { label: 'EN', value: 'en' },
        ]}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const ru = canvas.getByRole('radio', { name: 'RU' });
    await expect(ru).toHaveAttribute('aria-checked', 'true');
    ru.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'EN' })).toHaveAttribute('aria-checked', 'true');
    // По кругу: ещё раз вправо возвращает к первому.
    await userEvent.keyboard('{ArrowRight}');
    await expect(ru).toHaveAttribute('aria-checked', 'true');
  },
};

/** Край: длинные подписи сегментов. */
export const LongLabels: Story = {
  name: 'Край: длинные подписи',
  render: () => {
    const [value, setValue] = useState('monthly');
    return (
      <Segmented
        aria-label="Период"
        value={value}
        onChange={setValue}
        options={[
          { label: 'Ежемесячно', value: 'monthly' },
          { label: 'Ежеквартально', value: 'quarterly' },
        ]}
      />
    );
  },
};
