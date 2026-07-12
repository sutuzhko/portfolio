import { useTranslation } from 'react-i18next';

import { useChangePasswordMutation, type ChangePassword } from '@/entities/session';
import { useGetSettingsQuery, useUpdateSettingsMutation, type Settings } from '@/entities/settings';
import { useToaster } from '@/features/toaster';
import { ErrorState } from '@sutuzhko/ui-kit';

import { AdminSettingsSkeleton } from './admin-settings-skeleton';
import { AdminSettingsView } from './admin-settings-view';
import { ChangePasswordForm } from './change-password-form';
import styles from './admin-settings.module.css';

/** Ошибка RTK Query с HTTP-статусом 401 (неверный текущий пароль). */
function isUnauthorized(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 401;
}

/**
 * Контейнер вкладки «Настройки»: настройки сайта (`PATCH /api/settings`) плюс
 * смена пароля администратора (`POST /api/auth/change-password`). Обе операции
 * показывают тост об успехе/ошибке.
 */
export function AdminSettings() {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const { data: settings, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const onSave = async (next: Settings): Promise<void> => {
    try {
      await updateSettings(next).unwrap();
      notify({ type: 'success', title: t('admin.saved') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  const onChangePassword = async (body: ChangePassword): Promise<void> => {
    try {
      await changePassword(body).unwrap();
      notify({ type: 'success', title: t('admin.account.changed') });
    } catch (error) {
      // 401 от бэкенда = неверный текущий пароль (а не «сессия истекла»).
      notify({
        type: 'error',
        title: isUnauthorized(error) ? t('admin.account.errors.wrong') : t('admin.saveError'),
      });
    }
  };

  if (isError) {
    return <ErrorState message={t('admin.loadError')} onRetry={() => void refetch()} />;
  }

  if (isLoading || settings === undefined) {
    return <AdminSettingsSkeleton />;
  }

  return (
    <div className={styles.stack}>
      <AdminSettingsView
        // Ремонтируем форму по содержимому: после сохранения рефетч возвращает новые
        // настройки → ключ меняется → форма пересобирается чистой (бар сохранения скрыт).
        key={JSON.stringify(settings)}
        settings={settings}
        isSaving={isSaving}
        onSave={(next) => void onSave(next)}
      />
      <ChangePasswordForm
        isSaving={isChangingPassword}
        onSubmit={(body) => void onChangePassword(body)}
      />
    </div>
  );
}
