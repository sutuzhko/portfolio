import { iconRegistry, type IconName } from './icon-paths';

export interface IconProps {
  readonly name: IconName;
  /** Размер квадрата в px. По умолчанию 18 (размер иконок в интерфейсе). */
  readonly size?: number;
  readonly className?: string;
  /**
   * Доступная подпись. Если задана — иконка озвучивается скринридером (role=img);
   * иначе считается декоративной и скрывается (aria-hidden).
   */
  readonly title?: string;
}

/** Единая иконка из реестра дизайн-системы. Цвет наследуется через currentColor. */
export function Icon({ name, size = 18, className, title }: IconProps) {
  const { node, fill, viewBox = '0 0 24 24' } = iconRegistry[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={fill ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {node}
    </svg>
  );
}
