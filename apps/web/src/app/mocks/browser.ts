import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Service worker MSW для браузера (dev/preview). */
export const worker = setupWorker(...handlers);
