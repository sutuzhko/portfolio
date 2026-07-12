import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from './tabs';

const tabs = [
  { id: 'a', label: 'Профиль' },
  { id: 'b', label: 'Проекты' },
] as const;

describe('Tabs', () => {
  it('помечает выбранную вкладку через aria-selected', () => {
    render(<Tabs aria-label="Кабинет" value="a" onChange={vi.fn()} tabs={tabs} />);

    expect(screen.getByRole('tab', { name: 'Профиль' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Проекты' })).toHaveAttribute('aria-selected', 'false');
  });

  it('сообщает выбор по клику', async () => {
    const onChange = vi.fn();
    render(<Tabs aria-label="Кабинет" value="a" onChange={onChange} tabs={tabs} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Проекты' }));

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('переключается стрелками', async () => {
    const onChange = vi.fn();
    render(<Tabs aria-label="Кабинет" value="a" onChange={onChange} tabs={tabs} />);

    screen.getByRole('tab', { name: 'Профиль' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <Tabs aria-label="Кабинет" value="a" onChange={vi.fn()} tabs={tabs} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
