import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { LoginPageView } from './ui/login-page-view';

const meta = {
  title: 'Pages/Login',
  component: LoginPageView,
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  args: {
    onSubmit: fn(),
    isSubmitting: false,
    invalid: false,
    telegram: { url: 'https://t.me/sutuzhko', handle: '@sutuzhko' },
    isProfileLoading: false,
  },
  argTypes: {
    isSubmitting: { control: 'boolean', table: { category: 'Состояние' } },
    invalid: { control: 'boolean', table: { category: 'Состояние' } },
    isProfileLoading: { control: 'boolean', table: { category: 'Состояние' } },
    telegram: { control: false, table: { category: 'Данные' } },
    onSubmit: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof LoginPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Интерактивный пример',
};

/** Сервер отклонил учётные данные — под полями видна ошибка. */
export const Invalid: Story = {
  name: 'Неверные данные',
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Неверный логин или пароль');
  },
};

/** Идёт запрос входа — кнопка заблокирована. */
export const Submitting: Story = {
  name: 'Отправка',
  args: { isSubmitting: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Войти' })).toBeDisabled();
  },
};

/** Заполнение и отправка формы вызывает onSubmit с учётными данными. */
export const FilledSubmit: Story = {
  name: 'Отправка валидной формы',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('логин'), 'admin');
    await userEvent.type(canvas.getByLabelText('пароль'), 'admin12345');
    await userEvent.click(canvas.getByRole('button', { name: 'Войти' }));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

/** Пустая отправка показывает ошибки валидации. */
export const Validation: Story = {
  name: 'Валидация пустой формы',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Войти' }));
    await expect(await canvas.findByText('Введите логин')).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Профиль ещё грузится — ник поддержки под скелетоном. */
export const ContactLoading: Story = {
  name: 'Загрузка контакта',
  args: { telegram: undefined, isProfileLoading: true },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
