import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { themes } from 'storybook/theming';

import '../src/styles/index.css';

/**
 * Витрина дизайн-системы. В отличие от Storybook приложения здесь НЕТ
 * Redux/i18n/роутера — UI Kit доменно-нейтрален и получает все тексты пропами.
 * Единственное, что нужно компонентам, — токены и переключатель темы,
 * работающий ровно так же, как у консюмера: атрибут `data-theme` на <html>.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' — нарушения видны в тест-UI; жёсткие проверки живут в unit-тестах (vitest-axe).
      test: 'todo',
    },
    docs: {
      theme: themes.dark,
      source: { dark: true },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
