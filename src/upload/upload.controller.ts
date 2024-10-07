import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Res,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(), // Fayllarni xotiraga saqlash
    }),
  )
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.'); // Fayl yuklanmagan
    }

    console.log('Uploaded files:', files); // Yuklangan fayllar haqida ma'lumot
    return this.uploadService.uploadFiles(files); // Service ga fayllarni uzatish
  }

  @Get('list')
  getUploadedFiles(@Res() res: Response) {
    const files = this.uploadService.getUploadedFiles();
    return res.status(200).json({ files });
  }
}
