/**
 * Character card system for handling PNG metadata
 * Compatible with SillyTavern's character format
 */
import * as FileSystem from 'expo-file-system'
import { encode as base64Encode } from 'base-64'
import type { Character } from '../navigation/types'

export interface CharacterMetadata {
  creator: string
  creator_notes: string
  character_version: string
  tags: string[]
  extensions: {
    specs: string
    world: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: string[]
  }
}

export interface CharacterCard {
  name: string
  description: string
  personality: string
  scenario: string
  first_message: string
  avatar_uri: string
  metadata: CharacterMetadata
}

class PngParser {
  private static uint8 = new Uint8Array(4);
  private static int32 = new Int32Array(PngParser.uint8.buffer);
  private static uint32 = new Uint32Array(PngParser.uint8.buffer);

  private static decodeText(data: Uint8Array): { keyword: string; text: string } {
    let naming = true;
    let keyword = '';
    let text = '';

    for (let index = 0; index < data.length; index++) {
      const code = data[index];

      if (naming) {
        if (code) {
          keyword += String.fromCharCode(code);
        } else {
          naming = false;
        }
      } else {
        if (code) {
          text += String.fromCharCode(code);
        } else {
          throw new Error('Invalid NULL character found in PNG tEXt chunk');
        }
      }
    }

    return { keyword, text };
  }

  private static readChunk(data: Uint8Array, idx: number): { type: string; data: Uint8Array; crc: number } {
    PngParser.uint8[3] = data[idx++];
    PngParser.uint8[2] = data[idx++];
    PngParser.uint8[1] = data[idx++];
    PngParser.uint8[0] = data[idx++];
    const length = PngParser.uint32[0];

    const chunkType = String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]);

    const chunkData = data.slice(idx, idx + length);
    idx += length;

    PngParser.uint8[3] = data[idx++];
    PngParser.uint8[2] = data[idx++];
    PngParser.uint8[1] = data[idx++];
    PngParser.uint8[0] = data[idx++];
    const crc = PngParser.int32[0];

    return { type: chunkType, data: chunkData, crc };
  }

  private static readChunks(data: Uint8Array): Array<{ type: string; data: Uint8Array; crc: number }> {
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 ||
      data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) {
      throw new Error('Invalid PNG header');
    }

    const chunks = [];
    let idx = 8; // Skip signature

    while (idx < data.length) {
      const chunk = PngParser.readChunk(data, idx);
      if (!chunks.length && chunk.type !== 'IHDR') {
        throw new Error('PNG missing IHDR header');
      }
      chunks.push(chunk);
      idx += 4 + 4 + chunk.data.length + 4;
    }

    if (chunks.length === 0) throw new Error('PNG ended prematurely, no chunks');
    if (chunks[chunks.length - 1].type !== 'IEND') {
      throw new Error('PNG ended prematurely, missing IEND header');
    }

    return chunks;
  }

  static async parse(uri: string): Promise<any> {
    try {
      // Read file as binary
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Convert base64 to binary array
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const chunks = PngParser.readChunks(bytes);
      const text = chunks
        .filter(c => c.type === 'tEXt')
        .map(c => PngParser.decodeText(c.data));

      if (text.length < 1) throw new Error('No PNG text fields found in file');

      const chara = text.find(t => t.keyword === 'chara');
      if (chara === undefined) throw new Error('No PNG text field named "chara" found in file');

      try {
        // Convert character data from base64 to string
        const jsonString = atob(chara.text);
        return JSON.parse(jsonString);
      } catch (e) {
        console.error('Failed to parse character data:', e);
        throw new Error('Unable to parse character data');
      }
    } catch (error) {
      console.error('Failed to parse character card:', error);
      throw error;
    }
  }
}

export class CharacterCardService {
  async parseCharacterCard(uri: string): Promise<CharacterCard | null> {
    try {
      const data = await PngParser.parse(uri);
      
      if (data.spec !== 'chara_card_v2') {
        throw new Error('Invalid character card format - not a V2 card');
      }

      return {
        name: data.data.name || '',
        description: data.data.description || '',
        personality: data.data.personality || '',
        scenario: data.data.scenario || '',
        first_message: data.data.first_mes || data.data.greeting || '',
        avatar_uri: uri,
        metadata: {
          creator: data.data.creator || '',
          creator_notes: data.data.creator_notes || '',
          character_version: data.data.character_version || '',
          tags: data.data.tags || [],
          extensions: {
            specs: data.spec || '',
            world: data.data.world || '',
            system_prompt: data.data.system_prompt || '',
            post_history_instructions: data.data.post_history_instructions || '',
            alternate_greetings: data.data.alternate_greetings || []
          }
        }
      };
    } catch (error) {
      console.error('Failed to parse character card:', error);
      return null;
    }
  }

  async exportCharacterCard(character: Character): Promise<string> {
    try {
      // Create character card data
      const cardData = {
        spec: 'chara_card_v2',
        data: {
          name: character.data?.name,
          description: character.data?.description,
          personality: character.data?.personality,
          scenario: character.data?.scenario,
          first_mes: character.data?.firstMessage,
          system_prompt: character.data?.systemPrompt,
          creator_notes: character.data?.creatorNotes,
          tags: character.data?.tags,
          creator: 'SillyPilot',
          character_version: '1.0.0',
          alternate_greetings: [],
          post_history_instructions: '',
          extensions: {}
        }
      };

      // Get avatar image
      const avatarUri = character.data.avatar;
      if (!avatarUri) {
        throw new Error('Character has no avatar');
      }

      // Create a temporary file for the card
      const tempDir = FileSystem.cacheDirectory;
      if (!tempDir) {
        throw new Error('No cache directory available');
      }

      const cardPath = `${tempDir}${character.data.name.replace(/[^a-z0-9]/gi, '_')}.png`;

      // Copy avatar to temp file
      await FileSystem.copyAsync({
        from: avatarUri,
        to: cardPath
      });

      // Read the PNG file
      const base64 = await FileSystem.readAsStringAsync(cardPath, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Convert JSON data to base64
      const jsonString = JSON.stringify(cardData);
      const jsonBase64 = base64Encode(jsonString);

      // Create PNG chunks
      const pngHeader = btoa(String.fromCharCode(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A));
      const textChunk = btoa(`chara${jsonBase64}`);
      const pngEnd = btoa(String.fromCharCode(0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82));

      // Combine chunks
      const finalBase64 = `${pngHeader}${base64}${textChunk}${pngEnd}`;

      // Save to file
      const exportPath = `${FileSystem.documentDirectory}${character.data.name.replace(/[^a-z0-9]/gi, '_')}_card.png`;
      await FileSystem.writeAsStringAsync(exportPath, finalBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Clean up temp file
      await FileSystem.deleteAsync(cardPath, { idempotent: true });

      return exportPath;
    } catch (error) {
      console.error('Failed to export character card:', error);
      throw error;
    }
  }

  createCharacterFromCard(card: CharacterCard): Character {
    return {
      id: Math.random(),
      data: {
        name: card.name,
        avatar: card.avatar_uri,
        description: card.description,
        personality: card.personality,
        scenario: card.scenario,
        firstMessage: card.first_message,
        systemPrompt: card.metadata.extensions.system_prompt,
        creatorNotes: card.metadata.creator_notes,
        tags: card.metadata.tags,
        status: "online",
        mood: "Cheerful"
      }
    }
  }

  cleanupBlobUrl(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}

export const characterCardService = new CharacterCardService();
export default characterCardService;
