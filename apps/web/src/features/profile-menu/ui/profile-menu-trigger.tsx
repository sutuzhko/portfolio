import { useProfile } from '@/entities/profile';
import { useAuth } from '@/entities/session';
import { Avatar, Icon } from '@sutuzhko/ui-kit';

/**
 * Содержимое кнопки-триггера меню профиля в навбаре. Залогиненный пользователь
 * видит свой аватар (загруженное фото или инициалы имени на выбранном цвете —
 * то же, что на сайте) — аватар **заполняет всю кнопку** той же скруглённо-
 * квадратной формы, что и кнопка гостя (кнопка навбара клипует край через
 * `overflow: hidden`). Гость и состояние до загрузки профиля — обобщённая иконка.
 *
 * Декоративен: сама кнопка навбара несёт доступную подпись, поэтому оборачиваем
 * в `aria-hidden`, чтобы имя не озвучивалось дважды.
 */
export function ProfileMenuTrigger() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();

  if (!isAuthenticated || profile === undefined) {
    return <Icon name="user" size={18} />;
  }

  return (
    <span aria-hidden="true">
      <Avatar
        name={profile.name}
        src={profile.avatarPhotoUrl}
        color={profile.avatarColor}
        size={38}
        shape="square"
      />
    </span>
  );
}
