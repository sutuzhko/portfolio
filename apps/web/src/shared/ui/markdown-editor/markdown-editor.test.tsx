import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { MarkdownEditor, type MarkdownEditorProps } from './markdown-editor';

const baseProps: MarkdownEditorProps = {
  value: '',
  onChange: vi.fn(),
  renderPreview: (source) => <div data-testid="preview">{source}</div>,
  sourceLabel: 'MARKDOWN',
  splitLabel: 'split',
  previewLabel: 'preview',
  ariaLabel: 'Полное описание',
};

/** Управляемая обёртка — чтобы ввод реально менял значение. */
function ControlledEditor(overrides: Partial<MarkdownEditorProps> = {}) {
  const [value, setValue] = useState(overrides.value ?? '');
  return <MarkdownEditor {...baseProps} {...overrides} value={value} onChange={setValue} />;
}

describe('MarkdownEditor', () => {
  it('в режиме split показывает исходник и превью', () => {
    render(<MarkdownEditor {...baseProps} value="# Заголовок" />);
    expect(screen.getByRole('textbox', { name: 'Полное описание' })).toBeInTheDocument();
    expect(screen.getByTestId('preview')).toHaveTextContent('# Заголовок');
  });

  it('ввод обновляет значение и превью', async () => {
    render(<ControlledEditor />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Полное описание' }), 'Текст');
    expect(screen.getByTestId('preview')).toHaveTextContent('Текст');
  });

  it('переключение в preview скрывает исходник', async () => {
    render(<MarkdownEditor {...baseProps} value="тело" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'preview' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    // Превью остаётся видимым.
    expect(screen.getByTestId('preview')).toHaveTextContent('тело');
  });

  it('показывает ошибку валидации', () => {
    render(<MarkdownEditor {...baseProps} error="Заполните описание" />);
    expect(screen.getByText('Заполните описание')).toBeInTheDocument();
  });

  it('не имеет нарушений доступности', async () => {
    const { container } = render(<MarkdownEditor {...baseProps} value="текст" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
