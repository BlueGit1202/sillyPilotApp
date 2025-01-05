import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Settings } from '../entities/Settings.js';
import type { AIProvider } from '../entities/Settings.js';

const router = Router();

interface UpdateSettingsRequest extends Request {
  body: {
    aiProvider: AIProvider;
    sillytavernIp?: string;
    sillytavernPort?: string;
    openrouterApiKey?: string;
    theme: string;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
  };
}

// Get settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(Settings);
    let settings = await settingsRepository.findOne({
      where: { id: 1 } // We always use ID 1 for settings
    });

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = settingsRepository.create({
        aiProvider: 'openrouter',
        theme: 'mocha',
        onboardingCompleted: false,
        onboardingStep: 1
      });
      settings = await settingsRepository.save(defaultSettings);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Update settings
router.put('/', async (req: UpdateSettingsRequest, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(Settings);
    let settings = await settingsRepository.findOne({
      where: { id: 1 }
    });

    if (!settings) {
      settings = settingsRepository.create({
        id: 1,
        ...req.body
      });
    } else {
      settingsRepository.merge(settings, req.body);
    }

    const result = await settingsRepository.save(settings);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Reset settings to default
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(Settings);
    const settings = await settingsRepository.findOne({
      where: { id: 1 }
    });

    if (settings) {
      const defaultSettings = {
        aiProvider: 'openrouter' as AIProvider,
        sillytavernIp: '',
        sillytavernPort: '',
        openrouterApiKey: '',
        theme: 'mocha',
        onboardingCompleted: false,
        onboardingStep: 1
      };

      settingsRepository.merge(settings, defaultSettings);
      const result = await settingsRepository.save(settings);
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Settings not found'
      });
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Factory reset - clear all data
router.post('/factory-reset', async (_req: Request, res: Response) => {
  try {
    // Drop and recreate all tables
    await AppDataSource.synchronize(true);

    // Reinitialize default settings
    const settingsRepository = AppDataSource.getRepository(Settings);
    const defaultSettings = settingsRepository.create({
      id: 1,
      aiProvider: 'openrouter',
      theme: 'mocha',
      onboardingCompleted: false,
      onboardingStep: 1
    });
    await settingsRepository.save(defaultSettings);

    res.json({
      success: true,
      data: {
        message: 'Factory reset completed successfully',
        settings: defaultSettings
      }
    });
  } catch (error) {
    console.error('Error performing factory reset:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

export const settingsRouter = router;
