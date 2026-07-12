import { expect, test } from '@playwright/test';

/**
 * Сквозной сценарий, ради которого существует весь стек: гость изучает портфолио,
 * владелец входит в закрытую CRM, правит контент — и правка сразу видна на публичном сайте.
 *
 * Прогоняется против прод-сборки с MSW-моками: их состояние живёт в странице, поэтому
 * между кабинетом и главной ходим SPA-навигацией, без полной перезагрузки (она сбросила бы мок).
 */

const CREDENTIALS = { username: 'admin', password: 'admin12345' };

const NEW_ROLE = 'Staff Frontend Engineer';

test('гость смотрит проект, владелец правит профиль в CRM и видит изменение на сайте', async ({
  page,
}) => {
  // --- 1. Гость: главная → список проектов → карточка проекта ---
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Богдан Сутужко' })).toBeVisible();

  await page.getByRole('button', { name: 'Проекты' }).first().click();
  await expect(page).toHaveURL(/\/projects$/);

  await page
    .getByRole('button', { name: /Procharity/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/procharity$/);
  await expect(page.getByRole('heading', { name: 'Procharity' })).toBeVisible();

  // --- 2. Закрытый раздел уводит гостя на логин ---
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole('textbox', { name: /логин/i }).fill(CREDENTIALS.username);
  await page.getByLabel(/пароль/i).fill(CREDENTIALS.password);
  await page.getByRole('button', { name: 'Войти' }).click();

  // После входа возвращает на исходный маршрут (`state.from`), а кабинет
  // сам открывает вкладку по умолчанию — профиль в активной локали.
  await expect(page).toHaveURL(/\/admin\/profile\/ru$/);

  // --- 3. Правим роль в кабинете ---
  const role = page.getByRole('textbox', { name: 'Роль' });
  await expect(role).toHaveValue('Fullstack-разработчик');
  await role.fill(NEW_ROLE);
  await page.getByRole('button', { name: 'Сохранить' }).click();

  // Тост подтверждает сохранение.
  await expect(page.getByText('Сохранено')).toBeVisible();

  // --- 4. Правка видна на публичной главной (SPA-навигация, мок сохраняет состояние) ---
  await page.getByRole('link', { name: 'На главную' }).click();
  await expect(page).toHaveURL(new RegExp(`${page.url().split('/').slice(0, 3).join('/')}/?$`));

  // Новая роль пришла из CRM через публичный `GET /profile` — цикл замкнулся.
  await expect(page.getByText(NEW_ROLE).first()).toBeVisible();

  // Старое звание всё ещё встречается в тексте «обо мне»: это отдельное поле
  // (`bioMarkdown`), его не редактировали. Проверяем, что обновилась именно
  // подпись героя, а не «всё, где есть эта строка».
  await expect(page.getByText(`@sutuzhko`).first()).toBeVisible();
  await expect(page.locator('h1').locator('..')).toContainText(NEW_ROLE);
});
