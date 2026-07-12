import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Tag } from './tag';

describe('Tag', () => {
  it('рендерит содержимое', () => {
    render(<Tag>TypeScript</Tag>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('не интерактивен (нет роли button)', () => {
    render(<Tag>React</Tag>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Tag tone="tinted">commercial</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
