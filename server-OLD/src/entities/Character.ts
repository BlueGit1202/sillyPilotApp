import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Relation } from 'typeorm';
import { Chat } from './Chat.js';

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
  avatarUrl?: string;
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  name!: string;

  @Column('simple-json')
  characterData!: CharacterData;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Chat, (chat: Chat) => chat.character)
  chats!: Relation<Chat>[];
}
