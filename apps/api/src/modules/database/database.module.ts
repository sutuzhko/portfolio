import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

// AuthModule даёт гварды (JwtAuthGuard/RolesGuard) для гейтинга приватной зоны.
@Module({
  imports: [AuthModule],
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
