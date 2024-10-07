import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { extname } from 'path';

@Injectable()
export class UploadService {
  uploadFiles(files: Array<Express.Multer.File>): any {
    const uploadFolder = './uploads';
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder); // Papka yaratish
    }

    const savedFiles = files.map((file) => {
      console.log(file); // Yuklangan fayl haqida ma'lumot

      if (!file || !file.buffer) {
        throw new Error('File buffer is undefined or file upload failed'); // Xato
      }

      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const fileName = `${randomName}${extname(file.originalname)}`;

      // Faylni saqlash
      fs.writeFileSync(`${uploadFolder}/${fileName}`, file.buffer); // Faylni yozish
      return fileName; // Yozilgan fayl nomini qaytarish
    });

    return {
      message: `${files.length} files uploaded successfully`,
      files: savedFiles,
    };
  }

  getUploadedFiles(): string[] {
    const uploadFolder = './uploads';
    if (!fs.existsSync(uploadFolder)) {
      return [];
    }
    return fs.readdirSync(uploadFolder); // Yuklangan fayllar ro'yxatini olish
  }
}
