import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MediaAssetAdminDto } from '../../common/dto/media-asset-admin.dto';
import { AdminAuth } from '../auth/admin-auth.decorator';
import {
  AvatarResultDto,
  CvResultDto,
  UpdateMediaDto,
  UploadAvatarDto,
  UploadGalleryDto,
} from './dto/media-input.dto';
import { MediaService } from './media.service';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 МБ

// Принимаем только растровые изображения; размер ограничиваем.
const imageFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
    // Проверяем по mimetype; magic-number-валидация (file-type, ESM) не нужна и
    // ломается под CommonJS-раннером тестов.
    new FileTypeValidator({
      fileType: /image\/(jpe?g|png|webp|gif)/,
      skipMagicNumbersValidation: true,
    }),
  ],
});

// Резюме — только PDF.
const pdfFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
    new FileTypeValidator({ fileType: /application\/pdf/, skipMagicNumbersValidation: true }),
  ],
});

@ApiTags('media')
@AdminAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('gallery')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'projectId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        projectId: { type: 'string' },
        altRu: { type: 'string' },
        altEn: { type: 'string' },
        order: { type: 'integer' },
      },
    },
  })
  @ApiCreatedResponse({ type: MediaAssetAdminDto })
  @ApiBadRequestResponse({ description: 'Проект не найден или файл невалиден' })
  addGalleryImage(
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
    @Body() dto: UploadGalleryDto,
  ): Promise<MediaAssetAdminDto> {
    return this.mediaService.addGalleryImage(file, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        cropX: { type: 'integer' },
        cropY: { type: 'integer' },
        cropWidth: { type: 'integer' },
        cropHeight: { type: 'integer' },
      },
    },
  })
  @ApiCreatedResponse({ type: AvatarResultDto })
  @ApiBadRequestResponse({ description: 'Некорректное изображение или область кадрирования' })
  setAvatar(
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
    @Body() dto: UploadAvatarDto,
  ): Promise<AvatarResultDto> {
    return this.mediaService.setAvatar(file, dto);
  }

  @Post('cv')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: CvResultDto })
  @ApiBadRequestResponse({ description: 'Некорректный PDF' })
  uploadCv(@UploadedFile(pdfFilePipe) file: Express.Multer.File): Promise<CvResultDto> {
    return this.mediaService.uploadCv(file);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MediaAssetAdminDto })
  @ApiNotFoundResponse({ description: 'Медиа не найдено' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto): Promise<MediaAssetAdminDto> {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Медиа не найдено' })
  remove(@Param('id') id: string): Promise<void> {
    return this.mediaService.remove(id);
  }
}
