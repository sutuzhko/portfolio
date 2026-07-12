import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { CreateExperience, ExperienceAdmin, UpdateExperience } from '@/entities/experience';
import type { TechnologyAdmin } from '@/entities/technology';
import { countDirtyFields } from '@/shared/lib';
import type { AppLanguage } from '@/shared/config';
import { SaveBar, ToggleField } from '@/shared/ui';
import { Button, Chip, Icon, Input, Textarea } from '@sutuzhko/ui-kit';

import {
  createExperienceSchema,
  emptyForm,
  experienceToForm,
  formToCreate,
  formToUpdate,
  type ExperienceFormValues,
} from '../model/experience-form';

import styles from './admin-experience.module.css';

export interface ExperienceFormProps {
  /** Редактируемая запись или `null` — создание новой. */
  readonly record: ExperienceAdmin | null;
  /** Технологии для мультиселекта (id + имя). */
  readonly technologies: readonly TechnologyAdmin[];
  readonly locale: AppLanguage;
  readonly isBusy: boolean;
  readonly onCreate: (body: CreateExperience) => void;
  readonly onUpdate: (id: string, body: UpdateExperience) => void;
  readonly onCancel: () => void;
}

/**
 * Форма места работы (создание/редактирование). Локализованные поля правятся в
 * активной локали; период задаётся месяцами (`type="month"`), «текущее место» —
 * тумблером. Технологии — мультиселект чипами по существующим записям стека.
 */
export function ExperienceForm({
  record,
  technologies,
  locale,
  isBusy,
  onCreate,
  onUpdate,
  onCancel,
}: ExperienceFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createExperienceSchema(t, locale), [t, locale]);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: record ? experienceToForm(record, locale) : emptyForm(),
  });

  const isCurrent = watch('current');

  const submit = (values: ExperienceFormValues): void => {
    if (record) onUpdate(record.id, formToUpdate(values, locale));
    else onCreate(formToCreate(values, locale));
  };

  return (
    <form className={styles.card} onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>
            {record ? t('admin.experience.editTitle') : t('admin.experience.newTitle')}
          </h2>
        </div>
        <Button variant="icon" onClick={onCancel} aria-label={t('admin.close')}>
          <Icon name="close" size={16} />
        </Button>
      </header>

      <div className={styles.body}>
        <div className={styles.grid2}>
          <Input
            label={t('admin.experience.company')}
            labelVariant="plain"
            font="sans"
            required
            error={errors.company?.message}
            {...register('company')}
          />
          <Input
            label={t('admin.experience.role')}
            labelVariant="plain"
            font="sans"
            required={locale === 'ru'}
            error={errors.role?.message}
            {...register('role')}
          />
          <Input
            label={t('admin.experience.startDate')}
            labelVariant="plain"
            type="month"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label={t('admin.experience.endDate')}
            labelVariant="plain"
            type="month"
            disabled={isCurrent}
            hint={isCurrent ? t('admin.experience.endDateCurrent') : undefined}
            {...register('endDate')}
          />
          <Input
            label={t('admin.experience.location')}
            labelVariant="plain"
            font="sans"
            {...register('location')}
          />
        </div>

        <Textarea
          label={t('admin.experience.bullets')}
          labelVariant="plain"
          font="sans"
          hint={t('admin.experience.bulletsHint')}
          rows={4}
          {...register('bullets')}
        />

        <Controller
          control={control}
          name="technologyIds"
          render={({ field }) => (
            <fieldset className={styles.techField}>
              <legend className={styles.inlineLabel}>{t('admin.experience.technologies')}</legend>
              <div className={styles.chips}>
                {technologies.map((tech) => {
                  const selected = field.value.includes(tech.id);
                  return (
                    <Chip
                      key={tech.id}
                      selected={selected}
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((id) => id !== tech.id)
                            : [...field.value, tech.id],
                        )
                      }
                    >
                      {tech.name}
                    </Chip>
                  );
                })}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="current"
          render={({ field }) => (
            <ToggleField
              title={t('admin.experience.current')}
              description={t('admin.experience.currentHint')}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <SaveBar
        visible={isDirty}
        isSaving={isBusy}
        saveType="submit"
        canSave={isDirty}
        count={countDirtyFields(dirtyFields)}
        onCancel={onCancel}
      />
    </form>
  );
}
