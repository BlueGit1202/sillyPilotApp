import { Message } from './api';
import NetInfo from '@react-native-community/netinfo';

// Get the backend URL dynamically
const getBackendUrl = async () => {
    const defaultUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    console.log('Using backend URL:', defaultUrl);
    return defaultUrl;
}

// Convert http(s) URL to ws(s) URL
const getWebSocketUrl = async () => {
    const backendUrl = await getBackendUrl();
    const url = new URL(backendUrl);
    const wsUrl = `ws${url.protocol === 'https:' ? 's' : ''}://${url.host}`;
    console.log('WebSocket URL:', wsUrl);
    return wsUrl;
}

interface MessageData {
    chat_id: number;
    content: string;
    role: 'user' | 'assistant';
    image?: string;
}

class SocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: ((message: Message) => void)[] = [];
    private typingHandlers: (() => void)[] = [];
    private errorHandlers: ((error: string) => void)[] = [];
    private activeChatId: number | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private wsUrl: string | null = null;
    private connecting = false;
    private joinChatPromise: { resolve: () => void; reject: (error: Error) => void } | null = null;

    async connect(): Promise<void> {
        if (this.connecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            console.log('WebSocket already connected or connecting');
            return;
        }

        this.connecting = true;

        try {
            if (!this.wsUrl) {
                this.wsUrl = await getWebSocketUrl();
            }

            if (!this.wsUrl) {
                throw new Error('Failed to get WebSocket URL');
            }

            console.log('Connecting to WebSocket server:', this.wsUrl);

            return new Promise((resolve, reject) => {
                const ws = new WebSocket(this.wsUrl!);

                const cleanup = () => {
                    ws.removeEventListener('open', handleOpen);
                    ws.removeEventListener('error', handleError);
                };

                const handleOpen = () => {
                    cleanup();
                    this.ws = ws;
                    this.setupEventListeners();
                    this.connecting = false;
                    console.log('WebSocket connected successfully');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                const handleError = (event: Event) => {
                    cleanup();
                    this.connecting = false;
                    const error = new Error(`Failed to connect to: ${this.wsUrl}`);
                    console.error(error);
                    reject(error);
                };

                ws.addEventListener('open', handleOpen);
                ws.addEventListener('error', handleError);

                // Add connection timeout
                setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        cleanup();
                        ws.close();
                        this.connecting = false;
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 5000);
            });
        } catch (error) {
            this.connecting = false;
            console.error('WebSocket connection error:', error);
            throw error;
        }
    }

    private setupEventListeners() {
        if (!this.ws) return;

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.activeChatId = null;  // Reset active chat on disconnect
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.errorHandlers.forEach(handler => handler('WebSocket connection error'));
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                
                // Handle the message types
                this.handleMessage(data);
                
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    }

    private handleMessage(data: any) {
        switch (data.type) {
            case 'new_message':
                this.messageHandlers.forEach(handler => handler(data.data));
                break;
            case 'typing_start':
            case 'typing_end':
                this.typingHandlers.forEach(handler => handler());
                break;
            case 'error':
                console.error('WebSocket error message:', data.data.message);
                this.errorHandlers.forEach(handler => handler(data.data.message));
                this.joinChatPromise?.reject(new Error(data.data.message));
                this.joinChatPromise = null;
                break;
            case 'chat_joined':
                console.log('Successfully joined chat:', data.data.chat_id);
                this.activeChatId = data.data.chat_id;
                this.joinChatPromise?.resolve();
                this.joinChatPromise = null;
                break;
            case 'connection_established':
                console.log('Connection established:', data.data);
                break;
            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    private async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.errorHandlers.forEach(handler => handler('Unable to connect to chat server after multiple attempts'));
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        // Reset WebSocket URL to force re-fetching
        this.wsUrl = null;

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        console.log(`Scheduling reconnect attempt in ${delay}ms`);

        this.reconnectTimeout = setTimeout(async () => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            this.reconnectAttempts++;
            try {
                await this.connect();
                // Rejoin active chat if any
                if (this.activeChatId) {
                    await this.joinChat(this.activeChatId);
                }
            } catch (error) {
                console.error('Reconnection failed:', error);
            }
        }, delay);
    }

    private async ensureConnection() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            await this.connect();
        }
        if (!this.ws) {
            throw new Error('Failed to establish WebSocket connection');
        }
        return this.ws;
    }

    private async sendMessage(type: string, data: any) {
        const ws = await this.ensureConnection();
        const message = JSON.stringify({ type, data });
        console.log('Sending WebSocket message:', message);
        ws.send(message);
    }

    async joinChat(chat_id: number): Promise<void> {
        console.log('Joining chat:', chat_id);
        return new Promise((resolve, reject) => {
            this.joinChatPromise = { resolve, reject };
            this.sendMessage('join_chat', { chat_id }).catch(reject);
        });
    }

    async leaveChat(chat_id: number) {
        if (this.activeChatId === chat_id) {
            this.activeChatId = null;
            try {
                await this.sendMessage('leave_chat', { chat_id });
            } catch (error) {
                console.error('Failed to leave chat:', error);
            }
        }
    }

    async sendMessageToChat(chat_id: number, content: string, role: 'user' | 'assistant', image?: string) {
        if (chat_id !== this.activeChatId) {
            throw new Error('No active chat');
        }
        const messageData: MessageData = {
            chat_id,
            content,
            role,
            image,
        };
        await this.sendMessage('send_message', messageData);
    }

    async startTyping(chat_id: number) {
        if (chat_id === this.activeChatId) {
            await this.sendMessage('typing_start', { chat_id });
        }
    }

    async endTyping(chat_id: number) {
        if (chat_id === this.activeChatId) {
            await this.sendMessage('typing_end', { chat_id });
        }
    }

    onMessage(handler: (message: Message) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    onTyping(handler: () => void) {
        this.typingHandlers.push(handler);
        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    onError(handler: (error: string) => void) {
        this.errorHandlers.push(handler);
        return () => {
            this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
        };
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.activeChatId = null;
        }
        this.connecting = false;
    }

    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const socketService = new SocketService();
export default socketService;