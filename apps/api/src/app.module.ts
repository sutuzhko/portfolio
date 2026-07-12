import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { DatabaseModule } from './modules/database/database.module';
import { EducationModule } from './modules/education/education.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { MediaModule } from './modules/media/media.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SkillsModule } from './modules/skills/skills.module';
import { StatsModule } from './modules/stats/stats.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DatabaseModule,
    ProfileModule,
    ProjectsModule,
    ContributorsModule,
    TechnologiesModule,
    ExperienceModule,
    EducationModule,
    LanguagesModule,
    SkillsModule,
    StatsModule,
    SettingsModule,
    MediaModule,
  ],
})
export class AppModule {}
