import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { mockExperienceAdmin } from '@/entities/experience/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { ExperienceForm } from './ui/experience-form';

const meta = {
  title: 'Widgets/AdminExperience/Form',
  component: ExperienceForm,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    record: null,
    technologies: mockTechnologiesAdmin,
    locale: 'ru',
    isBusy: false,
    onCreate: fn(),
    onUpdate: fn(),
    onCancel: fn(),
  },
  argTypes: {
    record: { control: false, table: { category: 'Данные' } },
    technologies: { control: false, table: { category: 'Данные' } },
    locale: { control: 'inline-radio', options: ['ru', 'en'], table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onCreate: { control: false, table: { category: 'События' } },
    onUpdate: { control: false, table: { category: 'События' } },
    onCancel: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ExperienceForm>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Создание новой записи опыта. */
export const New: Story = {
  name: 'Создание',
};

/** Правка существующей записи (поля заполнены из данных). */
export const Edit: Story = {
  name: 'Правка',
  args: { record: mockExperienceAdmin[0] ?? null },
};
