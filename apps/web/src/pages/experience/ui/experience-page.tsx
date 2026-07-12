import { useNavigate } from 'react-router-dom';

import { useEducation } from '@/entities/education';
import { useExperience } from '@/entities/experience';
import { useLanguages } from '@/entities/language';
import { useProfile } from '@/entities/profile';
import { useSkills } from '@/entities/skill';
import { routePaths } from '@/shared/config';

import { ExperiencePageView } from './experience-page-view';

/**
 * Контейнер экрана опыта: оркеструет запросы (опыт, образование, языки, навыки)
 * и навигацию, отдаёт данные презентационному `ExperiencePageView`. Ведущее
 * состояние загрузки/ошибки — по опыту (основной блок экрана). Интро экрана
 * берётся из профиля (`profile.experienceIntro`).
 */
export function ExperiencePage() {
  const navigate = useNavigate();
  const experience = useExperience();
  const education = useEducation();
  const languages = useLanguages();
  const skills = useSkills();
  const { data: profile } = useProfile();

  return (
    <ExperiencePageView
      experience={experience.data}
      education={education.data}
      languages={languages.data}
      skills={skills.data}
      intro={profile?.experienceIntro}
      isLoading={experience.isLoading}
      isError={experience.isError}
      onBack={() => void navigate(routePaths.home)}
      onRetry={() => void experience.refetch()}
    />
  );
}
