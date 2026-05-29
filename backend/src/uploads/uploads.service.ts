import { Injectable, BadGatewayException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadsService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  private isCloudinaryConfigured(): boolean {
    const name = this.config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    return name.length > 0 && name !== 'your_cloud_name';
  }

  private async uploadFileLocally(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    const uploadsDir = join(process.cwd(), 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });
    const ext = extname(file.originalname) || '.bin';
    const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
    await writeFile(join(uploadsDir, filename), file.buffer);
    const port = this.config.get<string>('API_PORT') ?? '4000';
    const url = `http://localhost:${port}/uploads/${folder}/${filename}`;
    return {
      secure_url: url,
      public_id: `${folder}/${filename}`,
      url,
      original_filename: file.originalname,
      format: ext.replace('.', ''),
      resource_type: 'image',
      bytes: file.size,
    } as unknown as UploadApiResponse;
  }

  // Magic-byte signatures for each allowed type — Content-Type header is attacker-controlled,
  // so we verify the actual file bytes before accepting the upload.
  private static readonly MAGIC_BYTES: Array<{ type: string; bytes: number[]; offset?: number }> = [
    { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
    { type: 'image/png',  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { type: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF header (also check offset 8 for WEBP)
    { type: 'image/gif',  bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
    { type: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  ];

  private validateMagicBytes(file: Express.Multer.File): void {
    const buf = file.buffer;
    if (!buf || buf.length < 8) {
      throw new BadRequestException('File is empty or too small to validate');
    }

    const matched = UploadsService.MAGIC_BYTES.some(sig => {
      const offset = sig.offset ?? 0;
      return sig.bytes.every((byte, i) => buf[offset + i] === byte);
    });

    // WebP special case: "RIFF....WEBP" at bytes 0 and 8
    const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;

    if (!matched && !isWebp) {
      throw new BadRequestException(
        'File content does not match an allowed type (JPEG, PNG, WebP, GIF, PDF)',
      );
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'PrintCity'): Promise<UploadApiResponse> {
    // Validate actual file bytes — Content-Type header is not trusted
    this.validateMagicBytes(file);

    if (!this.isCloudinaryConfigured()) {
      return this.uploadFileLocally(file, folder);
    }
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            return reject(new BadGatewayException(`Upload failed: ${error.message}`));
          }
          resolve(result!);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }

  generateSignature(folder = 'PrintCity') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = `folder=${folder}&timestamp=${timestamp}`;
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      this.config.get('CLOUDINARY_API_SECRET')!,
    );
    return {
      signature,
      timestamp,
      cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.config.get('CLOUDINARY_API_KEY'),
      folder,
    };
  }
}
