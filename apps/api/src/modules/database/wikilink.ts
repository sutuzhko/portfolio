// Утилиты для вики-ссылок базы знаний. В теле статей ссылки задаются как `[[slug]]`
// (или `[[Заголовок]]`); на их основе вычисляются бэклинки между статьями.

const WIKILINK_RE = /\[\[\s*([^[\]]+?)\s*\]\]/g;

// Приводит токен ссылки к slug-виду: те же правила, что и в редакторе дизайна
// (нижний регистр, пробелы → дефис), чтобы `[[event loop]]` совпал с `event-loop`.
export function slugifyToken(token: string): string {
  return token
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Достаёт строковые значения из LocalizedText (`{ru,en}`) или простой строки —
// бэклинки ищем по тексту во всех локалях.
export function collectLocalizedStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).filter(
    (item): item is string => typeof item === 'string',
  );
}

// Возвращает все токены вики-ссылок из переданных текстов.
export function extractWikilinks(texts: string[]): string[] {
  const tokens: string[] = [];
  for (const text of texts) {
    for (const match of text.matchAll(WIKILINK_RE)) {
      const token = match[1];
      if (token !== undefined) tokens.push(token);
    }
  }
  return tokens;
}
