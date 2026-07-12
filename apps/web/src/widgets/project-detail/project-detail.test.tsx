import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockProjectDetail } from '@/entities/project/mocks';

import { ProjectDetail } from './ui/project-detail';

describe('ProjectDetail', () => {
  it('рендерит баннер, «что внутри», роль, стек и внешнюю ссылку', () => {
    renderWithProviders(<ProjectDetail project={mockProjectDetail} />);

    expect(screen.getByRole('heading', { name: 'Procharity' })).toBeInTheDocument();
    expect(screen.getByText('Что внутри')).toBeInTheDocument();
    expect(screen.getByText('Ведущий фронтенд-разработчик')).toBeInTheDocument();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);

    const link = screen.getByRole('link', { name: 'Сайт' });
    expect(link).toHaveAttribute('href', 'https://procharity.ru');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('участник со ссылкой кликабелен, без ссылки — обычная строка', () => {
    renderWithProviders(<ProjectDetail project={mockProjectDetail} />);

    // У Богдана в моке есть link → строка команды становится ссылкой в новую вкладку.
    const member = screen.getByRole('link', { name: /Богдан Сутужко/ });
    expect(member).toHaveAttribute('href', 'https://github.com/sutuzhko');
    expect(member).toHaveAttribute('target', '_blank');
    expect(member).toHaveAttribute('rel', expect.stringContaining('noopener'));

    // У участника без link ссылки нет.
    expect(screen.queryByRole('link', { name: /Алексей Мартынов/ })).not.toBeInTheDocument();
  });

  it('без данных показывает скелетон (нет заголовка)', () => {
    renderWithProviders(<ProjectDetail isLoading />);
    expect(screen.queryByRole('heading', { name: 'Procharity' })).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<ProjectDetail project={mockProjectDetail} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
