import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import type { ProfileContact } from '@/entities/profile';

import { ContactLinks } from './ui/contact-links';

const contacts: ProfileContact[] = [
  { icon: 'email', url: 'mailto:julfy.web@gmail.com' },
  { icon: 'github', url: 'https://github.com/sutuzhko' },
];

describe('ContactLinks', () => {
  it('рендерит карточки каналов с очищенными значениями', () => {
    renderWithProviders(<ContactLinks contacts={contacts} />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('github.com/sutuzhko')).toBeInTheDocument();
    // mailto очищается до самого адреса.
    expect(screen.getByText('julfy.web@gmail.com')).toBeInTheDocument();
  });

  it('внешняя ссылка открывается в новой вкладке, email — нет', () => {
    renderWithProviders(<ContactLinks contacts={contacts} />);

    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(github).toHaveAttribute('href', 'https://github.com/sutuzhko');
    expect(github).toHaveAttribute('target', '_blank');

    const email = screen.getByRole('link', { name: /Email/ });
    expect(email).toHaveAttribute('href', 'mailto:julfy.web@gmail.com');
    expect(email).not.toHaveAttribute('target');
  });

  it('без данных показывает скелетоны (нет каналов)', () => {
    renderWithProviders(<ContactLinks isLoading />);
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<ContactLinks contacts={contacts} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
