import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Avatar } from './avatar';

describe('Avatar', () => {
  it('показывает инициалы и доступен по имени', () => {
    render(<Avatar name="Bogdan Sutuzhko" />);
    const avatar = screen.getByRole('img', { name: 'Bogdan Sutuzhko' });

    expect(avatar).toHaveTextContent('BS');
  });

  it('при наличии src рендерит изображение с alt', () => {
    render(<Avatar name="Bogdan Sutuzhko" src="/photo.png" />);
    expect(screen.getByRole('img', { name: 'Bogdan Sutuzhko' })).toBeInstanceOf(HTMLImageElement);
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Avatar name="Anna Karenina" color="#4b6b8a" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
