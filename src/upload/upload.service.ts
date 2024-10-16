import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { extname } from 'path';
import axios from 'axios';
import * as FormData from 'form-data'; // Importni to'g'ri o'zgartirdik

@Injectable()
export class UploadService {
  private readonly uploadFolder = './uploads';
  private readonly uploadUrl = 'https://files.moontv.uz/upload/files';

  constructor() {
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder); // Papka yaratish
    }
  }

  async uploadFiles(files: Array<Express.Multer.File>): Promise<any> {
    const savedFiles = await Promise.all(
      files.map(async (file) => {
        console.log(file); // Yuklangan fayl haqida ma'lumot

        if (!file || !file.buffer) {
          throw new BadRequestException(
            'File buffer is undefined or file upload failed',
          ); // Xato
        }

        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        const fileName = `${randomName}${extname(file.originalname)}`;

        // Faylni saqlash
        fs.writeFileSync(`${this.uploadFolder}/${fileName}`, file.buffer); // Faylni yozish

        // Faylni yuklash
        const formData = new FormData();
        formData.append(
          'files',
          fs.readFileSync(`${this.uploadFolder}/${fileName}`),
          {
            filename: fileName,
            contentType: file.mimetype,
          },
        );

        try {
          const response = await axios.post(this.uploadUrl, formData, {
            headers: {
              ...formData.getHeaders(), // FormData ning headers ni olish
            },
          });
          return response.data; // Yuborilgan fayl haqida javobni qaytarish
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error('File upload to remote server failed'); // Xato
        }
      }),
    );

    return {
      message: `${files.length} files uploaded successfully`,
      files: savedFiles, // Javobni `files` ichida qaytarish
    };
  }

  async getUploadedFiles(): Promise<string[]> {
    try {
      const filesRes = await axios.get('https://files.moontv.uz/files', {});
      console.log(filesRes.data);

      return filesRes.data;
    } catch (error) {
      throw new BadRequestException('File upload to remote server failed');
    }
  }
}
