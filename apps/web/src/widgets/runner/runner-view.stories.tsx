import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { RunnerView } from './ui/runner-view';

// Самодостаточная «начинка» для демонстрации без сети: рисуем плитку 2048.
const demoEmbed =
  'data:text/html,' +
  encodeURIComponent(
    '<body style="margin:0;display:grid;place-items:center;height:100vh;font-family:monospace;background:#faf8ef;color:#776e65"><div style="font-size:64px;font-weight:700">2048</div></body>',
  );

const meta = {
  title: 'Widgets/Runner',
  component: RunnerView,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    project: { title: 'Игра: 2048', embedUrl: demoEmbed },
    windowState: 'normal',
    onClose: fn(),
    onMinimize: fn(),
    onToggleMaximize: fn(),
    onRestore: fn(),
    onError: fn(),
  },
  argTypes: {
    windowState: {
      control: 'radio',
      options: ['normal', 'maximized', 'minimized'],
      table: { category: 'Состояние' },
    },
    project: { control: 'object', table: { category: 'Данные' } },
    onClose: { control: false, table: { disable: true } },
    onMinimize: { control: false, table: { disable: true } },
    onToggleMaximize: { control: false, table: { disable: true } },
    onRestore: { control: false, table: { disable: true } },
    onError: { control: false, table: { disable: true } },
    loadTimeoutMs: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof RunnerView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Запущенный проект встроен через iframe в оконный «хром». */
export const Running: Story = {
  name: 'Запущен',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog', { name: /Игра: 2048/ })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Свернуть проект' }));
    await expect(args.onMinimize).toHaveBeenCalled();
  },
};

/** Зелёный свет разворачивает окно на весь экран. */
export const Maximized: Story = {
  name: 'На всю ширину',
  args: { windowState: 'maximized' },
};

/** Жёлтый свет прячет проект в компактную пилюлю трея. */
export const Minimized: Story = {
  name: 'Свёрнут в трей',
  args: { windowState: 'minimized' },
  play: async ({ canvasElement }) => {
    // Пилюля порталится в body — ищем по всему документу, а не по canvas.
    const body = within(document.body);
    await expect(body.getByRole('button', { name: 'Игра: 2048' })).toBeInTheDocument();
    await expect(within(canvasElement).queryByRole('dialog')).not.toBeInTheDocument();
  },
};

/**
 * Проект не загрузился (переехал/офлайн): вместо вечного спиннера — bash-подобная
 * ошибка в окне, а контейнер шлёт тост. Короткий `loadTimeoutMs` + пустой URL,
 * чтобы состояние наступало сразу, без сети.
 */
export const Failed: Story = {
  name: 'Не удалось запустить',
  args: {
    // 192.0.2.0/24 — зарезервированная TEST-NET, никуда не маршрутизируется:
    // onLoad не сработает, наступит таймаут → состояние ошибки.
    project: { title: 'Игра: 2048', embedUrl: 'https://192.0.2.1/' },
    loadTimeoutMs: 50,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent(/не удалось запустить/i);
    // Уведомление шлёт passive-эффект — он выполняется уже после отрисовки панели.
    await waitFor(() => expect(args.onError).toHaveBeenCalledTimes(1));
  },
};

/** Мобильная раскладка. */
export const Mobile: Story = {
  name: 'Мобильная',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
