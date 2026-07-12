import type { ProfileContact } from '@/entities/profile';
import { Skeleton } from '@sutuzhko/ui-kit';

import { ContactCard } from './contact-card';
import styles from './contact-links.module.css';

const SKELETON_COUNT = 4;

export interface ContactLinksProps {
  readonly contacts?: readonly ProfileContact[];
  readonly isLoading?: boolean;
}

/**
 * Сетка каналов связи (макет: CONTACT) — карточки-ссылки на Telegram, email,
 * GitHub и т.д. Презентационна: список приходит пропсом (из профиля), пока
 * грузится — скелетоны.
 */
export function ContactLinks({ contacts, isLoading }: ContactLinksProps) {
  if (isLoading || !contacts) {
    return (
      <div className={styles.grid} aria-busy="true" aria-live="polite">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} height="82px" radius="var(--radius-card)" />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {contacts.map((contact) => (
        <ContactCard key={`${contact.icon}:${contact.url}`} contact={contact} />
      ))}
    </div>
  );
}
