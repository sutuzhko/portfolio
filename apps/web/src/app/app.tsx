import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './providers';
import { router } from './router';

/** Корневой компонент: провайдеры оборачивают маршрутизатор. */
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
