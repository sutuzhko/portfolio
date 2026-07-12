import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { PageIntro } from './page-intro';

describe('PageIntro', () => {
  it('рендерит текст интро', () => {
    render(<PageIntro intro="Открыт к предложениям" />);
    expect(screen.getByText('Открыт к предложениям')).toBeInTheDocument();
  });

  it('показывает скелетон, пока текст не пришёл (undefined)', () => {
    const { container } = render(<PageIntro intro={undefined} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('ничего не рендерит, если интро нет (null)', () => {
    const { container } = render(<PageIntro intro={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<PageIntro intro="Текст интро экрана" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
