import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type {
  AdminContactLink,
  CreateContact,
  LocalizedText,
  ProfileAdmin,
  UpdateContact,
  UpdateProfile,
} from '../model/types';

import { getMockProfileState, setMockProfileState } from './profile-store.mock';

export { mockProfileAdmin, resetMockProfileAdmin } from './profile-store.mock';

// Мёрж локали как на бэкенде (mergeText): присланная локаль накладывается на
// сохранённую, вторая не затирается. Нужно, чтобы мок вёл себя как реальный API
// при частичном (одноязычном) PATCH.
function mergeLocale(
  base: LocalizedText | null,
  patch: { ru?: string; en?: string },
): LocalizedText {
  return { ru: patch.ru ?? base?.ru ?? '', en: patch.en ?? base?.en ?? null };
}

// Накладывает PATCH на текущий админ-профиль: скаляры заменяются, локализованные
// поля мёржатся по локали (см. mergeLocale). highlights бэкенд перезаписывает
// массивом целиком (обе локали приходят в подписи) — повторяем это.
function applyProfilePatch(current: ProfileAdmin, patch: UpdateProfile): ProfileAdmin {
  const next: ProfileAdmin = { ...current };
  if (patch.name !== undefined) next.name = mergeLocale(current.name, patch.name);
  if (patch.email !== undefined) next.email = patch.email;
  if (patch.avatarColor !== undefined) next.avatarColor = patch.avatarColor;
  if (patch.cvUrl !== undefined) next.cvUrl = mergeLocale(next.cvUrl, patch.cvUrl);
  if (patch.avatarPhotoUrl !== undefined) next.avatarPhotoUrl = patch.avatarPhotoUrl;
  if (patch.availability !== undefined) next.availability = patch.availability;
  if (patch.isBioHidden !== undefined) next.isBioHidden = patch.isBioHidden;
  if (patch.heroStack !== undefined) next.heroStack = patch.heroStack;
  if (patch.roleTitle !== undefined)
    next.roleTitle = mergeLocale(current.roleTitle, patch.roleTitle);
  if (patch.headline !== undefined) next.headline = mergeLocale(current.headline, patch.headline);
  if (patch.location !== undefined) next.location = mergeLocale(current.location, patch.location);
  if (patch.bioMarkdown !== undefined) {
    next.bioMarkdown = mergeLocale(current.bioMarkdown, patch.bioMarkdown);
  }
  if (patch.projectsIntro !== undefined) {
    next.projectsIntro = mergeLocale(current.projectsIntro, patch.projectsIntro);
  }
  if (patch.experienceIntro !== undefined) {
    next.experienceIntro = mergeLocale(current.experienceIntro, patch.experienceIntro);
  }
  if (patch.contactIntro !== undefined) {
    next.contactIntro = mergeLocale(current.contactIntro, patch.contactIntro);
  }
  if (patch.highlights !== undefined) {
    next.highlights = patch.highlights.map((highlight) => ({
      value: highlight.value,
      label: { ru: highlight.label.ru, en: highlight.label.en ?? null },
    }));
  }
  return next;
}

// Заглушка загруженного аватара: data-URI, чтобы превью в моках/историях рисовалось.
const MOCK_AVATAR_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c97e8"/><stop offset="1" stop-color="#866cc7"/></linearGradient></defs><rect width="128" height="128" fill="url(#g)"/></svg>',
)}`;

// Мок кадрирует аватар как реальный бэкенд (sharp extract → 512²): вырезает
// присланный квадрат [cropX,cropY,size] и рисует в 512×512, отдаёт data-URI. Так в
// dev:mock видно РЕАЛЬНЫЙ результат кадрирования, а не заглушку. В jsdom (тесты)
// canvas недоступен → падаем на заглушку (этот хендлер там всё равно не вызывается).
const AVATAR_SIDE = 512;

async function cropUploadedAvatar(request: Request): Promise<string> {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof Blob)) return MOCK_AVATAR_URL;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIDE;
  canvas.height = AVATAR_SIDE;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return MOCK_AVATAR_URL;

  const x = Number(form.get('cropX'));
  const y = Number(form.get('cropY'));
  const size = Number(form.get('cropWidth'));
  if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(size) && size > 0) {
    ctx.drawImage(bitmap, x, y, size, size, 0, 0, AVATAR_SIDE, AVATAR_SIDE);
  } else {
    // Без кропа — центрированный квадрат (как fallback бэкенда).
    const side = Math.min(bitmap.width, bitmap.height);
    const left = (bitmap.width - side) / 2;
    const top = (bitmap.height - side) / 2;
    ctx.drawImage(bitmap, left, top, side, side, 0, 0, AVATAR_SIDE, AVATAR_SIDE);
  }
  return canvas.toDataURL('image/webp');
}

/** MSW-обработчики админ-профиля: чтение обеих локалей и частичный PATCH. */
export const profileAdminHandlers = [
  http.get(`${env.apiBaseUrl}/profile/admin`, () => HttpResponse.json(getMockProfileState())),
  http.post(`${env.apiBaseUrl}/media/avatar`, async ({ request }) => {
    try {
      const avatarPhotoUrl = await cropUploadedAvatar(request);
      return HttpResponse.json({ avatarPhotoUrl }, { status: 201 });
    } catch {
      return HttpResponse.json({ avatarPhotoUrl: MOCK_AVATAR_URL }, { status: 201 });
    }
  }),
  http.post(`${env.apiBaseUrl}/media/cv`, () =>
    HttpResponse.json({ url: '/uploads/cv/mock-resume.pdf' }, { status: 201 }),
  ),
  http.post<Record<string, never>, CreateContact>(
    `${env.apiBaseUrl}/profile/contacts`,
    async ({ request }) => {
      const body = await request.json();
      const current = getMockProfileState();
      const created: AdminContactLink = {
        id: `c-${Date.now()}`,
        icon: body.icon,
        url: body.url,
        hidden: body.hidden ?? false,
        order: body.order ?? current.contacts.length,
      };
      setMockProfileState({ ...current, contacts: [...current.contacts, created] });
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateContact>(
    `${env.apiBaseUrl}/profile/contacts/:id`,
    async ({ request, params }) => {
      const patch = await request.json();
      const current = getMockProfileState();
      const contacts = current.contacts.map((contact) =>
        contact.id === params.id ? { ...contact, ...patch } : contact,
      );
      const updated = contacts.find((contact) => contact.id === params.id);
      if (!updated) return new HttpResponse(null, { status: 404 });
      setMockProfileState({ ...current, contacts });
      return HttpResponse.json(updated);
    },
  ),
  http.patch<Record<string, never>, UpdateProfile>(
    `${env.apiBaseUrl}/profile`,
    async ({ request }) => {
      const patch = await request.json();
      const next = applyProfilePatch(getMockProfileState(), patch);
      setMockProfileState(next);
      return HttpResponse.json(next);
    },
  ),
];
