import { expect, test } from '@playwright/test';

test('главная отображает профиль из API', async ({ page }) => {
  await page.goto('/');

  // Имя локализовано бэкендом: в русской локали — кириллицей.
  await expect(page.getByRole('heading', { name: 'Богдан Сутужко' })).toBeVisible();
});

test('переключение темы меняет data-theme на <html>', async ({ page }) => {
  // Тема уважает системное предпочтение, поэтому задаём его явно (тёмное) —
  // иначе Chromium по умолчанию отдаёт light и старт будет светлым.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /светлую тему|light theme/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('неизвестный маршрут показывает 404', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(page.getByText('404')).toBeVisible();
});
