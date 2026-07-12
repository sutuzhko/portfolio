import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ContributorsController } from './contributors.controller';
import { ContributorsService } from './contributors.service';

@Module({
  imports: [AuthModule],
  controllers: [ContributorsController],
  providers: [ContributorsService],
})
export class ContributorsModule {}
