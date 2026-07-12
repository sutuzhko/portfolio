/** Лимиты галереи проекта. Держим в синхроне с бэком (`media.service`/`media.controller`). */
export const MAX_GALLERY_ITEMS = 10;
export const MAX_GALLERY_FILE_SIZE = 8 * 1024 * 1024; // 8 МБ — как `MAX_FILE_SIZE` на бэке

/** Разбор выбранных файлов по трём корзинам. */
export interface GalleryPickResult {
  /** Пройдут по размеру и влезут в оставшиеся слоты — их и грузим. */
  readonly accepted: readonly File[];
  /** Превышают лимит размера — пропускаем (не тратя слот). */
  readonly tooLarge: readonly File[];
  /** По размеру ок, но не влезли в оставшиеся слоты (лимит 10). */
  readonly overflow: readonly File[];
}

/**
 * Чистая проверка выбранных для загрузки файлов: сперва отсекаем слишком большие
 * (они не должны занимать слот), затем берём столько, сколько осталось до лимита.
 */
export function partitionGalleryFiles(
  files: readonly File[],
  currentCount: number,
  maxItems: number = MAX_GALLERY_ITEMS,
  maxSize: number = MAX_GALLERY_FILE_SIZE,
): GalleryPickResult {
  const remaining = Math.max(0, maxItems - currentCount);
  const tooLarge: File[] = [];
  const withinSize: File[] = [];
  for (const file of files) {
    if (file.size > maxSize) tooLarge.push(file);
    else withinSize.push(file);
  }
  return {
    accepted: withinSize.slice(0, remaining),
    overflow: withinSize.slice(remaining),
    tooLarge,
  };
}
