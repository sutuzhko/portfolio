import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockProfile } from '@/entities/profile/mocks';
import { mockProjects } from '@/entities/project/mocks';
import { i18n } from '@/shared/config';

import { HomePage } from './home-page';
import { HomePageView } from './home-page-view';

describe('HomePage', () => {
  it('сначала показывает скелетон, затем героя с данными профиля из API', async () => {
    renderWithProviders(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // Пока запрос в полёте — контент героя ещё не отрисован (виден скелетон).
    expect(screen.queryByRole('heading', { name: 'Богдан Сутужко' })).not.toBeInTheDocument();

    // Данные приходят из MSW-мока профиля (русская локаль): имя тоже локализовано,
    // как и на бэкенде. Роль встречается и в герое, и в тексте «обо мне», поэтому
    // проверяем наличие, а не единственность.
    expect(await screen.findByRole('heading', { name: 'Богдан Сутужко' })).toBeInTheDocument();
    expect(screen.getAllByText(/Fullstack-разработчик/).length).toBeGreaterThan(0);
  });

  it('под геро-секцией показывает показатели и стек', async () => {
    renderWithProviders(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // Highlights приходят с бэкенда (profile.highlights) — появляются после загрузки.
    expect(await screen.findByText('3+')).toBeInTheDocument();
    // Stack — заголовок секции сразу, группы приходят с бэкенда (MSW).
    expect(screen.getByRole('heading', { name: '// стек' })).toBeInTheDocument();
    expect(await screen.findByText('Frontend')).toBeInTheDocument();
  });

  it('клик по избранной плитке открывает деталь проекта', async () => {
    const featured = mockProjects.filter((project) => project.pinned);
    const onOpenProject = vi.fn();
    renderWithProviders(
      <HomePageView profile={mockProfile} featured={featured} onOpenProject={onOpenProject} />,
    );

    await userEvent.click(screen.getByRole('button', { name: new RegExp(featured[0].title) }));
    expect(onOpenProject).toHaveBeenCalledWith(featured[0].slug);
  });

  it('скрывает ссылки на выключенные страницы (CTA и блок избранного)', () => {
    const featured = mockProjects.filter((project) => project.pinned);
    renderWithProviders(
      <HomePageView
        profile={mockProfile}
        featured={featured}
        pages={{ projects: false, experience: true, contact: false }}
      />,
    );

    // Проекты и контакты выключены → их ссылки с главной пропадают.
    expect(screen.queryByRole('button', { name: /^Проекты/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Связаться' })).not.toBeInTheDocument();
    expect(screen.queryByText('Все проекты')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: new RegExp(featured[0].title) }),
    ).not.toBeInTheDocument();
    // Опыт включён → ссылка «Смотреть опыт» остаётся.
    expect(screen.getByRole('button', { name: /Смотреть опыт/ })).toBeInTheDocument();
  });

  it('в английской локали профиль приходит на английском (Accept-Language)', async () => {
    await i18n.changeLanguage('en');
    renderWithProviders(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // MSW отдаёт en-вариант по заголовку Accept-Language, кэш сегментирован по языку.
    expect(await screen.findByText(/Full Stack Developer/)).toBeInTheDocument();
    expect(screen.queryByText(/Fullstack-разработчик/)).not.toBeInTheDocument();
  });
});
