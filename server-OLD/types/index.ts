import { Database } from 'sqlite';
import { Database as SQLite3Database } from 'sqlite3';

export interface Character {
  id?: number;
  name: string;
  data: CharacterData;
  created_at?: string;
}

export interface CharacterData {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  alternate_greetings: string[];
  character_book?: any;
  tags: string[];
  creator: string;
  character_version: string;
  extensions: Record<string, any>;
  avatar?: string;
}

export interface Chat {
  id?: number;
  name: string;
  character_id: number;
  created_at?: string;
  character_name?: string;
  data?: CharacterData;
  last_message?: string;
  last_message_time?: string;
  messages?: Message[];
}

export interface Message {
  id?: number;
  chat_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  image?: string;
}

export interface Settings {
  id?: number;
  ai_provider: 'openrouter' | 'sillytavern';
  sillytavern_ip: string;
  sillytavern_port: string;
  openrouter_api_key: string;
  theme: string;
}

export interface OnboardingStatus {
  id?: number;
  completed: boolean;
  current_step: number;
  completed_at?: string;
}

export interface SystemEvent {
  id?: number;
  event_type: string;
  event_data: string;
  created_at?: string;
}

export interface DatabaseService {
  db?: Database<SQLite3Database>;
  initialize(): Promise<void>;
  getCharacters(): Promise<Character[]>;
  createCharacter(character: Character): Promise<Character>;
  getChats(): Promise<Chat[]>;
  getChat(id: number): Promise<Chat>;
  createChat(chat: Chat): Promise<Chat>;
  createMessage(message: Message): Promise<Message>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<Settings>;
  updateOnboardingStatus(status: OnboardingStatus): Promise<OnboardingStatus>;
  factoryReset(): Promise<void>;
}

export interface AIProvider {
  sendMessage(message: string, chat: Chat): Promise<string>;
}

export interface ImageService {
  processCharacterImage(filePath: string): Promise<Character>;
  saveMessageImage(chat_id: number, messageId: number, imageData: string): Promise<void>;
}

export interface DBQueryResult {
  lastID?: number;
  changes?: number;
}

export interface DBCharacter extends Omit<Character, 'data'> {
  data: string;
}

export interface DBChat extends Omit<Chat, 'data'> {
  data?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  role: MessageRole;
  content: string;
}

export interface AIResponse {
  message: string;
  error?: string;
}
