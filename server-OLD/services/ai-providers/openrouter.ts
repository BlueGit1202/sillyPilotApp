import axios, { AxiosError } from 'axios';
import type { AIProvider, Chat } from '../../types/index.js';
import { database } from '../database.js';

interface OpenRouterErrorResponse {
  error?: {
    message: string;
  };
}

export class OpenRouterProvider implements AIProvider {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  async sendMessage(message: string, chat: Chat): Promise<string> {
    try {
      const settings = await database.getSettings();
      
      if (!settings.openrouter_api_key) {
        throw new Error('OpenRouter API key not found in settings');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openrouter_api_key}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'SillyPilot',
        'OpenAI-Organization': 'SillyPilot',
        'User-Agent': 'SillyPilot/1.0.0'
      };

      const characterData = chat.data;
      if (!characterData) {
        throw new Error('Character data not found');
      }

      // Create a natural personality profile from character data
      const personalityTraits = characterData.personality.split(',')
        .map(trait => trait.trim())
        .filter(trait => trait.length > 0);

      const personalityProfile = personalityTraits.length > 0
        ? `You embody these traits: ${personalityTraits.join(', ')}. These shape how you think, feel, and express yourself.`
        : '';

      // Create a background context from character description
      const backgroundContext = characterData.description
        ? `Your background: ${characterData.description}. This history influences your perspective and reactions.`
        : '';

      // Initial context setting - more natural and conversational
      const messages = [
        { 
          role: "system", 
          content: `You are ${characterData.name}. ${backgroundContext} ${personalityProfile} ${characterData.scenario ? `Current scenario: ${characterData.scenario}` : ''}`
        }
      ];

      // If there's a system prompt, add it naturally
      if (characterData.system_prompt) {
        messages.push({
          role: "system",
          content: characterData.system_prompt
        });
      }

      // Add example messages if available to establish conversation style
      if (characterData.mes_example) {
        const examples = characterData.mes_example.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => ({
            role: "assistant",
            content: line.trim()
          }));
        
        if (examples.length > 0) {
          messages.push(...examples);
        }
      }

      // Add chat history with subtle personality reinforcement
      if (chat.messages) {
        let messageCount = 0;
        chat.messages.forEach(msg => {
          // Every few messages, add a subtle personality reminder
          if (msg.role === 'assistant' && messageCount % 3 === 0 && personalityTraits.length > 0) {
            // Pick a random personality trait to emphasize
            const trait = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
            messages.push({
              role: "system",
              content: `Remember to express your ${trait} nature in your response.`
            });
          }
          
          messages.push({
            role: msg.role,
            content: msg.content
          });
          
          messageCount++;
        });
      }

      // Add current message
      messages.push({ role: "user", content: message });

      const payload = {
        model: "qwen/qwen-2-7b-instruct:free",
        messages: messages,
        temperature: 0.9,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      };

      // Log full request details
      console.log('OpenRouter Request:', {
        url: this.baseUrl,
        headers: {
          ...headers,
          'Authorization': 'Bearer [REDACTED]'
        },
        payload: {
          ...payload,
          messages: messages
        }
      });

      const response = await axios.post(this.baseUrl, payload, { 
        headers,
        timeout: 30000
      });

      // Log full response for debugging
      console.log('OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (!response.data) {
        throw new Error('No response data received from OpenRouter');
      }

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenRouter');
      }

      // Process the response to ensure it stays in character
      let responseContent = response.data.choices[0].message.content;
      
      // Remove any meta-commentary or out-of-character text
      responseContent = responseContent.replace(/\*OOC:.*?\*/g, '');
      responseContent = responseContent.replace(/\(OOC:.*?\)/g, '');
      
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
        responseContent = responseContent.replace(phrase, `as ${characterData.name}`);
      });

      return responseContent;
    } catch (error) {
      // Type guard for AxiosError
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

      // For non-Axios errors
      const genericError = error as Error;
      throw new Error(`OpenRouter error: ${genericError.message}`);
    }
  }
}
