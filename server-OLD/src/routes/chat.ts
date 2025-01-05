import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Chat } from '../entities/Chat.js';
import { Message } from '../entities/Message.js';
import { Character } from '../entities/Character.js';
import { openRouterService } from '../services/openRouter.js';
import type { MessageRole } from '../entities/Message.js';

const router = Router();

interface CreateChatRequest extends Request {
  body: {
    name: string;
    character_id: number;
  };
}

interface CreateMessageRequest extends Request<{ chat_id: string }> {
  body: {
    content: string;
    role: MessageRole;
    image?: string;
  };
}

// Get all chats
router.get('/', async (_req: Request, res: Response) => {
  try {
    const chatRepository = AppDataSource.getRepository(Chat);
    const chats = await chatRepository.find({
      relations: ['character', 'messages'],
      order: { last_message_time: 'DESC' }
    });
    res.json({ 
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Get single chat with messages
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const chatRepository = AppDataSource.getRepository(Chat);
    const chat = await chatRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['character', 'messages']
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found'
      });
    }

    // Sort messages by timestamp
    chat.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    res.json({ 
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Create new chat
router.post('/', async (req: CreateChatRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const characterRepository = queryRunner.manager.getRepository(Character);
    const chatRepository = queryRunner.manager.getRepository(Chat);
    const messageRepository = queryRunner.manager.getRepository(Message);

    // Verify character exists
    const character = await characterRepository.findOne({
      where: { id: req.body.character_id }
    });

    if (!character) {
      return res.status(404).json({ 
        success: false,
        error: 'Character not found'
      });
    }

    // Create chat
    const chat = chatRepository.create({
      name: req.body.name,
      character_id: req.body.character_id,
      character: character,
      messages: [],
      last_message_time: new Date()
    });

    const savedChat = await chatRepository.save(chat);

    // Create initial system message
    const systemMessage = messageRepository.create({
      chat_id: savedChat.id,
      chat: savedChat,
      content: `Chat started with ${character.name}`,
      role: 'system',
      timestamp: new Date()
    });

    await messageRepository.save(systemMessage);

    // Create character's first message if available
    if (character.characterData?.first_mes) {
      const firstMessage = messageRepository.create({
        chat_id: savedChat.id,
        chat: savedChat,
        content: character.characterData.first_mes,
        role: 'assistant',
        timestamp: new Date()
      });

      await messageRepository.save(firstMessage);

      // Update chat with first message
      savedChat.last_message = firstMessage.content;
      savedChat.last_message_time = firstMessage.timestamp;
      await chatRepository.save(savedChat);
    }

    await queryRunner.commitTransaction();

    // Fetch complete chat with relations
    const completeChat = await chatRepository.findOne({
      where: { id: savedChat.id },
      relations: ['character', 'messages']
    });

    if (!completeChat) {
      throw new Error('Failed to fetch complete chat after creation');
    }

    // Sort messages by timestamp
    completeChat.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    res.status(201).json({ 
      success: true,
      data: completeChat
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error creating chat:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  } finally {
    await queryRunner.release();
  }
});

// Add message to chat
router.post('/:chat_id/messages', async (req: CreateMessageRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const chatRepository = queryRunner.manager.getRepository(Chat);
    const messageRepository = queryRunner.manager.getRepository(Message);

    const chat = await chatRepository.findOne({
      where: { id: parseInt(req.params.chat_id) },
      relations: ['character', 'messages']
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found'
      });
    }

    // Create and save user message
    const userMessage = messageRepository.create({
      chat_id: chat.id,
      chat: chat,
      content: req.body.content,
      role: 'user',
      image: req.body.image,
      timestamp: new Date()
    });

    await messageRepository.save(userMessage);

    // Update chat's last message
    chat.last_message = userMessage.content;
    chat.last_message_time = userMessage.timestamp;
    await chatRepository.save(chat);

    try {
      // Get AI response using OpenRouter
      const aiResponse = await openRouterService.sendMessage(req.body.content, chat);

      // Create and save assistant message
      const assistantMessage = messageRepository.create({
        chat_id: chat.id,
        chat: chat,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      });

      await messageRepository.save(assistantMessage);

      // Update chat with assistant's message
      chat.last_message = assistantMessage.content;
      chat.last_message_time = assistantMessage.timestamp;
      await chatRepository.save(chat);

      await queryRunner.commitTransaction();

      res.status(201).json({ 
        success: true,
        data: {
          userMessage,
          assistantMessage
        }
      });
    } catch (aiError) {
      await queryRunner.commitTransaction();
      // If AI response fails, still return the user message but with error
      console.error('Error getting AI response:', aiError);
      res.status(201).json({
        success: true,
        data: {
          userMessage,
          error: aiError instanceof Error ? aiError.message : 'Failed to get AI response'
        }
      });
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error creating message:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  } finally {
    await queryRunner.release();
  }
});

// Delete chat
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const chatRepository = queryRunner.manager.getRepository(Chat);
    const messageRepository = queryRunner.manager.getRepository(Message);

    const chat = await chatRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['messages']
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found'
      });
    }

    // Delete all messages first
    await messageRepository.remove(chat.messages);
    // Then delete the chat
    await chatRepository.remove(chat);

    await queryRunner.commitTransaction();
    res.status(204).send();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  } finally {
    await queryRunner.release();
  }
});

export const chatRouter = router;
