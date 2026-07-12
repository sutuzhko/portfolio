# @sutuzhko/ui-kit

Дизайн-система на React: доступные компоненты на CVA и CSS Modules, токены в палитре GitHub-dark со светлой темой. Идея простая - один набор кирпичей на все проекты, из которого собираются экраны, а не наоборот.

Библиотека сознательно ничего не знает о домене и не тянет i18n: все тексты приходят пропами. Тёмная тема - по умолчанию, светлая включается атрибутом `data-theme`. Каждый компонент задокументирован в Storybook и покрыт тестами, включая проверку доступности через `vitest-axe`.

## Установка

```sh
npm install @sutuzhko/ui-kit
npm install react react-dom   # peer-зависимости
```

## Использование

Стили подключаются один раз, до собственных глобальных стилей приложения:

```ts
import '@sutuzhko/ui-kit/styles.css';
```

```tsx
import { Button, Card, Heading } from '@sutuzhko/ui-kit';

export function Example() {
  return (
    <Card>
      <Heading level="h2">Привет</Heading>
      <Button variant="primary" onClick={() => console.info('click')}>
        Поехали
      </Button>
    </Card>
  );
}
```

## Темизация

Тёмная тема живёт на `:root`, светлая включается атрибутом на корневом элементе:

```html
<html data-theme="light">
  ...
</html>
```

Любой токен - это обычная CSS-переменная, поэтому переопределяется точечно:

```css
:root {
  --color-accent: #2f81f7;
}
```

## Разработка

```sh
pnpm --filter @sutuzhko/ui-kit storybook   # витрина на :6007
pnpm --filter @sutuzhko/ui-kit test        # unit (jsdom) + истории (Chromium)
pnpm --filter @sutuzhko/ui-kit build       # dist: index.js + index.d.ts + styles.css
```

Версии - через [Changesets](https://github.com/changesets/changesets):

```sh
pnpm changeset         # описать изменение
pnpm version-packages  # поднять версию + CHANGELOG
pnpm release           # собрать и опубликовать
```

## Лицензия

MIT
