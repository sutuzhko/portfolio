// `cn` живёт в UI Kit (на нём построены варианты его компонентов) и ре-экспортируется
// отсюда, чтобы приложение по-прежнему брало утилиты из одной точки — `@/shared/lib`.
export { cn, type ClassValue } from '@sutuzhko/ui-kit';
export { countDirtyFields } from './count-dirty-fields';
export { downloadFile } from './download-file';
export { useScrollSpy } from './use-scroll-spy';
export { useHasKeyboard, consoleShortcut } from './keyboard';
export { useMoscowClock, moscowTime } from './use-moscow-clock';
export { useReveal } from './use-reveal';
