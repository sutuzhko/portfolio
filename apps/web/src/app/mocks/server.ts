import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** MSW-сервер для node-окружения (Vitest). */
export const server = setupServer(...handlers);
