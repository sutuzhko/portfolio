import { describe, expect, it } from 'vitest';

import { MAX_GALLERY_FILE_SIZE, MAX_GALLERY_ITEMS, partitionGalleryFiles } from './gallery';

/** Файл с заданным размером без реальной аллокации. */
function fileOfSize(size: number): File {
  const file = new File(['x'], 'f.png', { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

const small = (): File => fileOfSize(1000);
const big = (): File => fileOfSize(MAX_GALLERY_FILE_SIZE + 1);

describe('partitionGalleryFiles', () => {
  it('пропускает все файлы, когда есть слоты и размер в норме', () => {
    const files = [small(), small()];
    const result = partitionGalleryFiles(files, 0);
    expect(result.accepted).toHaveLength(2);
    expect(result.tooLarge).toHaveLength(0);
    expect(result.overflow).toHaveLength(0);
  });

  it('отсекает слишком большие файлы (не тратя слот)', () => {
    const good = small();
    const result = partitionGalleryFiles([good, big()], 0);
    expect(result.accepted).toEqual([good]);
    expect(result.tooLarge).toHaveLength(1);
    expect(result.overflow).toHaveLength(0);
  });

  it('лишние сверх оставшихся слотов уходят в overflow', () => {
    // Уже 9 из 10 → влезает только 1, второй в overflow.
    const first = small();
    const result = partitionGalleryFiles([first, small()], MAX_GALLERY_ITEMS - 1);
    expect(result.accepted).toEqual([first]);
    expect(result.overflow).toHaveLength(1);
  });

  it('при заполненной галерее ничего не принимает', () => {
    const result = partitionGalleryFiles([small(), small()], MAX_GALLERY_ITEMS);
    expect(result.accepted).toHaveLength(0);
    expect(result.overflow).toHaveLength(2);
  });
});
