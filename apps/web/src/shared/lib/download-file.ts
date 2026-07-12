/**
 * Инициирует скачивание файла по ссылке: создаёт временный `<a download>`,
 * кликает по нему и убирает из DOM. Если ссылки нет (например, профиль ещё
 * грузится и `cvUrl` не пришёл) — тихо ничего не делает.
 *
 * Атрибут `download` работает для same-origin ссылок (наши файлы отдаются
 * с `/uploads/…`), поэтому браузер именно скачивает файл, а не открывает.
 */
export function downloadFile(url: string | null | undefined, filename?: string): void {
  if (!url) return;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename ?? '';
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
