import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ImageCropper, Modal, type CropRect } from '@sutuzhko/ui-kit';

export interface AvatarCropperModalProps {
  readonly open: boolean;
  /** URL кадрируемого изображения (object URL выбранного файла). */
  readonly src: string;
  /** Идёт загрузка на сервер — блокируем «Применить». */
  readonly isUploading: boolean;
  readonly onCancel: () => void;
  readonly onApply: (crop: CropRect) => void;
}

/**
 * Модал кадрирования аватара: перетаскивание + масштаб над круглой маской, снизу —
 * «Отмена»/«Применить». Отдаёт наружу выбранный квадрат кадра (в пикселях исходника).
 */
export function AvatarCropperModal({
  open,
  src,
  isUploading,
  onCancel,
  onApply,
}: AvatarCropperModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<CropRect | null>(null);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t('admin.profile.avatarCrop.title')}
      description={t('admin.profile.avatarCrop.subtitle')}
      closeLabel={t('admin.profile.avatarCrop.cancel')}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t('admin.profile.avatarCrop.cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={isUploading || crop === null}
            onClick={() => {
              if (crop !== null) onApply(crop);
            }}
          >
            {t('admin.profile.avatarCrop.apply')}
          </Button>
        </>
      }
    >
      <ImageCropper src={src} zoomLabel={t('admin.profile.avatarCrop.zoom')} onChange={setCrop} />
    </Modal>
  );
}
