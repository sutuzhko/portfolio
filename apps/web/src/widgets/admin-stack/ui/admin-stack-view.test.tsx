import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockLanguagesAdmin } from '@/entities/language/mocks';
import { mockSkillsAdmin } from '@/entities/skill/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import {
  buildLangRows,
  buildSkillChips,
  buildTechCategories,
  buildTechChips,
} from '../model/stack-form';

import { AdminStackView } from './admin-stack-view';

const categories = buildTechCategories(mockTechnologiesAdmin);
const chips = buildTechChips(mockTechnologiesAdmin, categories);
const langRows = buildLangRows(mockLanguagesAdmin, 'ru');
const skillChips = buildSkillChips(mockSkillsAdmin, 'ru');

function renderView(overrides: Partial<Parameters<typeof AdminStackView>[0]> = {}) {
  const onSave = vi.fn();
  const result = renderWithProviders(
    <AdminStackView
      techCategories={categories}
      chips={chips}
      langRows={langRows}
      skillChips={skillChips}
      isBusy={false}
      onSave={onSave}
      {...overrides}
    />,
  );
  return { onSave, ...result };
}

// Дифф последнего вызова onSave.
type Diff = Parameters<Parameters<typeof AdminStackView>[0]['onSave']>[0];
const lastDiff = (onSave: ReturnType<typeof vi.fn>): Diff => onSave.mock.calls[0]?.[0] as Diff;

describe('AdminStackView', () => {
  it('рисует блоки-категории, чипы, языки и навыки', () => {
    renderView();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Русский')).toBeInTheDocument();
    // «Accessibility» уникален для навыков (нет среди технологий).
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('«+» в блоке раскрывает инлайн-чип; ввод + Enter кладёт технологию в дифф', async () => {
    const { onSave } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Добавить в «Backend»' }));
    const input = screen.getByRole('textbox', { name: 'Технология' });
    await userEvent.type(input, 'GraphQL{Enter}');
    expect(screen.getByText('GraphQL')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(lastDiff(onSave).chips.some((c) => c.name === 'GraphQL' && c.id === null)).toBe(true);
  });

  it('пустой инлайн-чип не создаётся (Escape отменяет)', async () => {
    renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Добавить в «Backend»' }));
    const input = screen.getByRole('textbox', { name: 'Технология' });
    await userEvent.type(input, '{Escape}');
    expect(screen.queryByRole('textbox', { name: 'Технология' })).not.toBeInTheDocument();
  });

  it('переименование категории уходит в дифф (карандаш → инлайн-поле)', async () => {
    const { onSave } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Переименовать «Frontend»' }));
    const input = screen.getByRole('textbox', { name: 'Название блока' });
    await userEvent.clear(input);
    await userEvent.type(input, 'UI{Enter}');

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(lastDiff(onSave).techCategories.some((c) => c.name === 'UI')).toBe(true);
    expect(lastDiff(onSave).techCategories.some((c) => c.name === 'Frontend')).toBe(false);
  });

  it('«+ блок» добавляет новую категорию с инлайн-именем', async () => {
    renderView();
    await userEvent.click(screen.getByRole('button', { name: '+ блок' }));
    const input = screen.getByRole('textbox', { name: 'Название блока' });
    await userEvent.type(input, 'Mobile{Enter}');
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('удаление технологии попадает в deletedTechIds', async () => {
    const { onSave } = renderView();
    await userEvent.click(screen.getByLabelText('Убрать «React»'));

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(lastDiff(onSave).deletedTechIds).toContain(mockTechnologiesAdmin[0]?.id);
    expect(lastDiff(onSave).chips.some((c) => c.name === 'React')).toBe(false);
  });

  it('бар «Сохранить/Отменить» появляется только при изменениях', async () => {
    renderView();
    expect(screen.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Убрать «React»'));
    expect(screen.getByRole('button', { name: /Сохранить/ })).toBeEnabled();
  });

  it('удаление блока целиком убирает его чипы и шлёт их id в deletedTechIds', async () => {
    const { onSave } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Удалить блок «Tooling»' }));
    expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
    // «Cypress» уникален для Tooling-технологий (нет среди навыков).
    expect(screen.queryByText('Cypress')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    const diff = lastDiff(onSave);
    expect(diff.techCategories.some((c) => c.name === 'Tooling')).toBe(false);
    // Все 6 технологий Tooling (Vite/Storybook/Jest/Cypress/Docker/Git) — на удаление.
    expect(diff.deletedTechIds.length).toBeGreaterThanOrEqual(6);
  });

  it('навыки: «+» добавляет инлайн-чип, удаление — в deletedSkillIds', async () => {
    const { onSave } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Добавить навык' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Навык' }), 'GraphQL{Enter}');

    await userEvent.click(screen.getByLabelText('Убрать «Performance»'));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(lastDiff(onSave).skillChips.some((c) => c.name === 'GraphQL' && c.id === null)).toBe(
      true,
    );
    expect(lastDiff(onSave).deletedSkillIds.length).toBe(1);
    expect(lastDiff(onSave).skillChips.some((c) => c.name === 'Performance')).toBe(false);
  });

  it('чипы, навыки и блоки получают ручки перетаскивания', () => {
    renderView();
    // Чип технологии (React), навык (Accessibility) и блок (Frontend) — сортируемы.
    expect(screen.getByRole('button', { name: 'Переместить «React»' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Переместить «Accessibility»' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Переместить блок «Frontend»' })).toBeInTheDocument();
  });

  it('«+ язык» добавляет строку; заполненная — уходит в дифф', async () => {
    const { onSave } = renderView();
    const before = langRows.length;
    await userEvent.click(screen.getByRole('button', { name: 'язык' }));
    // Пустая новая строка не считается изменением (create не уйдёт) — заполняем название.
    const nameInputs = screen.getAllByLabelText('Язык');
    await userEvent.type(nameInputs[nameInputs.length - 1], 'Немецкий');

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(lastDiff(onSave).langRows.length).toBe(before + 1);
    expect(lastDiff(onSave).langRows.some((row) => row.name === 'Немецкий')).toBe(true);
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});
