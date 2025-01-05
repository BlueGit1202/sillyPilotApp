import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import type { 
  DatabaseService, 
  Character, 
  Chat, 
  Message, 
  Settings, 
  OnboardingStatus,
  CharacterData,
  DBCharacter,
  DBChat,
  DBQueryResult
} from '../types/index.js';

type DBMessage = Message;

export class SQLiteDatabase implements DatabaseService {
  public db?: Database<sqlite3.Database>;
  private static instance: SQLiteDatabase;

  private constructor() {}

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await this.createTables();
    await this.initializeSettings();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        character_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ai_provider TEXT,
        sillytavern_ip TEXT,
        sillytavern_port TEXT,
        openrouter_api_key TEXT,
        theme TEXT
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER,
        message_id INTEGER,
        image_data BLOB,
        FOREIGN KEY (chat_id) REFERENCES chats (id),
        FOREIGN KEY (message_id) REFERENCES messages (id)
      );

      CREATE TABLE IF NOT EXISTS onboarding_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        completed BOOLEAN DEFAULT 0,
        completed_at TIMESTAMP,
        current_step INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS system_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async initializeSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const settingsCount = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM settings');
    if (settingsCount?.count === 0) {
      await this.db.run(`
        INSERT INTO settings (ai_provider, sillytavern_ip, sillytavern_port, openrouter_api_key, theme)
        VALUES (?, ?, ?, ?, ?)
      `, ['openrouter', '', '', '', 'mocha']);
    }
  }

  async getCharacters(): Promise<Character[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all<Array<DBCharacter>>('SELECT * FROM characters ORDER BY created_at DESC');
    return rows.map((char: DBCharacter) => ({
      id: char.id,
      name: char.name,
      data: JSON.parse(char.data) as CharacterData,
      created_at: char.created_at
    }));
  }

  async createCharacter(character: Character): Promise<Character> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      'INSERT INTO characters (name, data) VALUES (?, ?)',
      [character.name, JSON.stringify(character.data)]
    );

    return {
      ...character,
      id: result.lastID,
      created_at: new Date().toISOString()
    };
  }

  async getChats(): Promise<Chat[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all<Array<DBChat>>(`
      WITH Last_messages AS (
        SELECT chat_id, content, timestamp,
          ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY timestamp DESC) as rn
        FROM messages
      )
      SELECT 
        chats.*, 
        characters.name as character_name,
        characters.data,
        Last_messages.content as last_message,
        Last_messages.timestamp as last_message_time
      FROM chats 
      LEFT JOIN characters ON chats.character_id = characters.id 
      LEFT JOIN Last_messages ON chats.id = Last_messages.chat_id AND Last_messages.rn = 1
      ORDER BY chats.created_at DESC
    `);

    return rows.map((chat: DBChat) => ({
      id: chat.id,
      name: chat.name,
      character_id: chat.character_id,
      created_at: chat.created_at,
      character_name: chat.character_name,
      data: chat.data ? JSON.parse(chat.data) as CharacterData : undefined,
      last_message: chat.last_message,
      last_message_time: chat.last_message_time ? 
        new Date(chat.last_message_time).toLocaleTimeString() : 
        'No messages yet'
    }));
  }

  async getChat(id: number): Promise<Chat> {
    if (!this.db) throw new Error('Database not initialized');

    const chat = await this.db.get<DBChat>(`
      SELECT chats.*, characters.name as character_name, characters.data 
      FROM chats 
      LEFT JOIN characters ON chats.character_id = characters.id 
      WHERE chats.id = ?
    `, id);

    if (!chat) throw new Error('Chat not found');

    const rows = await this.db.all<Array<DBMessage>>(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp',
      id
    );

    return {
      id: chat.id,
      name: chat.name,
      character_id: chat.character_id,
      created_at: chat.created_at,
      character_name: chat.character_name,
      data: chat.data ? JSON.parse(chat.data) as CharacterData : undefined,
      messages: rows
    };
  }

  async createChat(chat: Chat): Promise<Chat> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      'INSERT INTO chats (name, character_id) VALUES (?, ?)',
      [chat.name, chat.character_id]
    );

    return {
      ...chat,
      id: result.lastID,
      created_at: new Date().toISOString()
    };
  }

  async createMessage(message: Message): Promise<Message> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
      [message.chat_id, message.role, message.content]
    );

    const messageId = result.lastID;

    if (message.image) {
      await this.db.run(
        'INSERT INTO images (chat_id, message_id, image_data) VALUES (?, ?, ?)',
        [message.chat_id, messageId, message.image]
      );
    }

    return {
      ...message,
      id: messageId,
      timestamp: new Date().toISOString()
    };
  }

  async getSettings(): Promise<Settings> {
    if (!this.db) throw new Error('Database not initialized');

    const settings = await this.db.get<Settings>('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    if (!settings) {
      await this.initializeSettings();
      return this.getSettings();
    }
    return settings;
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE settings 
      SET ai_provider = ?, sillytavern_ip = ?, sillytavern_port = ?, 
          openrouter_api_key = ?, theme = ?
      WHERE id = (SELECT id FROM settings ORDER BY id DESC LIMIT 1)
    `, [
      settings.ai_provider,
      settings.sillytavern_ip,
      settings.sillytavern_port,
      settings.openrouter_api_key,
      settings.theme
    ]);
    return settings;
  }

  async updateOnboardingStatus(status: OnboardingStatus): Promise<OnboardingStatus> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'UPDATE onboarding_status SET completed = ?, current_step = ?, completed_at = ? WHERE id = (SELECT id FROM onboarding_status LIMIT 1)',
      [status.completed ? 1 : 0, status.current_step, status.completed ? new Date().toISOString() : null]
    );
    return status;
  }

  async factoryReset(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      'characters',
      'chats',
      'messages',
      'settings',
      'images',
      'onboarding_status',
      'system_events'
    ];

    for (const table of tables) {
      await this.db.run(`DROP TABLE IF EXISTS ${table}`);
    }

    await this.createTables();
    await this.initializeSettings();
  }
}

export const database = SQLiteDatabase.getInstance();
