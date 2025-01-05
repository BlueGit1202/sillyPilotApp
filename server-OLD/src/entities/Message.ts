import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Relation } from 'typeorm';
import { Chat } from './Chat.js';

export type MessageRole = 'user' | 'assistant' | 'system';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  chat_id!: number;

  @Column({
    type: 'text',
    enum: ['user', 'assistant', 'system']
  })
  role!: MessageRole;

  @Column('text')
  content!: string;

  @Column('text', { nullable: true })
  image?: string;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  chat!: Relation<Chat>;

  @CreateDateColumn()
  timestamp!: Date;
}
