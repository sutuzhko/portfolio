import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { ThemeSwitch } from './theme-switch';

describe('ThemeSwitch', () => {
  it('рендерит кнопку с доступной подписью', () => {
    renderWithProviders(<ThemeSwitch />);
    expect(screen.getByRole('button')).toHaveAccessibleName();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<ThemeSwitch />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
