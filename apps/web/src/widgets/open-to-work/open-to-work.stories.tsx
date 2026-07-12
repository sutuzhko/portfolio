import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { OpenToWork } from './ui/open-to-work';

const meta = {
  title: 'Widgets/OpenToWork',
  component: OpenToWork,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { availability: 'OPEN', onViewExperience: fn() },
  argTypes: {
    availability: {
      control: 'inline-radio',
      options: ['ACTIVE', 'OPEN', 'NOTLOOKING'],
      description: 'Статус доступности — переключайте, чтобы увидеть все варианты.',
      table: { category: 'Контент' },
    },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    onViewExperience: { control: false, table: { category: 'События' } },
    id: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof OpenToWork>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Открыт к предложениям. play: клик «Смотреть опыт →» вызывает onViewExperience. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Открыт к предложениям')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Смотреть опыт →' }));
    await expect(args.onViewExperience).toHaveBeenCalled();
  },
};

/** Все три статуса сразу: цвет точки и пульсация меняются по ключу. */
export const AllStatuses: Story = {
  name: 'Все статусы',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <OpenToWork {...args} availability="ACTIVE" />
      <OpenToWork {...args} availability="OPEN" />
      <OpenToWork {...args} availability="NOTLOOKING" />
    </div>
  ),
};

/** В активном поиске — пульсирующий ореол (уважает `prefers-reduced-motion`). */
export const Active: Story = {
  name: 'В активном поиске (пульсация)',
  args: { availability: 'ACTIVE' },
};

/** Сейчас не ищу. */
export const NotLooking: Story = {
  name: 'Сейчас не ищу',
  args: { availability: 'NOTLOOKING' },
};

/** Профиль грузится — скелетон той же высоты. */
export const Loading: Story = {
  name: 'Скелетон загрузки',
  args: { isLoading: true },
};

/** Мобильная раскладка: кнопка переносится под текст. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
