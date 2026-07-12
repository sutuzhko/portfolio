import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { Footer } from './ui/footer';

describe('Footer', () => {
  it('рендерит копирайт с текущим годом и владельцем из пропа', () => {
    renderWithProviders(<Footer owner="Bogdan Sutuzhko" />);
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`${year}.*Bogdan Sutuzhko`))).toBeInTheDocument();
  });

  it('показывает подсказку с клавиатурным ярлыком консоли', () => {
    // В тест-окружении matchMedia → есть клавиатура, платформа Mac → «⌘K».
    renderWithProviders(<Footer owner="Bogdan Sutuzhko" />);
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('без владельца рендерит скелетон вместо имени, не падая', () => {
    renderWithProviders(<Footer />);
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`©\\s*${year}`))).toBeInTheDocument();
  });

  it('на тач-устройстве (нет клавиатуры) прячет подсказку с шорткатом', () => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
    try {
      renderWithProviders(<Footer owner="Bogdan Sutuzhko" />);
      expect(screen.queryByText('⌘K')).not.toBeInTheDocument();
      expect(screen.queryByText(/для консоли/)).not.toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Footer owner="Bogdan Sutuzhko" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
