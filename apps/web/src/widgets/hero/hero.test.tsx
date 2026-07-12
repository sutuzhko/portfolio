import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import type { Profile } from '@/entities/profile';
import { renderWithProviders } from '@/app/test/render';

import { Hero } from './ui/hero';

const profile: Profile = {
  name: 'Bogdan Sutuzhko',
  roleTitle: 'Full Stack Developer',
  location: 'Moscow, Russia',
  email: 'julfy.web@gmail.com',
  avatarPhotoUrl: null,
  avatarColor: '#238636',
  heroStack: ['React', 'Vue 3', 'Next.js', 'Node · NestJS', 'TypeScript'],
  availability: 'ACTIVE',
  cvUrl: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
  highlights: [],
  headline: 'Строю аккуратный фронтенд и корпоративные UI-kit с нуля.',
  bioMarkdown: 'bio',
  projectsIntro: null,
  experienceIntro: null,
  contactIntro: null,
  contacts: [],
};

describe('Hero', () => {
  it('рендерит имя, роль и печатающую строку из профиля/конфига', () => {
    renderWithProviders(<Hero profile={profile} />);
    expect(screen.getByRole('heading', { name: 'Bogdan Sutuzhko' })).toBeInTheDocument();
    expect(screen.getByText(/Full Stack Developer/)).toBeInTheDocument();
    expect(screen.getByText('Сейчас пишу на')).toBeInTheDocument();
  });

  it('рендерит CTA-кнопки и пробрасывает обработчики', async () => {
    const onProjects = vi.fn();
    renderWithProviders(<Hero profile={profile} onProjects={onProjects} />);
    expect(screen.getByRole('button', { name: 'Скачать резюме' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Связаться' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Проекты' }));
    expect(onProjects).toHaveBeenCalledOnce();
  });

  it('под скелетоном скрыты имя, строка стека и питч, но CTA доступны', () => {
    renderWithProviders(<Hero isLoading />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText('Сейчас пишу на')).not.toBeInTheDocument();
    // Питч — данные профиля, поэтому под скелетоном при загрузке.
    expect(screen.queryByText(/Строю аккуратный фронтенд/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скачать резюме' })).toBeInTheDocument();
  });

  it('показывает скелетон, если профиля ещё нет', () => {
    renderWithProviders(<Hero />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Hero profile={profile} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
