import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockDatabaseTree } from '@/entities/kb/mocks';

import { folderOptions } from './model/kb-nodes';
import { KbArticleEditor } from './ui/kb-article-editor';

const folders = folderOptions(mockDatabaseTree);

const meta = {
  title: 'Widgets/AdminKb/ArticleEditor',
  component: KbArticleEditor,
  parameters: { layout: 'padded' },
  args: {
    mode: 'new',
    initial: { title: '', slug: '', body: '', folderId: '' },
    folders,
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['new', 'edit'], table: { category: 'Состояние' } },
    initial: { control: false, table: { category: 'Данные' } },
    folders: { control: false, table: { category: 'Данные' } },
    isSaving: { control: 'boolean', table: { category: 'Состояние' } },
    serverSlugError: { control: 'text', table: { category: 'Состояние' } },
    onSave: { control: false, table: { category: 'События' } },
    onCancel: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof KbArticleEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Новая статья: бар сохранения появляется только после первой правки. */
export const New: Story = {
  name: 'Новая статья',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Пустой черновик — плавающий SaveBar скрыт (visible={isDirty}), кнопки нет.
    await expect(canvas.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('Заголовок', { exact: false }), 'Черновик');
    // После правки бар появляется, «Сохранить» доступна.
    await expect(canvas.getByRole('button', { name: /Сохранить/ })).toBeEnabled();
  },
};

/** Правка существующей статьи: поля заполнены, слева исходник, справа превью. */
export const Edit: Story = {
  name: 'Редактирование',
  args: {
    mode: 'edit',
    initial: {
      title: 'Хуки React',
      slug: 'react-hooks',
      body: '## Правила хуков\n\nХуки вызываются на верхнем уровне и только из React-функций.',
      folderId: 'f1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue('react-hooks')).toBeInTheDocument();
  },
};

/** Режим preview: исходник скрыт, показан только рендер. */
export const PreviewMode: Story = {
  name: 'Только превью',
  args: {
    mode: 'edit',
    initial: {
      title: 'Хуки React',
      slug: 'react-hooks',
      body: '## Правила хуков\n\nТекст статьи.',
      folderId: 'f1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'preview' }));
    await expect(canvas.queryByRole('textbox', { name: /MARKDOWN/ })).not.toBeInTheDocument();
  },
};

/** Серверная ошибка по slug (например, 409). */
export const SlugTaken: Story = {
  name: 'Slug занят',
  args: { serverSlugError: 'Такой slug уже занят' },
};
