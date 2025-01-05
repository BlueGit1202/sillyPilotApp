import axios, { AxiosError } from 'axios';
import { AppDataSource } from '../data-source.js';
import { Settings } from '../entities/Settings.js';
import type { Chat } from '../entities/Chat.js';
import type { MessageRole } from '../entities/Message.js';

interface OpenRouterMessage {
  role: MessageRole;
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface OpenRouterErrorResponse {
  error?: {
    message: string;
  };
}

export class OpenRouterService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  private async getApiKey(): Promise<string> {
    const settingsRepository = AppDataSource.getRepository(Settings);
    const settings = await settingsRepository.findOne({ where: { id: 1 } });

    if (!settings?.openrouterApiKey) {
      throw new Error('OpenRouter API key not found in settings');
    }

    return settings.openrouterApiKey;
  }

  private getHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'SillyPilot',
      'OpenAI-Organization': 'SillyPilot',
      'User-Agent': 'SillyPilot/1.0.0'
    };
  }

  private createPersonalityProfile(chat: Chat): string {
    const characterData = chat.character.characterData;
    const personalityTraits = characterData.personality.split(',')
      .map((trait: string) => trait.trim())
      .filter((trait: string) => trait.length > 0);

    const personalityProfile = personalityTraits.length > 0
      ? `You embody these traits: ${personalityTraits.join(', ')}. These shape how you think, feel, and express yourself.`
      : '';

    const backgroundContext = characterData.description
      ? `Your background: ${characterData.description}. This history influences your perspective and reactions.`
      : '';

    return `${backgroundContext} ${personalityProfile}`;
  }

  private buildMessages(chat: Chat, userMessage: string): OpenRouterMessage[] {
    const characterData = chat.character.characterData;
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are ${characterData.name}. ${this.createPersonalityProfile(chat)} ${characterData.scenario ? `Current scenario: ${characterData.scenario}` : ''}`
      }
    ];

    // Add system prompt if available
    if (characterData.system_prompt) {
      messages.push({
        role: 'system',
        content: characterData.system_prompt
      });
    }

    // Add example messages if available
    if (characterData.mes_example) {
      const examples = characterData.mes_example.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => ({
          role: 'assistant' as const,
          content: line.trim()
        }));

      messages.push(...examples);
    }

    // Add chat history
    if (chat.messages) {
      let messageCount = 0;
      chat.messages.forEach((msg) => {
        // Every few messages, add a subtle personality reminder
        if (msg.role === 'assistant' && messageCount % 3 === 0) {
          const personalityTraits = characterData.personality.split(',')
            .map((trait: string) => trait.trim())
            .filter((trait: string) => trait.length > 0);

          if (personalityTraits.length > 0) {
            const trait = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
            messages.push({
              role: 'system',
              content: `Remember to express your ${trait} nature in your response.`
            });
          }
        }

        messages.push({
          role: msg.role,
          content: msg.content
        });

        messageCount++;
      });
    }

    // Add current message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  private processResponse(content: string, characterName: string): string {
    // Remove any meta-commentary or out-of-character text
    content = content.replace(/\*OOC:.*?\*/g, '');
    content = content.replace(/\(OOC:.*?\)/g, '');

    // Remove any AI self-references
    const aiPhrases = [
      /as an ai/gi,
      /i am an ai/gi,
      /i'm an ai/gi,
      /artificial intelligence/gi,
      /language model/gi,
      /ai assistant/gi,
      /ai model/gi
    ];

    aiPhrases.forEach(phrase => {
      content = content.replace(phrase, `as ${characterName}`);
    });

    return content;
  }

  async sendMessage(message: string, chat: Chat): Promise<string> {
    try {
      const apiKey = await this.getApiKey();

      const payload = {
        model: "qwen/qwen-2-7b-instruct:free",
        messages: this.buildMessages(chat, message),
        temperature: 0.9,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      };

      // Log request details (without API key)
      console.log('OpenRouter Request:', {
        url: this.baseUrl,
        headers: {
          ...this.getHeaders('[REDACTED]')
        },
        payload
      });

      const response = await axios.post<OpenRouterResponse>(
        this.baseUrl,
        payload,
        {
          headers: this.getHeaders(apiKey),
          timeout: 30000
        }
      );

      // Log response for debugging
      console.log('OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenRouter');
      }

      return this.processResponse(
        response.data.choices[0].message.content,
        chat.character.characterData.name
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<OpenRouterErrorResponse>;
        console.error('OpenRouter error details:', {
          name: axiosError.name,
          message: axiosError.message,
          response: axiosError.response ? {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data
          } : null
        });

        if (axiosError.response?.status === 401) {
          throw new Error('Invalid OpenRouter API key. Please check your settings.');
        }
        throw new Error(`OpenRouter API error: ${axiosError.response?.data?.error?.message || axiosError.message}`);
      }

      const genericError = error as Error;
      throw new Error(`OpenRouter error: ${genericError.message}`);
    }
  }
}

export const openRouterService = new OpenRouterService();
export default openRouterService;
