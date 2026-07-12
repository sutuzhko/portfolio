import { useEffect, useState } from 'react';

/** Текущее московское время (HH:MM, 24 часа). Локале-независимый снимок. */
export function moscowTime(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Moscow',
  }).format(new Date());
}

/**
 * Живые часы по Москве (HH:MM) — общий флейвор терминала: строка `location`
 * в герой-карточке и приветствие консоли. Формат 24-часовой, локале-независим.
 */
export function useMoscowClock(): string {
  const [time, setTime] = useState(moscowTime);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(moscowTime());
    }, 30_000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return time;
}
