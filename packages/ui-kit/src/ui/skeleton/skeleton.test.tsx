import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('декоративен и скрыт от скринридеров', () => {
    const { container } = render(<Skeleton width="100px" height="20px" />);
    const node = container.querySelector('span');

    expect(node).toHaveAttribute('aria-hidden', 'true');
  });

  it('применяет переданные размеры', () => {
    const { container } = render(<Skeleton width="120px" height="40px" radius="8px" />);
    const node = container.querySelector('span');

    expect(node).toHaveStyle({ width: '120px', height: '40px', borderRadius: '8px' });
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Skeleton width="100px" height="20px" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
