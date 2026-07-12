import type { Preview, Story } from '@storybook/react-vite';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { withThemeByClassName } from '@storybook/addon-themes';
import { setupI18n, languageStorageKey } from '../src/shared/config';
import { makeStore } from '../src/shared/store';
import { ThemeProvider } from '../src/features/theme-switch';
import { ToasterProvider } from '../src/features/toaster';
import { ConsoleProvider } from '../src/widgets/console';
import { RunnerProvider } from '../src/widgets/runner';
import { themes } from 'storybook/theming';
import '../src/app/styles/index.css';

// import { themes, ensure } from 'storybook/theming';

// Детерминированный основной язык (ru): сеем localStorage до языкового детектора,
// иначе в headless-Chromium подхватывается navigator=en и подписи «уезжают».
localStorage.setItem(languageStorageKey, 'ru');

const i18n = setupI18n();
// Общий store для историй: виджеты с RTK-хуками (например, RootLayout → useProfile)
// не падают. Без MSW запросы не резолвятся — истории показывают состояние загрузки.
const store = makeStore();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // backgrounds: { disable: true },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    docs: {
      theme: themes.dark,
      // Блоки <Source /> по умолчанию подсвечивают код светлой темой —
      // выравниваем их с тёмной темой доков на уровне всего Storybook.
      source: {
        dark: true,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'dark',
    }),
    // ThemeProvider нужен виджетам, использующим useTheme (например, ThemeSwitch).
    // Он же синхронизирует <html data-theme>, от которого зависят токены.
    (Story: Story) => (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <ToasterProvider>
              <ConsoleProvider>
                <RunnerProvider>
                  <Story />
                </RunnerProvider>
              </ConsoleProvider>
            </ToasterProvider>
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    ),
  ],
};

export default preview;
