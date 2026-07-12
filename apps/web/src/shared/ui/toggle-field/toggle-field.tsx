import { Toggle, type IconName } from '@sutuzhko/ui-kit';

import { SettingCard } from '../setting-card';

export interface ToggleFieldProps {
  readonly title: string;
  /** Пояснение под заголовком (опционально). */
  readonly description?: string;
  /** Ведущая иконка (опционально, напр. `eye-off` для «скрыт»). */
  readonly icon?: IconName;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly disabled?: boolean;
}

/**
 * Карточка-тумблер: `SettingCard` с переключателем справа. Единый вид всех
 * тумблеров админки. Презентационный.
 */
export function ToggleField({
  title,
  description,
  icon,
  checked,
  onCheckedChange,
  disabled,
}: ToggleFieldProps) {
  return (
    <SettingCard title={title} description={description} icon={icon}>
      <Toggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
      />
    </SettingCard>
  );
}
