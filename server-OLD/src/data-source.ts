import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Database from 'better-sqlite3';
import { Character } from './entities/Character.js';
import { Chat } from './entities/Chat.js';
import { Message } from './entities/Message.js';
import { Settings } from './entities/Settings.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'database.sqlite',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Character, Chat, Message, Settings],
  migrations: [],
  subscribers: [],
  driver: Database
});
