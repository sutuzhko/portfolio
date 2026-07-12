import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { CodewarsStats, GithubStats } from '@/entities/stats';
import { renderWithProviders } from '@/app/test/render';

import { Activity } from './ui/activity';

const github: GithubStats = {
  handle: '@sutuzhko',
  url: 'https://github.com/sutuzhko',
  repos: 18,
  followers: 13,
  following: 27,
  since: '2020',
  topLanguages: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'],
};

const codewars: CodewarsStats = {
  handle: 'sutuzhko',
  url: 'https://www.codewars.com/users/sutuzhko',
  kyu: 3,
  rankName: '3 kyu',
  honor: 1069,
  katas: 62,
  leaderboardPosition: 33322,
  nextKyu: 2,
  progress: 62,
};

describe('Activity', () => {
  it('рендерит карточки GitHub и Codewars со статистикой', () => {
    renderWithProviders(<Activity github={github} codewars={codewars} />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('@sutuzhko')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Codewars')).toBeInTheDocument();
    expect(screen.getByText('3 kyu')).toBeInTheDocument();
    // Число форматируется с разделителем тысяч (ru → неразрывный пробел).
    expect(screen.getByText('33 322')).toBeInTheDocument();
    // Прогресс до следующего ранга.
    expect(screen.getByText('до 2 kyu')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  it('внешняя ссылка на профиль открывается в новой вкладке', () => {
    renderWithProviders(<Activity github={github} codewars={codewars} />);
    const link = screen.getByRole('link', { name: 'Профиль ↗' });
    expect(link).toHaveAttribute('href', 'https://github.com/sutuzhko');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('без данных показывает скелетоны (нет ссылок и статистики)', () => {
    renderWithProviders(<Activity />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
  });

  it('при ошибке сервиса показывает фолбэк вместо карточки', () => {
    renderWithProviders(<Activity github={github} codewarsError />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getAllByText('Статистика временно недоступна').length).toBeGreaterThan(0);
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Activity github={github} codewars={codewars} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
