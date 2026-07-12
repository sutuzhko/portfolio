import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SectionLabel } from './section-label';

const meta = {
  title: 'Shared/primitives/SectionLabel',
  component: SectionLabel,

  parameters: {
    layout: 'padded',
    controls: { expanded: true },
  },

  args: { children: '// стек', as: 'h2' },

  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['h2', 'h3', 'div', 'span', 'p'],
      description: 'Семантический тег. По умолчанию h2 — метка озаглавливает секцию.',
      table: { category: 'Семантика', defaultValue: { summary: 'h2' } },
    },
    children: { control: 'text', table: { category: 'Контент' } },
  },
} satisfies Meta<typeof SectionLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play проверяет тег по умолчанию — заголовок секции `<h2>`. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: '// стек' })).toBeInTheDocument();
  },
};

/** Метки секций главной — единый «кодовый» акцент. */
export const Sections: Story = {
  name: 'Метки секций',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <SectionLabel>{'// обо мне'}</SectionLabel>
      <SectionLabel>{'// стек'}</SectionLabel>
      <SectionLabel>{'// активность'}</SectionLabel>
      <SectionLabel>{'// избранные проекты'}</SectionLabel>
    </div>
  ),
};

/** Разные семантические теги при одном визуале (для вложенных секций / готового заголовка). */
export const Tags: Story = {
  name: 'Семантические теги',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <SectionLabel as="h2">{'// as=h2 (по умолчанию)'}</SectionLabel>
      <SectionLabel as="h3">{'// as=h3 (вложенная секция)'}</SectionLabel>
      <SectionLabel as="span">{'// as=span (заголовок уже есть)'}</SectionLabel>
    </div>
  ),
};

/** В контексте: метка в одну строку с действием справа. */
export const WithAction: Story = {
  name: 'В контексте: с действием',
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
      }}
    >
      <SectionLabel>{'// избранные проекты'}</SectionLabel>
      <span style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--color-fg-muted)' }}>
        Все проекты →
      </span>
    </div>
  ),
};

/** Край: длинная метка не ломает раскладку секции. */
export const LongLabel: Story = {
  name: 'Край: длинная метка',
  args: { children: '// избранные коммерческие и pet-проекты за последние годы' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
};
