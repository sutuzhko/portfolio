import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { ResumeBanner } from './ui/resume-banner';

const cvUrl = '/uploads/cv/Bogdan_Sutuzhko_CV.pdf';

describe('ResumeBanner', () => {
  it('рендерит заголовок и кнопку скачивания', () => {
    renderWithProviders(<ResumeBanner cvUrl={cvUrl} />);
    expect(screen.getByRole('button', { name: /Скачать резюме/ })).toBeInTheDocument();
  });

  it('вызывает onDownload по клику', async () => {
    const onDownload = vi.fn();
    renderWithProviders(<ResumeBanner cvUrl={cvUrl} onDownload={onDownload} />);
    await userEvent.click(screen.getByRole('button', { name: /Скачать резюме/ }));
    expect(onDownload).toHaveBeenCalledOnce();
  });

  it('показывает скелетон, пока профиль грузится', () => {
    const { container } = renderWithProviders(<ResumeBanner isLoading />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('не рендерит баннер, если резюме нет (null)', () => {
    const { container } = renderWithProviders(<ResumeBanner cvUrl={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<ResumeBanner cvUrl={cvUrl} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
