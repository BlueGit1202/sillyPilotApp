import axios from 'axios';
import type { AIProvider, Chat } from '../../types/index.js';
import { database } from '../database.js';

export class SillyTavernProvider implements AIProvider {
  async sendMessage(message: string, chat: Chat): Promise<string> {
    try {
      const settings = await database.getSettings();
      const baseUrl = `http://${settings.sillytavern_ip}:${settings.sillytavern_port}`;
      
      if (!baseUrl) {
        throw new Error('SillyTavern URL is not configured');
      }

      const response = await axios.post(`${baseUrl}/api/plugins/stahp/api/send`, { 
        message,
        characterData: chat.data
      });

      if (response.data?.result) {
        return response.data.result;
      }

      throw new Error('Invalid response from SillyTavern');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`SillyTavern error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while sending message to SillyTavern');
    }
  }
}
