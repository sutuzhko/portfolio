import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

const labels = { ariaLabel: 'Страницы', prevLabel: 'Назад', nextLabel: 'Вперёд' };

describe('Pagination', () => {
  it('ничего не рендерит при одной странице', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={vi.fn()} {...labels} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('рисует номера страниц и помечает активную', () => {
    render(<Pagination page={2} pageCount={3} onChange={vi.fn()} {...labels} />);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('клик по номеру зовёт onChange с этой страницей', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onChange={onChange} {...labels} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('стрелки блокируются на краях', () => {
    render(<Pagination page={1} pageCount={3} onChange={vi.fn()} {...labels} />);
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeEnabled();
  });

  it('не имеет нарушений доступности', async () => {
    const { container } = render(
      <Pagination page={2} pageCount={4} onChange={vi.fn()} {...labels} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
