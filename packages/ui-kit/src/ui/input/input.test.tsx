import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('связывает подпись с полем', () => {
    render(<Input label="Логин" />);
    expect(screen.getByLabelText('Логин')).toBeInstanceOf(HTMLInputElement);
  });

  it('принимает ввод пользователя', async () => {
    render(<Input label="Логин" />);
    const field = screen.getByLabelText('Логин');

    await userEvent.type(field, 'bogdan');

    expect(field).toHaveValue('bogdan');
  });

  it('при ошибке помечает поле невалидным и связывает сообщение', () => {
    render(<Input label="Логин" error="неверный логин" />);
    const field = screen.getByLabelText('Логин');

    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('неверный логин');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Input label="Логин" hint="латиница" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
