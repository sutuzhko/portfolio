import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Select } from './select';

function renderSelect(props?: Parameters<typeof Select>[0]) {
  return render(
    <Select label="Папка" {...props}>
      <option value="root">Корень</option>
      <option value="js">JavaScript</option>
    </Select>,
  );
}

describe('Select', () => {
  it('связывает подпись с контролом', () => {
    renderSelect();
    expect(screen.getByLabelText('Папка')).toBeInstanceOf(HTMLSelectElement);
  });

  it('меняет выбранное значение', async () => {
    renderSelect();
    const select = screen.getByLabelText('Папка');

    await userEvent.selectOptions(select, 'js');

    expect(select).toHaveValue('js');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderSelect();
    expect(await axe(container)).toHaveNoViolations();
  });
});
