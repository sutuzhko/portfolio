import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { LocGroup, LocRow, LocStats } from './model/loc-rows';
import { AdminLocalizationView } from './ui/admin-localization-view';

const row = (over: Partial<LocRow> & Pick<LocRow, 'id' | 'label' | 'ru' | 'en'>): LocRow => ({
  sectionId: 'profile',
  sectionLabel: 'Профиль',
  sourceId: 'profile',
  entityId: 'profile',
  fieldKey: 'name',
  ...over,
});

const groups: LocGroup[] = [
  {
    id: 'profile',
    label: 'Профиль',
    rows: [
      row({
        id: 'profile:profile:name',
        label: 'profile.name',
        ru: 'Богдан Сутужко',
        en: 'Bogdan Sutuzhko',
      }),
      row({
        id: 'profile:profile:roleTitle',
        fieldKey: 'roleTitle',
        label: 'profile.roleTitle',
        ru: 'Fullstack-разработчик',
        en: 'Full Stack Developer',
      }),
    ],
  },
  {
    id: 'project:p1',
    label: 'Проект · Procharity',
    rows: [
      row({
        id: 'project:p1:title',
        sectionId: 'project:p1',
        sectionLabel: 'Проект · Procharity',
        sourceId: 'project',
        entityId: 'p1',
        fieldKey: 'title',
        label: 'project.procharity.title',
        ru: 'Procharity',
        en: 'Procharity',
      }),
      row({
        id: 'project:p1:role',
        sectionId: 'project:p1',
        sectionLabel: 'Проект · Procharity',
        sourceId: 'project',
        entityId: 'p1',
        fieldKey: 'role',
        label: 'project.procharity.role',
        ru: 'Ведущий фронтенд-разработчик',
        en: '',
      }),
    ],
  },
];

const stats: LocStats = { total: 4, translated: 2, missingEn: 1, sameAsRu: 1, coverage: 50 };

const meta = {
  title: 'Widgets/AdminLocalization',
  component: AdminLocalizationView,
  parameters: { layout: 'padded' },
  args: {
    stats,
    groups,
    edits: {},
    editing: null,
    query: '',
    filter: 'all',
    changedCount: 0,
    isSaving: false,
    onQueryChange: fn(),
    onFilterChange: fn(),
    onEditCell: fn(),
    onCommitCell: fn(),
    onCancelCell: fn(),
    onSaveAll: fn(),
    onDiscardAll: fn(),
  },
  argTypes: {
    stats: { control: false, table: { category: 'Данные' } },
    groups: { control: false, table: { category: 'Данные' } },
    edits: { control: false, table: { category: 'Данные' } },
    editing: { control: false, table: { category: 'Состояние' } },
    query: { control: 'text', table: { category: 'Состояние' } },
    filter: {
      control: 'inline-radio',
      options: ['all', 'problems', 'missing', 'sameRu', 'changed'],
      table: { category: 'Состояние' },
    },
    changedCount: { control: { type: 'number', min: 0 }, table: { category: 'Состояние' } },
    isSaving: { control: 'boolean', table: { category: 'Состояние' } },
    onQueryChange: { control: false, table: { category: 'События' } },
    onFilterChange: { control: false, table: { category: 'События' } },
    onEditCell: { control: false, table: { category: 'События' } },
    onCommitCell: { control: false, table: { category: 'События' } },
    onCancelCell: { control: false, table: { category: 'События' } },
    onSaveAll: { control: false, table: { category: 'События' } },
    onDiscardAll: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminLocalizationView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Сверка RU/EN: покрытие, статистика, секции по сущностям и флаги строк. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('50%')).toBeInTheDocument();
    await expect(canvas.getByText('Проект · Procharity')).toBeInTheDocument();
    await expect(canvas.getByText(/нет перевода/)).toBeInTheDocument();
  },
};

/** Одна ячейка в режиме правки: textarea + Готово/Отмена. */
export const Editing: Story = {
  args: { editing: { rowId: 'profile:profile:name', locale: 'en' } },
};

/** Есть несохранённые правки — снизу плавающая панель «Сохранить N». */
export const WithChanges: Story = {
  args: {
    changedCount: 2,
    edits: {
      'project:p1:role': { ru: 'Ведущий фронтенд-разработчик', en: 'Lead Frontend Developer' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Сохранить 2/ })).toBeInTheDocument();
  },
};

/** Сохранение в процессе — кнопки панели заблокированы. */
export const Saving: Story = {
  args: { changedCount: 2, isSaving: true },
};

/** Ничего не найдено по фильтру. */
export const Empty: Story = {
  args: { groups: [], filter: 'changed' },
};

/** Узкий экран: карточки и панель адаптируются. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
