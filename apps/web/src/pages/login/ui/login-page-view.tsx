import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { LoginCredentials } from '@/entities/session';
import { Button, Heading, Icon, Input, Skeleton, Text } from '@sutuzhko/ui-kit';

import { createLoginSchema, type LoginFormValues } from '../model/login-schema';
import type { TelegramContact } from '../model/telegram-contact';

import styles from './login-page.module.css';

export interface LoginPageViewProps {
  readonly onSubmit: (credentials: LoginCredentials) => void;
  /** Идёт запрос входа — блокируем повторную отправку. */
  readonly isSubmitting: boolean;
  /** Сервер отклонил учётные данные (неверный логин/пароль). */
  readonly invalid: boolean;
  /** Telegram-контакт владельца (с бэкенда) для строки «нет доступа?». */
  readonly telegram?: TelegramContact;
  /** Профиль ещё грузится — ник под скелетоном. */
  readonly isProfileLoading?: boolean;
}

/**
 * Презентационный экран входа (макет `~/login`): слева форма, справа
 * декоративный терминал. Валидация — React Hook Form + Zod (сообщения из i18n).
 * Отправка и результат приходят пропами, поэтому вид управляем и тестируется.
 */
export function LoginPageView({
  onSubmit,
  isSubmitting,
  invalid,
  telegram,
  isProfileLoading = false,
}: LoginPageViewProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <main className={styles.page}>
      <p className={styles.breadcrumb}>{t('login.breadcrumb')}</p>

      <div className={styles.band}>
        <div className={styles.grid}>
          <form
            className={styles.form}
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            noValidate
          >
            <header className={styles.head}>
              <span className={styles.lock} aria-hidden="true">
                <Icon name="lock" size={26} />
              </span>
              <div className={styles.headText}>
                <span className={styles.badge}>{t('login.badge')}</span>
                <Heading level="h1" className={styles.title}>
                  {t('login.title')}
                </Heading>
                <span className={styles.private}>{t('login.subtitle')}</span>
              </div>
            </header>

            <Text as="p" tone="muted" className={styles.hint}>
              {t('login.hint')}
            </Text>

            <div className={styles.fields}>
              <Input
                label={t('login.username')}
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
              />
              <Input
                label={t('login.password')}
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {invalid ? (
              <p className={styles.invalid} role="alert">
                {t('login.invalid')}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className={styles.submit}
              disabled={isSubmitting}
            >
              {t('login.submit')}
            </Button>

            {isProfileLoading || telegram ? (
              <Text as="p" tone="dim" size="small" className={styles.noAccess}>
                {t('login.noAccess')}{' '}
                {telegram ? (
                  <a
                    className={styles.noAccessLink}
                    href={telegram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {telegram.handle}
                  </a>
                ) : (
                  <Skeleton width="88px" height="1em" className={styles.handleSkeleton} />
                )}
              </Text>
            ) : null}
          </form>

          <aside className={styles.terminal} aria-hidden="true">
            <div className={styles.termHead}>
              <span className={styles.dot} data-color="red" />
              <span className={styles.dot} data-color="amber" />
              <span className={styles.dot} data-color="green" />
              <span className={styles.termTitle}>{t('login.terminal.title')}</span>
            </div>
            <div className={styles.termBody}>
              <p className={styles.termLine}>
                <span className={styles.termUser}>visitor@portfolio</span>
                <span className={styles.termSign}>:~$</span> {t('login.terminal.ssh')}
              </p>
              <p className={styles.termMuted}>{t('login.terminal.connecting')}</p>
              <p className={styles.termOk}>{t('login.terminal.secured')}</p>
              <p className={styles.termLine}>
                <span className={styles.termUser}>auth</span>
                <span className={styles.termSign}>:~$</span> {t('login.terminal.login')}
              </p>
              <p className={styles.termMuted}>{t('login.terminal.prompt')}</p>
              <p className={styles.termLine}>
                <span className={styles.termUser}>auth</span>
                <span className={styles.termSign}>:~$</span> <span className={styles.caret} />
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
