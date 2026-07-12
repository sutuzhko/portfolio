import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockEducation } from '@/entities/education/mocks';
import { mockLanguages } from '@/entities/language/mocks';
import { mockSkills } from '@/entities/skill/mocks';

import { ResumeDetails } from './ui/resume-details';

function renderDetails() {
  return renderWithProviders(
    <ResumeDetails education={mockEducation} languages={mockLanguages} skills={mockSkills} />,
  );
}

describe('ResumeDetails', () => {
  it('рендерит образование, языки и навыки', () => {
    renderDetails();
    expect(screen.getByText('Образование')).toBeInTheDocument();
    expect(screen.getByText('Бакалавр лингвистики')).toBeInTheDocument();
    expect(screen.getByText('Языки')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('без данных показывает скелетоны (нет заголовков секций)', () => {
    renderWithProviders(<ResumeDetails isLoading />);
    expect(screen.queryByText('Образование')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderDetails();
    expect(await axe(container)).toHaveNoViolations();
  });
});
