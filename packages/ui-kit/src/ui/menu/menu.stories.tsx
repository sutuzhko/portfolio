import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { Button } from '../button';

import { Menu, MenuItem } from './menu';

const onSelect = fn();

const meta = {
  title: 'Shared/components/Menu',
  component: Menu,
  parameters: { layout: 'centered' },

  args: {
    ariaLabel: 'Действия',
    renderTrigger: ({ toggle, triggerProps }) => (
      <Button variant="ghost" onClick={toggle} {...triggerProps}>
        Открыть меню
      </Button>
    ),
    children: (
      <>
        <MenuItem icon="user" onClick={onSelect}>
          Профиль
        </MenuItem>
        <MenuItem icon="download" onClick={onSelect}>
          Скачать резюме
        </MenuItem>
        <MenuItem icon="lock" danger onClick={onSelect}>
          Выйти
        </MenuItem>
      </>
    ),
  },

  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Выравнивание панели относительно триггера.',
      table: { category: 'Оформление', defaultValue: { summary: 'start' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Подпись панели меню для скринридера.',
      table: { category: 'Доступность' },
    },
    renderTrigger: { control: false, table: { category: 'Слоты' } },
    children: { control: false, table: { category: 'Слоты' } },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик открывает меню (3 пункта), Escape закрывает. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent, step }) => {
    const canvas = within(canvasElement);
    await step('Клик по триггеру открывает меню', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }));
      await expect(canvas.getByRole('menu')).toBeInTheDocument();
      await expect(canvas.getAllByRole('menuitem')).toHaveLength(3);
    });
    await step('Escape закрывает меню', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    });
  },
};

/** Навигация по пунктам стрелками и Home/End. */
export const ArrowNavigation: Story = {
  name: 'Навигация стрелками',
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }));
    const items = canvas.getAllByRole('menuitem');
    // При открытии фокус — на первом пункте.
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(items[1]).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(items[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(items[0]).toHaveFocus();
  },
};

/** Клик вне панели закрывает меню. */
export const ClickOutside: Story = {
  name: 'Закрытие кликом вне',
  render: (args) => (
    <div style={{ display: 'grid', gap: 40, justifyItems: 'center' }}>
      <Menu {...args} />
      <button type="button" data-testid="outside" style={{ padding: 8 }}>
        область снаружи
      </button>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }));
    await expect(canvas.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId('outside'));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

/** Выбор пункта вызывает его обработчик и закрывает меню. */
export const SelectItem: Story = {
  name: 'Выбор пункта',
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Профиль' }));
    await expect(onSelect).toHaveBeenCalled();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

/** Выравнивание панели по правому краю триггера. */
export const Alignment: Story = {
  name: 'Выравнивание по правому краю',
  args: { align: 'end' },
};
