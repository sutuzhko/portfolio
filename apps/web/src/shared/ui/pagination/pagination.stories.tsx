import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Pagination } from './pagination';

const meta = {
  title: 'Shared/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  args: {
    page: 1,
    pageCount: 5,
    // Переопределяется управляемой обёрткой в `render`; заглушка для типов.
    onChange: () => undefined,
    ariaLabel: 'Страницы',
    prevLabel: 'Назад',
    nextLabel: 'Вперёд',
  },
  argTypes: { onChange: { control: false } },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Пять страниц — активная в середине. */
export const Default: Story = { name: 'Пять страниц', args: { page: 3 } };

/** Две страницы — минимальный видимый случай (одна — не рендерится). */
export const TwoPages: Story = { name: 'Две страницы', args: { pageCount: 2 } };
