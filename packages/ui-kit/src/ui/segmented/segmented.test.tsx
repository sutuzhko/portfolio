import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Segmented } from './segmented';

const options = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
] as const;

describe('Segmented', () => {
  it('рендерит radiogroup с отмеченным значением', () => {
    render(<Segmented aria-label="Тема" value="dark" onChange={vi.fn()} options={options} />);

    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'false');
  });

  it('сообщает значение по клику', async () => {
    const onChange = vi.fn();
    render(<Segmented aria-label="Тема" value="dark" onChange={onChange} options={options} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(onChange).toHaveBeenCalledWith('light');
  });

  it('переключается стрелками', async () => {
    const onChange = vi.fn();
    render(<Segmented aria-label="Тема" value="dark" onChange={onChange} options={options} />);

    screen.getByRole('radio', { name: 'Dark' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('light');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <Segmented aria-label="Тема" value="dark" onChange={vi.fn()} options={options} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
