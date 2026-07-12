import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Markdown } from '../markdown';

import { MarkdownEditor } from './markdown-editor';

const sample = `## Заголовок

Абзац с **акцентом**, [ссылкой](https://example.com) и \`inline code\`.

| Технология | Роль | Уровень |
| ---------- | ---- | ------- |
| React      | UI   | Senior  |
| NestJS     | API  | Middle  |
`;

const meta = {
  title: 'Shared/MarkdownEditor',
  component: MarkdownEditor,
  parameters: { layout: 'padded' },
  args: {
    value: '',
    // Значение переопределяется управляемой обёрткой в `render`; заглушка для типов.
    onChange: () => undefined,
    sourceLabel: 'MARKDOWN',
    splitLabel: 'split',
    previewLabel: 'preview',
    ariaLabel: 'Markdown',
    renderPreview: (source: string) => <Markdown>{source}</Markdown>,
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    renderPreview: { control: false },
  },
  // Управляемый компонент — храним значение в обёртке, чтобы ввод и превью жили.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <MarkdownEditor {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Split: слева исходник, справа живое превью (с таблицей GFM). */
export const Split: Story = {
  name: 'Split + превью',
  args: { value: sample },
};

/** Пустой редактор — исходник и пустое превью. */
export const Empty: Story = {
  name: 'Пустой',
  args: { value: '' },
};

/** Ошибка валидации под редактором. */
export const WithError: Story = {
  name: 'С ошибкой',
  args: { value: '', error: 'Заполните полное описание' },
};
