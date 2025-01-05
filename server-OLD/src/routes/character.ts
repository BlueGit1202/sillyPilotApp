import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Character } from '../entities/Character.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import type { CharacterData } from '../entities/Character.js';
import { imageService } from '../services/image.js';

const router = Router();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface CreateCharacterRequest extends MulterRequest {
  body: {
    character: string;
  };
}

interface UpdateCharacterRequest extends MulterRequest {
  params: {
    id: string;
  };
  body: {
    character: string;
  };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/characters');
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Ensure uploads directory exists
(async () => {
  try {
    await fs.mkdir('uploads/characters', { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
})();

// Get all characters
router.get('/', async (_req: Request, res: Response) => {
  try {
    const characterRepository = AppDataSource.getRepository(Character);
    const characters = await characterRepository.find({
      order: { createdAt: 'DESC' }
    });
    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Get single character
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const characterRepository = AppDataSource.getRepository(Character);
    const character = await characterRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!character) {
      return res.status(404).json({ 
        success: false,
        error: 'Character not found'
      });
    }

    res.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Upload character avatar
router.post('/upload-avatar', upload.single('avatar'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No avatar file provided'
      });
    }

    const processedImagePath = await imageService.processCharacterImage(req.file.path);
    
    res.json({
      success: true,
      data: {
        avatar: processedImagePath
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    });
  }
});

// Create character
router.post('/', async (req: CreateCharacterRequest, res: Response) => {
  try {
    const characterRepository = AppDataSource.getRepository(Character);
    const characterData = JSON.parse(req.body.character);
    const { name, data } = characterData;

    const character = characterRepository.create({
      name,
      characterData: data
    });

    await characterRepository.save(character);

    res.status(201).json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Update character
router.put('/:id', async (req: UpdateCharacterRequest, res: Response) => {
  try {
    const characterRepository = AppDataSource.getRepository(Character);
    const characterData = JSON.parse(req.body.character);
    const { name, data } = characterData;
    const existingCharacter = await characterRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingCharacter) {
      return res.status(404).json({ 
        success: false,
        error: 'Character not found'
      });
    }

    // If avatar URL has changed, delete the old avatar
    if (existingCharacter.characterData.avatarUrl && 
        data.avatarUrl && 
        existingCharacter.characterData.avatarUrl !== data.avatarUrl) {
      try {
        const oldPath = existingCharacter.characterData.avatarUrl;
        await imageService.deleteCharacterImage(oldPath);
      } catch (error) {
        console.error('Error removing old avatar:', error);
      }
    }

    existingCharacter.name = name;
    existingCharacter.characterData = data;

    const result = await characterRepository.save(existingCharacter);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Delete character
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const characterRepository = AppDataSource.getRepository(Character);
    const character = await characterRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!character) {
      return res.status(404).json({ 
        success: false,
        error: 'Character not found'
      });
    }

    // Remove avatar file if it exists
    if (character.characterData.avatarUrl) {
      try {
        await imageService.deleteCharacterImage(character.characterData.avatarUrl);
      } catch (error) {
        console.error('Error removing avatar file:', error);
      }
    }

    await characterRepository.remove(character);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

export const characterRouter = router;
