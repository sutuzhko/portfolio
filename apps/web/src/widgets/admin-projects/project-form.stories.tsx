import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { mockContributorsAdmin } from '@/entities/contributor/mocks';
import { mockProjectsAdmin } from '@/entities/project/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { ProjectForm } from './ui/project-form';

const meta = {
  title: 'Widgets/AdminProjects/Form',
  component: ProjectForm,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    record: null,
    technologies: mockTechnologiesAdmin,
    contributors: mockContributorsAdmin,
    locale: 'ru',
    isBusy: false,
    onCreate: fn(),
    onUpdate: fn(),
    onUploadGallery: fn(),
    onRejectGallery: fn(),
    onDeleteGallery: fn(),
    onCopyGalleryUrl: fn(),
    onCancel: fn(),
  },
  argTypes: {
    record: { control: false, table: { category: 'Данные' } },
    technologies: { control: false, table: { category: 'Данные' } },
    contributors: { control: false, table: { category: 'Данные' } },
    locale: { control: 'inline-radio', options: ['ru', 'en'], table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onCreate: { control: false, table: { category: 'События' } },
    onUpdate: { control: false, table: { category: 'События' } },
    onUploadGallery: { control: false, table: { category: 'События' } },
    onRejectGallery: { control: false, table: { category: 'События' } },
    onDeleteGallery: { control: false, table: { category: 'События' } },
    onCopyGalleryUrl: { control: false, table: { category: 'События' } },
    onCancel: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ProjectForm>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Создание нового проекта. */
export const New: Story = {
  name: 'Создание',
};

/** Правка существующего проекта (поля заполнены из данных). */
export const Edit: Story = {
  name: 'Правка',
  args: { record: mockProjectsAdmin[0] ?? null },
};
