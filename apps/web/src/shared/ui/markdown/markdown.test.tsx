import { screen } from '@testing-library/react';
import type { Components } from 'react-markdown';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { Markdown } from './markdown';

const TABLE = `| Технология | Роль |
| ---------- | ---- |
| React      | UI   |
| NestJS     | API  |
`;

describe('Markdown', () => {
  it('рендерит GFM-таблицу настоящими table/th/td', () => {
    renderWithProviders(<Markdown>{TABLE}</Markdown>);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Технология' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'React' })).toBeInTheDocument();
  });

  it('оборачивает таблицу в скролл-контейнер', () => {
    renderWithProviders(<Markdown>{TABLE}</Markdown>);
    const table = screen.getByRole('table');
    // Таблица лежит внутри div-обёртки (для overflow-x), а не напрямую в .prose.
    expect(table.parentElement?.tagName).toBe('DIV');
  });

  it('внешнюю ссылку открывает в новой вкладке безопасно', () => {
    renderWithProviders(<Markdown>{'Текст [ссылка](https://example.com).'}</Markdown>);

    const link = screen.getByRole('link', { name: 'ссылка' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('поддерживает зачёркивание (GFM)', () => {
    renderWithProviders(<Markdown>{'~~убрано~~'}</Markdown>);
    expect(screen.getByText('убрано').tagName).toBe('DEL');
  });

  it('позволяет переопределить рендерер через проп components', () => {
    const components: Components = {
      a: ({ node: _node, children }) => <span data-testid="custom-link">{children}</span>,
    };
    renderWithProviders(
      <Markdown components={components}>{'[ссылка](https://example.com)'}</Markdown>,
    );

    expect(screen.getByTestId('custom-link')).toHaveTextContent('ссылка');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('не имеет нарушений доступности', async () => {
    const { container } = renderWithProviders(<Markdown>{TABLE}</Markdown>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
