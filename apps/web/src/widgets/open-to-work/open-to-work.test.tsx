import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/app/test/render';

import { OpenToWork } from './ui/open-to-work';

describe('OpenToWork', () => {
  it('показывает статус и описание по availability (локализовано)', () => {
    renderWithProviders(<OpenToWork availability="OPEN" />);
    expect(screen.getByText('Открыт к предложениям')).toBeInTheDocument();
    expect(screen.getByText(/Go Mobile/)).toBeInTheDocument();
  });

  it('для другого статуса меняет заголовок', () => {
    renderWithProviders(<OpenToWork availability="NOTLOOKING" />);
    expect(screen.getByText('Сейчас не ищу')).toBeInTheDocument();
  });

  it('вызывает переход к опыту по клику на кнопку', async () => {
    const onViewExperience = vi.fn();
    renderWithProviders(<OpenToWork availability="ACTIVE" onViewExperience={onViewExperience} />);

    await userEvent.click(screen.getByRole('button', { name: 'Смотреть опыт →' }));
    expect(onViewExperience).toHaveBeenCalledOnce();
  });

  it('во время загрузки показывает скелетон вместо контента', () => {
    renderWithProviders(<OpenToWork isLoading />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Открыт к предложениям')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<OpenToWork availability="OPEN" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
