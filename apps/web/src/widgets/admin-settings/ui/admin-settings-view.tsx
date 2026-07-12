import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Settings } from '@/entities/settings';
import { cn, countDirtyFields } from '@/shared/lib';
import { SaveBar, SettingCard, ToggleField } from '@/shared/ui';
import { Input, Segmented, type SegmentedOption } from '@sutuzhko/ui-kit';

import {
  ACCENT_OPTIONS,
  LANGUAGE_FIELDS,
  PAGE_TOGGLE_FIELDS,
  SECTION_TOGGLE_FIELDS,
  SEGMENTED_FIELDS,
  TOGGLE_FIELDS,
  type ToggleFieldDef,
} from '../model/settings-fields';

import styles from './admin-settings.module.css';

export interface AdminSettingsViewProps {
  readonly settings: Settings;
  readonly isSaving: boolean;
  readonly onSave: (settings: Settings) => void;
}

/**
 * Форма «Настройки приложения» (`PATCH /api/settings`) по макету: название сайта и
 * пароль раздела Interview, язык/тема по умолчанию (сегменты) и тумблеры поведения
 * (свечение консоли, блок активности). Презентационная — сохранение уходит колбэком.
 */
export function AdminSettingsView({ settings, isSaving, onSave }: AdminSettingsViewProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<Settings>({ defaultValues: settings });

  const renderToggle = (fieldDef: ToggleFieldDef) => (
    <Controller
      key={fieldDef.name}
      control={control}
      name={fieldDef.name}
      render={({ field }) => (
        <ToggleField
          title={t(fieldDef.titleKey)}
          description={t(fieldDef.descKey)}
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      )}
    />
  );

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(onSave)(event)} noValidate>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('admin.settings.title')}</h2>
          <span className={styles.endpoint}>PATCH /api/settings</span>
        </div>
      </header>

      <div className={styles.body}>
        <Input
          label={t('admin.settings.siteTitle')}
          labelVariant="plain"
          required
          font="mono"
          hint={t('admin.settings.siteTitleHint')}
          error={errors.siteTitle?.message}
          {...register('siteTitle', { required: t('admin.settings.required') })}
        />

        <div className={styles.field}>
          <span className={styles.label}>{t('admin.settings.defaultsTitle')}</span>
          <div className={styles.cardGrid}>
            {SEGMENTED_FIELDS.map((fieldDef) => {
              const options: SegmentedOption<string>[] = fieldDef.options.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }));
              return (
                <Controller
                  key={fieldDef.name}
                  control={control}
                  name={fieldDef.name}
                  render={({ field }) => (
                    <SettingCard title={t(fieldDef.labelKey)} description={t(fieldDef.descKey)}>
                      <Segmented
                        options={options}
                        value={field.value}
                        onChange={field.onChange}
                        aria-label={t(fieldDef.labelKey)}
                      />
                    </SettingCard>
                  )}
                />
              );
            })}
            <Controller
              control={control}
              name="accentColor"
              render={({ field }) => (
                <SettingCard
                  title={t('admin.settings.accent')}
                  description={t('admin.settings.accentHint')}
                >
                  <div
                    className={styles.accentSwatches}
                    role="radiogroup"
                    aria-label={t('admin.settings.accent')}
                  >
                    {ACCENT_OPTIONS.map((accent) => (
                      <button
                        key={accent.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === accent.value}
                        aria-label={t(accent.labelKey)}
                        title={t(accent.labelKey)}
                        className={cn(
                          styles.accentSwatch,
                          field.value === accent.value && styles.accentSwatchActive,
                        )}
                        style={{ background: accent.color }}
                        onClick={() => field.onChange(accent.value)}
                      />
                    ))}
                  </div>
                </SettingCard>
              )}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>{t('admin.settings.languages.title')}</span>
          <span className={styles.sectionsHint}>{t('admin.settings.languages.hint')}</span>
          <Controller
            control={control}
            name="availableLanguages"
            render={({ field }) => {
              // Устойчивость к настройкам без поля (старый бэк без миграции): не падаем.
              const selected = field.value ?? [];
              return (
                <div className={styles.cardGrid}>
                  {LANGUAGE_FIELDS.map((language) => {
                    const enabled = selected.includes(language.code);
                    // Хотя бы один язык должен остаться — последний включённый не выключить.
                    const isLastEnabled = enabled && selected.length <= 1;
                    return (
                      <ToggleField
                        key={language.code}
                        title={t(language.labelKey)}
                        description={t(language.descKey)}
                        checked={enabled}
                        disabled={isLastEnabled}
                        onCheckedChange={(next) =>
                          field.onChange(
                            next
                              ? [...selected, language.code]
                              : selected.filter((code) => code !== language.code),
                          )
                        }
                      />
                    );
                  })}
                </div>
              );
            }}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>{t('admin.settings.behaviorTitle')}</span>
          <div className={styles.cardGrid}>{TOGGLE_FIELDS.map(renderToggle)}</div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>{t('admin.settings.sections.title')}</span>
          <span className={styles.sectionsHint}>{t('admin.settings.sections.hint')}</span>
          <div className={styles.cardGrid}>{SECTION_TOGGLE_FIELDS.map(renderToggle)}</div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>{t('admin.settings.pages.title')}</span>
          <span className={styles.sectionsHint}>{t('admin.settings.pages.hint')}</span>
          <div className={styles.cardGrid}>{PAGE_TOGGLE_FIELDS.map(renderToggle)}</div>
        </div>
      </div>

      <SaveBar
        visible={isDirty}
        isSaving={isSaving}
        saveType="submit"
        count={countDirtyFields(dirtyFields)}
        onCancel={() => reset()}
      />
    </form>
  );
}
