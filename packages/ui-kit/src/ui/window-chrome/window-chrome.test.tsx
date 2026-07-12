import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { WindowChrome } from '../index';

describe('WindowChrome', () => {
  it('без обработчиков не имеет интерактивных элементов', () => {
    render(<WindowChrome />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <WindowChrome
        onClose={vi.fn()}
        onMinimize={vi.fn()}
        onMaximize={vi.fn()}
        closeLabel="Закрыть"
        minimizeLabel="Свернуть"
        maximizeLabel="Развернуть"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
