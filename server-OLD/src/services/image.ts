import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { AppDataSource } from '../data-source.js';
import { Character } from '../entities/Character.js';
import { Message } from '../entities/Message.js';

export class ImageService {
  private static readonly UPLOADS_DIR = 'uploads';
  private static readonly CHARACTERS_DIR = path.join(ImageService.UPLOADS_DIR, 'characters');
  private static readonly MESSAGES_DIR = path.join(ImageService.UPLOADS_DIR, 'messages');
  private static readonly MAX_IMAGE_SIZE = 800; // Maximum dimension for images

  constructor() {
    this.ensureDirectories().catch(console.error);
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(ImageService.CHARACTERS_DIR, { recursive: true });
    await fs.mkdir(ImageService.MESSAGES_DIR, { recursive: true });
  }

  private async processImage(inputPath: string, outputPath: string): Promise<void> {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image dimensions');
    }

    // Resize if image is too large while maintaining aspect ratio
    if (metadata.width > ImageService.MAX_IMAGE_SIZE || metadata.height > ImageService.MAX_IMAGE_SIZE) {
      await image
        .resize(ImageService.MAX_IMAGE_SIZE, ImageService.MAX_IMAGE_SIZE, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } else {
      // Just convert to webp if no resize needed
      await image
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
  }

  async processCharacterImage(filePath: string): Promise<string> {
    try {
      const filename = path.basename(filePath);
      const outputFilename = `${path.parse(filename).name}.webp`;
      const outputPath = path.join(ImageService.CHARACTERS_DIR, outputFilename);

      await this.processImage(filePath, outputPath);

      // Delete original file after processing
      await fs.unlink(filePath);

      // Return the relative path for storage in database
      return path.join('characters', outputFilename);
    } catch (error) {
      console.error('Error processing character image:', error);
      throw new Error('Failed to process character image');
    }
  }

  async saveMessageImage(chat_id: number, messageId: number, imageData: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Create temporary file
      const tempFilename = `temp_${Date.now()}.png`;
      const tempPath = path.join(ImageService.MESSAGES_DIR, tempFilename);
      await fs.writeFile(tempPath, buffer);

      // Process image
      const outputFilename = `${chat_id}_${messageId}.webp`;
      const outputPath = path.join(ImageService.MESSAGES_DIR, outputFilename);
      await this.processImage(tempPath, outputPath);

      // Clean up temp file
      await fs.unlink(tempPath);

      // Return the relative path for storage in database
      return path.join('messages', outputFilename);
    } catch (error) {
      console.error('Error saving message image:', error);
      throw new Error('Failed to save message image');
    }
  }

  async deleteCharacterImage(avatarUrl: string): Promise<void> {
    try {
      const imagePath = path.join(ImageService.UPLOADS_DIR, avatarUrl);
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting character image:', error);
      // Don't throw error if file doesn't exist
    }
  }

  async deleteMessageImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(ImageService.UPLOADS_DIR, imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting message image:', error);
      // Don't throw error if file doesn't exist
    }
  }
}

export const imageService = new ImageService();
export default imageService;
