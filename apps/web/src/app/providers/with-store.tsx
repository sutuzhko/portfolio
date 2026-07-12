import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { store } from '@/shared/store';

/** Подключает Redux-store ко всему дереву. */
export function WithStore({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
