import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Window } from './window';

// Юнит-тесты проверяют композицию и доступность окна.
// Интеракции (клик по «Закрыть» → onClose, декоративный режим без кнопок)
// покрыты play-сценариями в window.stories.tsx — здесь не дублируем.
describe('Window', () => {
  it('рендерит подпись и тело', () => {
    render(
      <Window title="~/projects">
        <p>Тело окна</p>
      </Window>,
    );
    expect(screen.getByText('~/projects')).toBeInTheDocument();
    expect(screen.getByText('Тело окна')).toBeInTheDocument();
  });

  it('рендерит слот тулбара', () => {
    render(
      <Window title="Окно" toolbar={<span>tools</span>}>
        Контент
      </Window>,
    );
    expect(screen.getByText('tools')).toBeInTheDocument();
  });

  it('пробрасывает обработчики в WindowChrome', () => {
    render(
      <Window title="Окно" closeLabel="Закрыть" onClose={() => undefined}>
        Контент
      </Window>,
    );
    expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <Window title="Окно" closeLabel="Закрыть" onClose={() => undefined}>
        Контент
      </Window>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
