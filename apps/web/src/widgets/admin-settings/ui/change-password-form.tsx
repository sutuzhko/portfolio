import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { ChangePassword } from '@/entities/session';
import { Button, Icon, Input } from '@sutuzhko/ui-kit';

import styles from './admin-settings.module.css';

export interface ChangePasswordFormProps {
  readonly isSaving: boolean;
  /** Отправка смены пароля. Успех/ошибку показывает контейнер тостом. */
  readonly onSubmit: (body: ChangePassword) => void;
}

function createSchema(t: ReturnType<typeof useTranslation>['t']) {
  return z
    .object({
      currentPassword: z.string().min(1, t('admin.account.errors.current')),
      newPassword: z.string().min(8, t('admin.account.errors.short')),
      confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('admin.account.errors.mismatch'),
    });
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

/**
 * Форма смены пароля администратора (`POST /api/auth/change-password`): текущий
 * пароль + новый + подтверждение. Презентационная — сохранение уходит колбэком,
 * успех/ошибку (в т.ч. неверный текущий пароль) показывает контейнер.
 */
export function ChangePasswordForm({ isSaving, onSubmit }: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = (values: FormValues): void => {
    onSubmit({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    reset();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('admin.account.title')}</h2>
          <span className={styles.endpoint}>POST /api/auth/change-password</span>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving || !isDirty}
          className={styles.save}
        >
          <Icon name="lock" size={14} />
          {t('admin.account.submit')}
        </Button>
      </header>

      <div className={styles.body}>
        <p className={styles.hint}>{t('admin.account.hint')}</p>
        <div className={styles.grid}>
          <Input
            type="password"
            label={t('admin.account.current')}
            labelVariant="plain"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            type="password"
            label={t('admin.account.new')}
            labelVariant="plain"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            type="password"
            label={t('admin.account.confirm')}
            labelVariant="plain"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>
    </form>
  );
}
