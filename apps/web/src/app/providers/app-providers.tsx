import type { ReactNode } from 'react';

import { ThemeProvider } from '@/features/theme-switch';
import { ToasterProvider } from '@/features/toaster';
import { ConsoleProvider } from '@/widgets/console';
import { RunnerProvider } from '@/widgets/runner';

import { WithI18n } from './with-i18n';
import { WithStore } from './with-store';

interface AppProvidersProps {
  readonly children: ReactNode;
}

/** Композиция всех глобальных провайдеров приложения. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <WithStore>
      <WithI18n>
        <ThemeProvider>
          <ToasterProvider>
            <ConsoleProvider>
              <RunnerProvider>{children}</RunnerProvider>
            </ConsoleProvider>
          </ToasterProvider>
        </ThemeProvider>
      </WithI18n>
    </WithStore>
  );
}
