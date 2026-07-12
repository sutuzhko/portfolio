import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from 'react';

import { Icon } from '../icon';

import { clampPan, computeCrop, coverScale, type CropRect } from './crop-math';

import styles from './image-cropper.module.css';

interface Natural {
  readonly width: number;
  readonly height: number;
}

export interface ImageCropperProps {
  /** URL кадрируемого изображения (object URL или data URI). */
  readonly src: string;
  /** Сторона квадратного вьюпорта, px. */
  readonly viewport?: number;
  readonly minZoom?: number;
  readonly maxZoom?: number;
  /** Подпись ползунка масштаба (a11y). */
  readonly zoomLabel: string;
  /** Вызывается при каждом изменении кадра (загрузка/зум/сдвиг). */
  readonly onChange: (crop: CropRect) => void;
}

const ZOOM_STEP = 0.2;

/**
 * Кадрирование квадратной области изображения перетаскиванием и масштабом.
 * Картинка всегда покрывает вьюпорт; круглая маска показывает, как аватар будет
 * выглядеть скруглённым. Вычисления кадра — в чистом `crop-math`.
 */
export function ImageCropper({
  src,
  viewport = 280,
  minZoom = 1,
  maxZoom = 3,
  zoomLabel,
  onChange,
}: ImageCropperProps) {
  const [natural, setNatural] = useState<Natural | null>(null);
  const [zoom, setZoom] = useState(minZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null,
  );
  // Держим onChange в ref, чтобы не требовать мемоизации у родителя и не зацикливать эффект.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const scale = natural ? coverScale(natural.width, natural.height, viewport) * zoom : 1;
  const dispW = natural ? natural.width * scale : viewport;
  const dispH = natural ? natural.height * scale : viewport;

  const onImgLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget;
    const nat: Natural = { width: img.naturalWidth, height: img.naturalHeight };
    const s = coverScale(nat.width, nat.height, viewport) * zoom;
    // Центрируем картинку во вьюпорте.
    setPan({ x: (viewport - nat.width * s) / 2, y: (viewport - nat.height * s) / 2 });
    setNatural(nat);
  };

  // Держим смещение в границах при смене зума и отдаём актуальный кадр наружу.
  useEffect(() => {
    if (!natural) return;
    const clampedX = clampPan(pan.x, dispW, viewport);
    const clampedY = clampPan(pan.y, dispH, viewport);
    if (clampedX !== pan.x || clampedY !== pan.y) {
      setPan({ x: clampedX, y: clampedY });
      return;
    }
    onChangeRef.current(computeCrop(natural, viewport, { zoom, panX: pan.x, panY: pan.y }));
  }, [natural, zoom, pan, dispW, dispH, viewport]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!natural) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (drag === null) return;
    setPan({
      x: clampPan(drag.panX + (event.clientX - drag.startX), dispW, viewport),
      y: clampPan(drag.panY + (event.clientY - drag.startY), dispH, viewport),
    });
  };

  const endDrag = (): void => {
    dragRef.current = null;
  };

  // Меняет масштаб, удерживая центр вьюпорта на той же точке картинки (зум «в центр»,
  // а не в угол): смещение пересчитывается по отношению нового масштаба к старому.
  const applyZoom = (nextZoom: number): void => {
    const clamped = Math.min(maxZoom, Math.max(minZoom, nextZoom));
    const center = viewport / 2;
    const ratio = clamped / zoom;
    const nextScale = natural ? coverScale(natural.width, natural.height, viewport) * clamped : 1;
    const nextDispW = natural ? natural.width * nextScale : viewport;
    const nextDispH = natural ? natural.height * nextScale : viewport;
    setZoom(clamped);
    setPan({
      x: clampPan(center - (center - pan.x) * ratio, nextDispW, viewport),
      y: clampPan(center - (center - pan.y) * ratio, nextDispH, viewport),
    });
  };

  const stepZoom = (delta: number): void => applyZoom(Math.round((zoom + delta) * 100) / 100);

  return (
    <div className={styles.cropper}>
      <div
        className={styles.viewport}
        style={{ width: viewport, height: viewport }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className={styles.image}
          style={{ width: dispW, height: dispH, transform: `translate(${pan.x}px, ${pan.y}px)` }}
          onLoad={onImgLoad}
        />
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.mask} aria-hidden="true" />
      </div>

      <div className={styles.zoomRow}>
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label={`${zoomLabel} −`}
          onClick={() => stepZoom(-ZOOM_STEP)}
        >
          <Icon name="minus" size={16} />
        </button>
        <input
          type="range"
          className={styles.slider}
          min={minZoom}
          max={maxZoom}
          step={0.01}
          value={zoom}
          aria-label={zoomLabel}
          onChange={(event) => applyZoom(Number(event.target.value))}
        />
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label={`${zoomLabel} +`}
          onClick={() => stepZoom(ZOOM_STEP)}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}
