import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import CRC32 from 'crc-32';
import type { ImageService, Character, CharacterData } from '../types/index.js';

class Png {
    static uint8 = new Uint8Array(4);
    static int32 = new Int32Array(this.uint8.buffer);
    static uint32 = new Uint32Array(this.uint8.buffer);

    static decodeText(data: Uint8Array): { keyword: string; text: string } {
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

    static readChunk(data: Uint8Array, idx: number): { type: string; data: Uint8Array; crc: number } {
        this.uint8[3] = data[idx++];
        this.uint8[2] = data[idx++];
        this.uint8[1] = data[idx++];
        this.uint8[0] = data[idx++];
        const length = this.uint32[0];

        const chunkType = String.fromCharCode(data[idx++]) + 
                         String.fromCharCode(data[idx++]) + 
                         String.fromCharCode(data[idx++]) + 
                         String.fromCharCode(data[idx++]);

        const chunkData = data.slice(idx, idx + length);
        idx += length;

        this.uint8[3] = data[idx++];
        this.uint8[2] = data[idx++];
        this.uint8[1] = data[idx++];
        this.uint8[0] = data[idx++];
        const crc = this.int32[0];

        if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType))) {
            throw new Error('CRC for "' + chunkType + '" header is invalid, file is likely corrupted');
        }

        return { type: chunkType, data: chunkData, crc };
    }

    static readChunks(data: Uint8Array): Array<{ type: string; data: Uint8Array; crc: number }> {
        if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || 
            data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) {
            throw new Error('Invalid PNG header');
        }

        const chunks = [];
        let idx = 8; // Skip signature

        while (idx < data.length) {
            const chunk = Png.readChunk(data, idx);
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

    static Parse(arrayBuffer: ArrayBuffer): string {
        const data = new Uint8Array(arrayBuffer);
        const chunks = Png.readChunks(data);
        const text = chunks
            .filter(c => c.type === 'tEXt')
            .map(c => Png.decodeText(c.data));
        
        if (text.length < 1) throw new Error('No PNG text fields found in file');

        const chara = text.find(t => t.keyword === 'chara');
        if (chara === undefined) throw new Error('No PNG text field named "chara" found in file');

        try {
            const buffer = Buffer.from(chara.text, 'base64');
            return buffer.toString('utf-8');
        } catch (e) {
            throw new Error('Unable to parse "chara" field as base64');
        }
    }
}

export class ImageProcessor implements ImageService {
    async processCharacterImage(filePath: string): Promise<Character> {
        try {
            const buffer = await fs.readFile(filePath);
            const characterDataStr = Png.Parse(buffer.buffer);
            
            try {
                const data = JSON.parse(characterDataStr);
                
                if (data.spec !== 'chara_card_v2') {
                    throw new Error('Invalid character card format - not a V2 card');
                }

                const base64Image = buffer.toString('base64');
                const avatar = `data:image/png;base64,${base64Image}`;

                const characterData: CharacterData = {
                    name: data.data.name || '',
                    description: data.data.description || '',
                    personality: data.data.personality || '',
                    scenario: data.data.scenario || '',
                    first_mes: data.data.first_mes || '',
                    mes_example: data.data.mes_example || '',
                    creator_notes: data.data.creator_notes || '',
                    system_prompt: data.data.system_prompt || '',
                    post_history_instructions: data.data.post_history_instructions || '',
                    alternate_greetings: data.data.alternate_greetings || [],
                    character_book: data.data.character_book || undefined,
                    tags: data.data.tags || [],
                    creator: data.data.creator || '',
                    character_version: data.data.character_version || '',
                    extensions: data.data.extensions || {},
                    avatar: avatar
                };

                return {
                    name: characterData.name,
                    data: characterData
                };
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error('Failed to parse character card data: ' + error.message);
                }
                throw error;
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error('Error reading or parsing PNG file: ' + error.message);
            }
            throw error;
        }
    }

    async saveMessageImage(chat_id: number, messageId: number, imageData: string): Promise<void> {
        try {
            // Remove data URL prefix if present
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Ensure uploads directory exists
            await fs.mkdir('uploads', { recursive: true });

            // Process image with sharp
            await sharp(buffer)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFile(`uploads/${chat_id}_${messageId}.jpg`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error('Error saving message image: ' + error.message);
            }
            throw error;
        }
    }
}

export const imageProcessor = new ImageProcessor();
