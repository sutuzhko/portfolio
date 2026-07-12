import { useTranslation } from 'react-i18next';

import {
  useAddContactMutation,
  useGetProfileAdminQuery,
  useUpdateContactMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCvMutation,
  type AdminContactLink,
  type AvatarCrop,
  type UpdateProfile,
} from '@/entities/profile';
import { useToaster } from '@/features/toaster';
import type { AppLanguage } from '@/shared/config';
import { ErrorState } from '@sutuzhko/ui-kit';

import { AdminProfileView, type ProfileContacts } from './admin-profile-view';
import { AdminProfileSkeleton } from './admin-profile-skeleton';

/**
 * Контейнер вкладки «Профиль»: тянет админ-профиль (обе локали), сохраняет через
 * `PATCH /api/profile` с тостом об успехе/ошибке. Инвалидация тегов обновляет и
 * публичные экраны.
 */
export interface AdminProfileProps {
  /** Локаль редактирования из маршрута. */
  readonly locale: AppLanguage;
}

export function AdminProfile({ locale }: AdminProfileProps) {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const { data: profile, isLoading, isError, refetch } = useGetProfileAdminQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [uploadCv] = useUploadCvMutation();
  const [addContact] = useAddContactMutation();
  const [updateContact] = useUpdateContactMutation();

  const onUploadAvatar = async (file: File, crop: AvatarCrop): Promise<string> => {
    const { avatarPhotoUrl } = await uploadAvatar({ file, crop }).unwrap();
    return avatarPhotoUrl;
  };

  const onUploadCv = async (file: File): Promise<string> => {
    const { url } = await uploadCv(file).unwrap();
    return url;
  };

  // Синк одного контакта по иконке: PATCH существующего или POST нового; пустой
  // URL не трогаем (удаление контактов — в отдельном UI, вне профиля).
  const syncContact = async (
    contacts: readonly AdminContactLink[],
    icon: string,
    url: string,
  ): Promise<void> => {
    const existing = contacts.find((contact) => contact.icon === icon);
    if (existing) {
      if (url && url !== existing.url) {
        await updateContact({ id: existing.id, body: { url } }).unwrap();
      }
    } else if (url) {
      await addContact({ icon, url }).unwrap();
    }
  };

  const onSave = async (update: UpdateProfile | null, contacts: ProfileContacts): Promise<void> => {
    try {
      // PATCH /profile — только если менялись поля профиля; контакты — по каждому URL.
      if (update !== null) await updateProfile(update).unwrap();
      if (profile) {
        await syncContact(profile.contacts, 'telegram', contacts.telegram);
        await syncContact(profile.contacts, 'github', contacts.github);
      }
      notify({ type: 'success', title: t('admin.saved') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  if (isError) {
    return <ErrorState message={t('admin.loadError')} onRetry={() => void refetch()} />;
  }

  if (isLoading || profile === undefined) {
    return <AdminProfileSkeleton />;
  }

  return (
    <AdminProfileView
      // Ремонтируем форму при смене языка И после сохранения (рефетч меняет профиль →
      // ключ по содержимому пересобирает форму чистой, скрывая бар сохранения).
      key={`${locale}:${JSON.stringify(profile)}`}
      profile={profile}
      locale={locale}
      isSaving={isSaving}
      onSave={(update, contacts) => void onSave(update, contacts)}
      onUploadAvatar={onUploadAvatar}
      onUploadCv={onUploadCv}
    />
  );
}
