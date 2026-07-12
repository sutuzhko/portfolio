import type { ProfileContact } from '@/entities/profile';

import { contactBadge, contactLabel, contactValue } from '../model/config';

import styles from './contact-links.module.css';

interface ContactCardProps {
  readonly contact: ProfileContact;
}

/** Карточка канала связи: бейдж-аббревиатура, название и значение-ссылка. */
export function ContactCard({ contact }: ContactCardProps) {
  const isExternal = !contact.url.startsWith('mailto:');

  return (
    <a
      className={styles.card}
      href={contact.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <span className={styles.badge} aria-hidden="true">
        {contactBadge(contact.icon)}
      </span>
      <span className={styles.body}>
        <span className={styles.label}>{contactLabel(contact.icon)}</span>
        <span className={styles.value}>{contactValue(contact.url)}</span>
      </span>
    </a>
  );
}
