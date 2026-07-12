import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useToaster } from '@/features/toaster';

import { useRunner } from '../model/runner-context';
import type { RunnerProject } from '../model/runner-context';

import { RunnerView, type RunnerWindowState } from './runner-view';

/**
 * Открытый раннер: владеет размером окна. Монтируется, только пока проект
 * запущен, поэтому каждый запуск начинает с обычного размера, а закрытие
 * сбрасывает состояние окна.
 */
function RunnerSession({
  project,
  onClose,
}: {
  readonly project: RunnerProject;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const [windowState, setWindowState] = useState<RunnerWindowState>('normal');

  // Проект не загрузился (переехал/офлайн) — тост-уведомление рядом с bash-ошибкой
  // в самом окне. Окно оставляем открытым: пользователь закроет его сам.
  const handleError = useCallback(() => {
    notify({
      type: 'error',
      title: t('runner.error.toastTitle'),
      description: t('runner.error.toastDescription', { title: project.title }),
    });
  }, [notify, t, project.title]);

  return (
    <RunnerView
      project={project}
      windowState={windowState}
      onClose={onClose}
      onMinimize={() => setWindowState('minimized')}
      onToggleMaximize={() =>
        setWindowState((state) => (state === 'maximized' ? 'normal' : 'maximized'))
      }
      onRestore={() => setWindowState('normal')}
      onError={handleError}
    />
  );
}

/**
 * Контейнер раннера: по глобальному состоянию (`useRunner`) решает, запущен ли
 * проект, и монтирует сессию с оверлеем. Запуск приходит из карточки/детали
 * проекта или консоли. Монтируется один раз в корневом лейауте.
 */
export function Runner() {
  const { project, close } = useRunner();
  if (project === null) return null;
  // key по URL — смена проекта пересоздаёт сессию (обычный размер + перезагрузка iframe).
  return <RunnerSession key={project.embedUrl} project={project} onClose={close} />;
}
