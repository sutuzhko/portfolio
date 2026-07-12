---
'@sutuzhko/ui-kit': minor
---

Первый релиз: дизайн-система вынесена из портфолио в самостоятельный пакет.

- 30 компонентов: примитивы (Icon, Button, Tag, Chip, Kbd, Text, Heading, SectionLabel, Avatar, Card, Skeleton, WindowChrome, FieldFrame, Input, Textarea, Select, Toggle) и композиты (Segmented, Tabs, Tree, Menu, Modal, ConfirmDialog, ImageCropper, Toast, Tray, DockPill, Window, ErrorState, PageIntro).
- Токены GitHub-dark отдельным entry `@sutuzhko/ui-kit/styles.css`; светлая тема через `data-theme="light"`.
- Библиотека доменно- и i18n-нейтральна: тексты приходят пропами.
- ESM-сборка с внешними `react`/`react-dom`, типы `.d.ts`, 108 unit- и 176 storybook-тестов.
