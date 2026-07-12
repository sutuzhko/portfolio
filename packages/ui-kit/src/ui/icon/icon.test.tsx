import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Icon } from './icon';

describe('Icon', () => {
  it('декоративна по умолчанию (aria-hidden, без роли)', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('с title становится доступной (role=img + label + <title>)', () => {
    const { container, getByTitle } = render(<Icon name="github" title="GitHub" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'GitHub');
    expect(getByTitle('GitHub')).toBeInTheDocument();
  });

  it('применяет размер к ширине и высоте', () => {
    const { container } = render(<Icon name="close" size={32} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Icon name="user" title="Профиль" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
