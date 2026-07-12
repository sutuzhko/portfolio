export { settingsApi, useGetSettingsQuery, useUpdateSettingsMutation } from './api/settings-api';
export type { Settings, UpdateSettings } from './model/types';
export { usePageVisibility, isPathEnabled, type PageVisibility } from './model/page-visibility';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.
