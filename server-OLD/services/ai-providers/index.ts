import { OpenRouterProvider } from './openrouter.js';
import { SillyTavernProvider } from './sillytavern.js';
import type { AIProvider } from '../../types/index.js';
import { database } from '../database.js';

export class AIProviderFactory {
  static async createProvider(): Promise<AIProvider> {
    const settings = await database.getSettings();
    
    switch (settings.ai_provider) {
      case 'openrouter':
        return new OpenRouterProvider();
      case 'sillytavern':
        return new SillyTavernProvider();
      default:
        throw new Error(`Unknown AI provider: ${settings.ai_provider}`);
    }
  }
}

export { OpenRouterProvider, SillyTavernProvider };
