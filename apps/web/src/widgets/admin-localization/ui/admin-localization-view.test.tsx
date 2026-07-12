import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import type { LocGroup, LocRow, LocStats } from '../model/loc-rows';

import { AdminLocalizationView } from './admin-localization-view';

const makeRow = (over: Partial<LocRow>): LocRow => ({
  id: 'project:p1:title',
  sectionId: 'project:p1',
  sectionLabel: 'Проект · Альфа',
  sourceId: 'project',
  entityId: 'p1',
  fieldKey: 'title',
  label: 'project.alpha.title',
  ru: 'Альфа',
  en: 'Alpha',
  ...over,
});

const titleRow = makeRow({});
const roleRow = makeRow({
  id: 'project:p1:role',
  fieldKey: 'role',
  label: 'project.alpha.role',
  ru: 'Разработчик',
  en: '',
});

const groups: LocGroup[] = [
  { id: 'project:p1', label: 'Проект · Альфа', rows: [titleRow, roleRow] },
];

const stats: LocStats = { total: 2, translated: 1, missingEn: 1, sameAsRu: 0, coverage: 50 };

function renderView(over: Partial<Parameters<typeof AdminLocalizationView>[0]> = {}) {
  const props = {
    stats,
    groups,
    edits: {},
    editing: null,
    query: '',
    filter: 'all' as const,
    changedCount: 0,
    isSaving: false,
    onQueryChange: vi.fn(),
    onFilterChange: vi.fn(),
    onEditCell: vi.fn(),
    onCommitCell: vi.fn(),
    onCancelCell: vi.fn(),
    onSaveAll: vi.fn(),
    onDiscardAll: vi.fn(),
    ...over,
  };
  return { ...renderWithProviders(<AdminLocalizationView {...props} />), props };
}

describe('AdminLocalizationView', () => {
  it('рисует покрытие, статистику и строки секции', () => {
    renderView();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Проект · Альфа')).toBeInTheDocument();
    expect(screen.getByText('project.alpha.title')).toBeInTheDocument();
    expect(screen.getByText('Альфа')).toBeInTheDocument();
  });

  it('пустой EN помечается флагом и подсказкой', () => {
    renderView();
    // Флаг «нет EN» и подсказка отсутствия перевода.
    expect(screen.getAllByText('нет EN').length).toBeGreaterThan(0);
    expect(screen.getByText(/нет перевода/)).toBeInTheDocument();
  });

  it('клик по карандашу открывает правку ячейки', async () => {
    const { props } = renderView();
    const [firstPencil] = screen.getAllByTitle(/Редактировать RU/);
    if (firstPencil) await userEvent.click(firstPencil);
    expect(props.onEditCell).toHaveBeenCalledWith('project:p1:title', 'ru');
  });

  it('в режиме правки «Готово» фиксирует значение', async () => {
    const { props } = renderView({ editing: { rowId: 'project:p1:title', locale: 'ru' } });
    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Бета');
    await userEvent.click(screen.getByRole('button', { name: /Готово/ }));
    expect(props.onCommitCell).toHaveBeenCalledWith('project:p1:title', 'ru', 'Бета');
  });

  it('фильтр вызывает onFilterChange', async () => {
    const { props } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Нет EN' }));
    expect(props.onFilterChange).toHaveBeenCalledWith('missing');
  });

  it('панель сохранения появляется при изменениях и вызывает колбэки', async () => {
    const { props } = renderView({ changedCount: 3 });
    await userEvent.click(screen.getByRole('button', { name: /Сохранить 3/ }));
    expect(props.onSaveAll).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(props.onDiscardAll).toHaveBeenCalled();
  });

  it('пустой список показывает заглушку', () => {
    renderView({ groups: [] });
    expect(screen.getByText(/Ничего не найдено/)).toBeInTheDocument();
  });

  it('нет нарушений доступности', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});
