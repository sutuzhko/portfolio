import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { WindowChrome } from './window-chrome';

const meta = {
  title: 'Shared/primitives/WindowChrome',
  component: WindowChrome,

  parameters: {
    layout: 'centered',

    controls: {
      expanded: true,
    },
  },

  args: {
    onClose: fn(),
    onMinimize: fn(),
    onMaximize: fn(),

    closeLabel: 'Закрыть',
    minimizeLabel: 'Свернуть',
    maximizeLabel: 'Развернуть',
  },

  argTypes: {
    closeLabel: {
      control: 'text',
      description: 'ARIA-метка кнопки закрытия.',
      table: {
        category: 'Доступность',
      },
    },

    minimizeLabel: {
      control: 'text',
      description: 'ARIA-метка кнопки сворачивания.',
      table: {
        category: 'Доступность',
      },
    },

    maximizeLabel: {
      control: 'text',
      description: 'ARIA-метка кнопки разворачивания.',
      table: {
        category: 'Доступность',
      },
    },

    onClose: {
      control: false,
      description: 'Вызывается при нажатии на кнопку закрытия.',
      table: {
        category: 'События',
      },
    },

    onMinimize: {
      control: false,
      description: 'Вызывается при нажатии на кнопку сворачивания.',
      table: {
        category: 'События',
      },
    },

    onMaximize: {
      control: false,
      description: 'Вызывается при нажатии на кнопку разворачивания.',
      table: {
        category: 'События',
      },
    },
  },
} satisfies Meta<typeof WindowChrome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Интерактивный пример',

  play: async ({ canvas, userEvent, args, step }) => {
    await step('Отображаются все элементы управления', async () => {
      await expect(canvas.getAllByRole('button')).toHaveLength(3);
    });

    await step('Пользователь взаимодействует с компонентом', async () => {
      const minimizeButton = canvas.getByRole('button', {
        name: 'Свернуть',
      });

      const maximizeButton = canvas.getByRole('button', {
        name: 'Развернуть',
      });

      const closeButton = canvas.getByRole('button', {
        name: 'Закрыть',
      });

      await userEvent.click(minimizeButton);
      await userEvent.click(maximizeButton);
      await userEvent.click(closeButton);

      await expect(args.onMinimize).toHaveBeenCalledOnce();
      await expect(args.onMaximize).toHaveBeenCalledOnce();
      await expect(args.onClose).toHaveBeenCalledOnce();
    });
  },
};

export const ВсеКнопки: Story = {
  name: 'Все элементы управления',
};

export const ТолькоЗакрытие: Story = {
  name: 'Только кнопка закрытия',

  args: {
    onMinimize: undefined,
    onMaximize: undefined,
  },
};

export const ТолькоУправлениеОкном: Story = {
  name: 'Сворачивание и разворачивание',

  args: {
    onClose: undefined,
  },
};

export const ТолькоСворачивание: Story = {
  name: 'Только сворачивание',

  args: {
    onClose: undefined,
    onMaximize: undefined,
  },
};

export const ТолькоРазворачивание: Story = {
  name: 'Только разворачивание',

  args: {
    onClose: undefined,
    onMinimize: undefined,
  },
};

export const Декоративный: Story = {
  name: 'Декоративный режим',

  args: {
    onClose: undefined,
    onMinimize: undefined,
    onMaximize: undefined,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Клавиатура: Story = {
  name: 'Управление с клавиатуры',

  play: async ({ canvasElement, args, userEvent, step }) => {
    const canvas = within(canvasElement);

    await step('Кнопки достижимы по Tab в порядке закрыть → свернуть → развернуть', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Закрыть' })).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Свернуть' })).toHaveFocus();
    });

    await step('Enter на сфокусированной кнопке вызывает её обработчик', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onMinimize).toHaveBeenCalledOnce();
    });
  },
};
