import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [AuthModule],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
