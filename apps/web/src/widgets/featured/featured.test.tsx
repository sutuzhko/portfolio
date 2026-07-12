import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import type { ProjectListItem } from '@/entities/project';
import { renderWithProviders } from '@/app/test/render';

import { Featured } from './ui/featured';

const projects: ProjectListItem[] = [
  {
    slug: 'procharity',
    title: 'Procharity',
    description: 'Платформа интеллектуального волонтёрства',
    subtitle: null,
    category: 'commercial',
    period: '2021',
    tileColor: '#1d6f74',
    pinned: true,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: 'TypeScript',
    technologies: ['TypeScript', 'React', 'SCSS', 'Redux', 'Webpack'],
    contributors: [
      { name: 'Богдан Сутужко', image: null, color: '#238636', link: null },
      { name: 'Алексей Мартынов', image: null, color: '#8957e5', link: null },
      { name: 'Мария Волкова', image: null, color: '#1f6feb', link: null },
      { name: 'Иван Петров', image: null, color: '#a371f7', link: null },
    ],
  },
];

describe('Featured', () => {
  it('рендерит заголовок секции и плитку проекта с локализованной категорией', () => {
    renderWithProviders(<Featured projects={projects} />);

    expect(screen.getByRole('heading', { name: '// избранные проекты' })).toBeInTheDocument();
    expect(screen.getByText('Procharity')).toBeInTheDocument();
    expect(screen.getByText('Коммерческий')).toBeInTheDocument();
  });

  it('ограничивает аватары, сворачивая остаток в «+N»', () => {
    renderWithProviders(<Featured projects={projects} />);
    // 4 контрибьютора → 3 аватара + «+1» (число тегов считается по ширине в рантайме).
    expect(screen.getByText('+1')).toBeInTheDocument();
    // Теги-технологии присутствуют в DOM (замер ширины делает ResizeObserver в браузере).
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('вызывает onSelect со slug по клику на плитку', async () => {
    const onSelect = vi.fn();
    renderWithProviders(<Featured projects={projects} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /Procharity/ }));
    expect(onSelect).toHaveBeenCalledWith('procharity');
  });

  it('вызывает onViewAll по кнопке «Все проекты»', async () => {
    const onViewAll = vi.fn();
    renderWithProviders(<Featured projects={projects} onViewAll={onViewAll} />);

    await userEvent.click(screen.getByRole('button', { name: 'Все проекты →' }));
    expect(onViewAll).toHaveBeenCalledOnce();
  });

  it('без данных показывает скелетоны вместо плиток', () => {
    renderWithProviders(<Featured isLoading />);
    expect(screen.queryByText('Procharity')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Featured projects={projects} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
