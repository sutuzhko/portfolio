import { supportedLanguages, type AppLanguage } from '@/shared/config';
import type { Settings } from '@/entities/settings';

interface SegmentedOptionDef {
  readonly value: string;
  readonly labelKey: string;
}

/** Поле-сегмент (язык/тема по умолчанию). */
export interface SegmentedFieldDef {
  readonly name: Extract<keyof Settings, 'defaultLang' | 'defaultTheme'>;
  readonly labelKey: string;
  readonly descKey: string;
  readonly options: readonly SegmentedOptionDef[];
}

/** Ключи булевых полей настроек (поведение + видимость секций/страниц). */
type BooleanSettingKey = Extract<
  keyof Settings,
  | 'consoleGlow'
  | 'showHighlights'
  | 'showAbout'
  | 'showStack'
  | 'showActivity'
  | 'showNow'
  | 'showFeatured'
  | 'showProjects'
  | 'showExperience'
  | 'showContact'
>;

/** Поле-тумблер (флаги поведения/видимости). */
export interface ToggleFieldDef {
  readonly name: BooleanSettingKey;
  readonly titleKey: string;
  readonly descKey: string;
}

/** Сегмент-переключатели настроек — язык и тема по умолчанию (по макету). */
export const SEGMENTED_FIELDS: readonly SegmentedFieldDef[] = [
  {
    name: 'defaultLang',
    labelKey: 'admin.settings.lang',
    descKey: 'admin.settings.langHint',
    options: [
      { value: 'ru', labelKey: 'admin.settings.langRu' },
      { value: 'en', labelKey: 'admin.settings.langEn' },
    ],
  },
  {
    name: 'defaultTheme',
    labelKey: 'admin.settings.theme',
    descKey: 'admin.settings.themeHint',
    options: [
      { value: 'dark', labelKey: 'admin.settings.themeDark' },
      { value: 'light', labelKey: 'admin.settings.themeLight' },
    ],
  },
];

/** Тумблеры поведения сайта (не про видимость секций). */
export const TOGGLE_FIELDS: readonly ToggleFieldDef[] = [
  {
    name: 'consoleGlow',
    titleKey: 'admin.settings.glowTitle',
    descKey: 'admin.settings.glowDesc',
  },
];

/**
 * Тумблеры видимости секций главной — каждый блок можно выключить из кабинета
 * (директива «любой блок настраивается»). Hero не выключается — идентичность.
 */
export const SECTION_TOGGLE_FIELDS: readonly ToggleFieldDef[] = [
  {
    name: 'showHighlights',
    titleKey: 'admin.settings.sections.highlightsTitle',
    descKey: 'admin.settings.sections.highlightsDesc',
  },
  {
    name: 'showAbout',
    titleKey: 'admin.settings.sections.aboutTitle',
    descKey: 'admin.settings.sections.aboutDesc',
  },
  {
    name: 'showStack',
    titleKey: 'admin.settings.sections.stackTitle',
    descKey: 'admin.settings.sections.stackDesc',
  },
  {
    name: 'showActivity',
    titleKey: 'admin.settings.activityTitle',
    descKey: 'admin.settings.activityDesc',
  },
  {
    name: 'showNow',
    titleKey: 'admin.settings.sections.nowTitle',
    descKey: 'admin.settings.sections.nowDesc',
  },
  {
    name: 'showFeatured',
    titleKey: 'admin.settings.sections.featuredTitle',
    descKey: 'admin.settings.sections.featuredDesc',
  },
];

/** Пресет акцента оформления: значение (для `data-accent`) + подпись + цвет свотча. */
export interface AccentOptionDef {
  readonly value: string;
  readonly labelKey: string;
  /** Цвет кружка-свотча в пикере (значение токена акцента, тёмная тема). */
  readonly color: string;
}

/** Пресеты акцента — совпадают с `[data-accent]` в токенах (корректны для обеих тем). */
export const ACCENT_OPTIONS: readonly AccentOptionDef[] = [
  { value: 'green', labelKey: 'admin.settings.accents.green', color: '#238636' },
  { value: 'blue', labelKey: 'admin.settings.accents.blue', color: '#1f6feb' },
  { value: 'bright', labelKey: 'admin.settings.accents.bright', color: '#3fb950' },
];

/** Язык сайта в списке доступных: код (из поддерживаемых платформой) + i18n-подписи. */
export interface LanguageFieldDef {
  readonly code: AppLanguage;
  readonly labelKey: string;
  readonly descKey: string;
}

/** Языки, которыми владелец управляет в кабинете (набор доступных). */
export const LANGUAGE_FIELDS: readonly LanguageFieldDef[] = supportedLanguages.map((code) => ({
  code,
  labelKey: `admin.settings.languages.${code}`,
  descKey: `admin.settings.languages.${code}Desc`,
}));

/**
 * Тумблеры видимости публичных страниц-роутов. Выключенная страница недоступна по
 * URL (404) и скрыта из навигации (консоль `cd`/`ls`, CTA главной).
 */
export const PAGE_TOGGLE_FIELDS: readonly ToggleFieldDef[] = [
  {
    name: 'showProjects',
    titleKey: 'admin.settings.pages.projectsTitle',
    descKey: 'admin.settings.pages.projectsDesc',
  },
  {
    name: 'showExperience',
    titleKey: 'admin.settings.pages.experienceTitle',
    descKey: 'admin.settings.pages.experienceDesc',
  },
  {
    name: 'showContact',
    titleKey: 'admin.settings.pages.contactTitle',
    descKey: 'admin.settings.pages.contactDesc',
  },
];
