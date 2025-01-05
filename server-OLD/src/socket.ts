import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { AppDataSource } from './data-source.js';
import { Chat } from './entities/Chat.js';
import { Message } from './entities/Message.js';
import { openRouterService } from './services/openRouter.js';
import type { MessageRole } from './entities/Message.js';

interface MessageData {
  chat_id: number;
  content: string;
  role: MessageRole;
  image?: string;
}

interface ExtendedWebSocket extends WebSocket {
  activechat_id?: number;
}

interface SocketMessage {
  type: string;
  data: any;
}

export const setupSocketHandlers = (server: Server): void => {
  const wss = new WebSocketServer({ 
    server,
    verifyClient: (info, callback) => {
      // Allow connections from both localhost and IP
      const origin = info.origin;
      const allowedOrigins = ['http://localhost:8081', 'http://192.168.1.92:8081'];
      
      if (allowedOrigins.includes(origin)) {
        callback(true);
      } else {
        callback(false, 403, 'Origin not allowed');
      }
    }
  });

  wss.on('connection', (ws: ExtendedWebSocket, req) => {
    console.log('Client connected from:', req.headers.origin);

    ws.on('message', async (rawMessage: WebSocket.RawData) => {
      try {
        const message = rawMessage.toString();
        const { type, data } = JSON.parse(message) as SocketMessage;

        switch (type) {
          case 'join_chat':
            await handleJoinChat(ws, data.chat_id);
            break;
          case 'leave_chat':
            handleLeaveChat(ws, data.chat_id);
            break;
          case 'send_message':
            await handleSendMessage(wss, ws, data);
            break;
          case 'typing_start':
            handleTyping(wss, ws, data.chat_id, true);
            break;
          case 'typing_end':
            handleTyping(wss, ws, data.chat_id, false);
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        sendError(ws, error instanceof Error ? error.message : 'Unknown error occurred');
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      if (ws.activechat_id) {
        handleLeaveChat(ws, ws.activechat_id);
      }
    });

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: {
        message: 'Successfully connected to WebSocket server',
        timestamp: new Date().toISOString()
      }
    }));
  });
};

async function handleJoinChat(ws: ExtendedWebSocket, chat_id: number) {
  try {
    const chatRepository = AppDataSource.getRepository(Chat);
    const chat = await chatRepository.findOne({
      where: { id: chat_id },
      relations: ['character']
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    ws.activechat_id = chat_id;
    console.log(`Client joined chat ${chat_id}`);

    // Notify client of successful join
    ws.send(JSON.stringify({
      type: 'chat_joined',
      data: {
        chat_id,
        character: chat.character
      }
    }));
  } catch (error) {
    console.error('Error joining chat:', error);
    sendError(ws, error instanceof Error ? error.message : 'Failed to join chat');
  }
}

function handleLeaveChat(ws: ExtendedWebSocket, chat_id: number) {
  if (ws.activechat_id === chat_id) {
    ws.activechat_id = undefined;
  }
  console.log(`Client left chat ${chat_id}`);
}

async function handleSendMessage(wss: WebSocketServer, ws: ExtendedWebSocket, data: MessageData) {
  if (!ws.activechat_id) {
    throw new Error('No active chat');
  }

  const chatRepository = AppDataSource.getRepository(Chat);
  const messageRepository = AppDataSource.getRepository(Message);

  // Find chat with all necessary relations
  const chat = await chatRepository.findOne({
    where: { id: data.chat_id },
    relations: ['character', 'messages']
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Verify the message is for the active chat
  if (chat.id !== ws.activechat_id) {
    throw new Error('Message not for active chat');
  }

  // Create and save user message
  const userMessage = messageRepository.create({
    chat_id: data.chat_id,
    chat: chat,
    content: data.content,
    role: data.role,
    image: data.image,
    timestamp: new Date()
  });

  await messageRepository.save(userMessage);

  // Update chat's last message
  chat.last_message = data.content;
  chat.last_message_time = new Date();
  await chatRepository.save(chat);

  // Broadcast user message to all clients
  broadcastToChat(wss, data.chat_id, {
    type: 'new_message',
    data: {
      id: userMessage.id,
      chat_id: userMessage.chat_id,
      content: userMessage.content,
      role: userMessage.role,
      image: userMessage.image,
      timestamp: userMessage.timestamp
    }
  });

  try {
    // Notify clients that the AI is typing
    broadcastToChat(wss, data.chat_id, {
      type: 'typing_start',
      data: null
    });

    // Get AI response
    const aiResponse = await openRouterService.sendMessage(data.content, chat);

    // Create and save assistant message
    const assistantMessage = messageRepository.create({
      chat_id: data.chat_id,
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

    // Broadcast assistant message to all clients
    broadcastToChat(wss, data.chat_id, {
      type: 'new_message',
      data: {
        id: assistantMessage.id,
        chat_id: assistantMessage.chat_id,
        content: assistantMessage.content,
        role: assistantMessage.role,
        timestamp: assistantMessage.timestamp
      }
    });
  } catch (error) {
    console.error('Error getting AI response:', error);
    sendError(ws, error instanceof Error ? error.message : 'Failed to get AI response');
  } finally {
    // Notify clients that the AI is no longer typing
    broadcastToChat(wss, data.chat_id, {
      type: 'typing_end',
      data: null
    });
  }
}

function handleTyping(wss: WebSocketServer, ws: ExtendedWebSocket, chat_id: number, isTyping: boolean) {
  if (ws.activechat_id === chat_id) {
    broadcastToChat(wss, chat_id, {
      type: isTyping ? 'typing_start' : 'typing_end',
      data: null
    }, ws);
  }
}

function broadcastToChat(wss: WebSocketServer, chat_id: number, message: any, exclude?: WebSocket) {
  wss.clients.forEach((client: ExtendedWebSocket) => {
    if (client !== exclude && client.activechat_id === chat_id && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function sendError(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({
    type: 'error',
    data: { message }
  }));
}
