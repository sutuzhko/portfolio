export {
  languageApi,
  useGetLanguagesQuery,
  useGetLanguagesAdminQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
} from './api/language-api';
export { useLanguages } from './model/use-languages';
export type {
  Language,
  LanguageAdmin,
  CreateLanguage,
  UpdateLanguage,
  LocalizedText,
  LocalizedTextInput,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.
