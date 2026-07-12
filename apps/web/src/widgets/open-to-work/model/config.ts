import type { AvailabilityStatus } from '@/entities/profile';

/**
 * Сегмент ключа для статуса доступности (макет: NOW / OPEN TO WORK). Один и тот же
 * ключ ведёт и к тексту в i18n (`home.now.<key>.{title,desc}`), и к CSS-модификатору
 * точки-индикатора (цвет и пульсация — в стилях, где им и место).
 */
export const AVAILABILITY_KEY: Record<AvailabilityStatus, 'active' | 'open' | 'notLooking'> = {
  ACTIVE: 'active',
  OPEN: 'open',
  NOTLOOKING: 'notLooking',
};
