// Public surface of the API contract shared by frontend and backend.
//
// Once the API exposes endpoints, run `pnpm contract:generate` from the repo root.
// That writes `openapi.json` (from the live NestJS Swagger doc) and regenerates
// `src/generated/schema.ts`, which is then re-exported here:
//
//   export type { paths, components, operations } from './generated/schema';
//
export type { paths, components, operations } from './generated/schema';
