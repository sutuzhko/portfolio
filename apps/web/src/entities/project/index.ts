export {
  projectApi,
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectsAdminQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
} from './api/project-api';
export { useProjects } from './model/use-projects';
export { useProject } from './model/use-project';
export { ProjectBackground } from './ui/project-background';
export { ProjectTile, ProjectTileSkeleton, type ProjectTileData } from './ui/project-tile';
export type {
  ProjectListItem,
  ProjectContributor,
  ProjectDetail,
  ProjectLink,
  ProjectMedia,
  ProjectMediaAdmin,
  UploadGalleryImage,
  ProjectAdmin,
  CreateProject,
  UpdateProject,
  ProjectLinkInput,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.
