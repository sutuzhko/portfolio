import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, within } from 'storybook/test';

import { Icon } from '../icon';
import { Kbd } from '../kbd';

import { Button } from './button';

const VARIANTS = ['primary', 'ghost', 'mono', 'text', 'icon'] as const;

const meta = {
  title: 'Shared/primitives/Button',
  component: Button,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    children: 'Войти',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },

  argTypes: {
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description:
        'Визуальная роль: primary — главное действие, ghost/mono — вторичные, text — без рамки, icon — квадратная (обязателен aria-label).',
      table: { category: 'Оформление', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['md', 'sm'],
      description: 'Размер кнопки. У icon-варианта переопределяет паддинги на квадратные.',
      table: { category: 'Оформление', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть на всю ширину контейнера (например, сабмит формы).',
      table: { category: 'Оформление', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Недоступное состояние: не реагирует на клик и уводится из tab-порядка.',
      table: { category: 'Состояние', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      description: 'Нативный тип. По умолчанию button — не сабмитит форму случайно.',
      table: { category: 'Поведение', defaultValue: { summary: 'button' } },
    },
    children: { control: false, table: { category: 'Контент' } },
    onClick: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Интерактивная песочница: играйте контролами слева, клик проверяется в play. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Войти' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** Пять ролей рядом — быстрый обзор всех вариантов оформления. */
export const Variants: Story = {
  name: 'Все варианты',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="mono">
        go /home
      </Button>
      <Button {...args} variant="text">
        Text
      </Button>
      <Button {...args} variant="icon" aria-label="Поиск">
        <Icon name="search" />
      </Button>
    </div>
  ),
};

/** md против sm для каждого текстового варианта. */
export const Sizes: Story = {
  name: 'Размеры',
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['primary', 'ghost', 'mono', 'text'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button {...args} variant={variant} size="md">
            {variant} md
          </Button>
          <Button {...args} variant={variant} size="sm">
            {variant} sm
          </Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * Исчерпывающая матрица «всё-сразу»: вариант × размер × (обычная / недоступная).
 * Одним взглядом видно каждую комбинацию, которую умеет компонент.
 */
export const Matrix: Story = {
  name: 'Матрица: вариант × размер × состояние',
  parameters: { controls: { disable: true } },
  render: () => {
    const iconChild = (variant: (typeof VARIANTS)[number]): ReactNode =>
      variant === 'icon' ? <Icon name="star" /> : variant;
    const label = (variant: (typeof VARIANTS)[number]): string | undefined =>
      variant === 'icon' ? 'Избранное' : undefined;

    return (
      <div style={{ display: 'grid', gap: 20 }}>
        {(['md', 'sm'] as const).map((size) => (
          <div key={size} style={{ display: 'grid', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.6 }}>
              size = {size}
            </span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size} aria-label={label(variant)}>
                  {iconChild(variant)}
                </Button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {VARIANTS.map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  size={size}
                  disabled
                  aria-label={label(variant)}
                >
                  {iconChild(variant)}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/** Иконка + подпись (ведущая/замыкающая) и квадратная icon-кнопка. */
export const WithIcon: Story = {
  name: 'С иконкой',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        <Icon name="download" size={16} /> Скачать резюме
      </Button>
      <Button {...args} variant="ghost">
        Проекты <Icon name="arrow-right" size={16} />
      </Button>
      <Button {...args} variant="icon" aria-label="Сменить тему">
        <Icon name="moon" />
      </Button>
      <Button {...args} variant="icon" size="sm" aria-label="Открыть меню">
        <Icon name="kebab" />
      </Button>
    </div>
  ),
};

/** Обязательное доступное имя у icon-кнопки: без aria-label иконка «нема» для скринридера. */
export const IconOnlyAccessibleName: Story = {
  name: 'Icon: доступное имя',
  args: { variant: 'icon', children: <Icon name="moon" />, 'aria-label': 'Сменить тему' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Сменить тему' })).toBeInTheDocument();
  },
};

/** На всю ширину контейнера — типовой сабмит формы. */
export const FullWidth: Story = {
  name: 'Во всю ширину',
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
  args: { fullWidth: true, children: 'Отправить' },
};

/** Недоступная кнопка не вызывает onClick — проверяем в play. */
export const Disabled: Story = {
  name: 'Недоступна',
  args: { disabled: true },
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Войти' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Активация с клавиатуры: фокус → Enter и Пробел срабатывают как клик. */
export const KeyboardActivation: Story = {
  name: 'Активация с клавиатуры',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Войти' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

/** Край: длинная подпись — текст переносится/усекается по правилам потребителя, кнопка не ломает раскладку. */
export const LongLabel: Story = {
  name: 'Край: длинная подпись',
  decorators: [(Story) => <div style={{ width: 260 }}>{Story()}</div>],
  args: {
    fullWidth: true,
    children: 'Скачать полное резюме в формате PDF со всей историей опыта',
  },
};

/** В контексте: пара CTA (главное + вторичное действие), как в hero. */
export const InContext: Story = {
  name: 'В контексте: CTA-пара',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">
        <Icon name="download" size={16} /> Скачать резюме
      </Button>
      <Button variant="ghost">
        Проекты <Icon name="arrow-right" size={16} />
      </Button>
      <Button variant="mono">
        <Kbd>⌘K</Kbd> Консоль
      </Button>
    </div>
  ),
};
