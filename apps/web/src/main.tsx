import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App, enableMocking } from '@/app';

import './app/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Корневой элемент #root не найден');
}

// Сначала поднимаем моки (если включены), затем монтируем приложение —
// иначе первые запросы успеют уйти мимо MSW.
void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
