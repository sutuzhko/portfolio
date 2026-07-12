import type { Profile } from '@/entities/profile';

import { HeroIdentity, HeroIdentitySkeleton } from './hero-identity';
import { Pitch, PitchSkeleton } from './pitch';
import { TypingLine, TypingSkeleton } from './typing-line';

/** Профиле-зависимый контент левой колонки: идентичность, строка стека, питч.
 * Всё под скелетоном при загрузке — это данные профиля (`entities/profile`). */
export function HeroContent({ profile }: { readonly profile: Profile }) {
  return (
    <>
      <HeroIdentity profile={profile} />
      <TypingLine words={profile.heroStack} />
      <Pitch text={profile.headline} />
    </>
  );
}

export function HeroContentSkeleton() {
  return (
    <>
      <HeroIdentitySkeleton />
      <TypingSkeleton />
      <PitchSkeleton />
    </>
  );
}
