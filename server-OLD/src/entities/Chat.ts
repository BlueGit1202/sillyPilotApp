import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Relation } from 'typeorm';
import { Character } from './Character.js';
import { Message } from './Message.js';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  name!: string;

  @Column({ type: 'integer' })
  character_id!: number;

  @ManyToOne(() => Character, (character: Character) => character.chats)
  character!: Relation<Character>;

  @OneToMany(() => Message, (message: Message) => message.chat)
  messages!: Relation<Message>[];

  @Column({ type: 'text', nullable: true })
  last_message?: string;

  @Column({ type: 'datetime', nullable: true })
  last_message_time?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
