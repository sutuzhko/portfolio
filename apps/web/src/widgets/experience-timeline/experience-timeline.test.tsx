import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockExperience } from '@/entities/experience/mocks';

import { ExperienceTimeline } from './ui/experience-timeline';

describe('ExperienceTimeline', () => {
  it('рендерит записи опыта с ролью и компанией', () => {
    renderWithProviders(<ExperienceTimeline jobs={mockExperience} />);
    expect(screen.getByRole('heading', { name: 'Frontend-разработчик' })).toBeInTheDocument();
    expect(screen.getByText('Go Mobile')).toBeInTheDocument();
  });

  it('без данных показывает скелетон (нет ролей)', () => {
    renderWithProviders(<ExperienceTimeline isLoading />);
    expect(screen.queryByRole('heading', { name: 'Frontend-разработчик' })).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<ExperienceTimeline jobs={mockExperience} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
