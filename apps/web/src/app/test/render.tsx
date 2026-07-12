import { useState, type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/features/theme-switch';
import { ToasterProvider } from '@/features/toaster';
import { setupI18n } from '@/shared/config';
import { makeStore } from '@/shared/store';
import { ConsoleProvider } from '@/widgets/console';
import { RunnerProvider } from '@/widgets/runner';

function Providers({ children }: { children: ReactNode }) {
  // Свежий store на каждый рендер — кэш RTK Query не протекает между тестами.
  const [store] = useState(makeStore);
  const i18n = setupI18n();

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <ToasterProvider>
            <ConsoleProvider>
              <RunnerProvider>{children}</RunnerProvider>
            </ConsoleProvider>
          </ToasterProvider>
        </ThemeProvider>
      </I18nextProvider>
    </Provider>
  );
}

/** Рендерит компонент со всеми глобальными провайдерами приложения. */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Providers, ...options });
}
