import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ImageService } from './image.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [MediaService, StorageService, ImageService],
})
export class MediaModule {}
