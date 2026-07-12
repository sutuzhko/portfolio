import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Kbd } from './kbd';

describe('Kbd', () => {
  it('рендерит семантический элемент kbd', () => {
    const { container } = render(<Kbd>Esc</Kbd>);
    const kbd = container.querySelector('kbd');

    expect(kbd).not.toBeNull();
    expect(kbd).toHaveTextContent('Esc');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Kbd>Enter</Kbd>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
