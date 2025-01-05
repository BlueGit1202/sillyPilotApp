import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { database } from './services/database.js';
import { imageProcessor } from './services/image.js';
import { AIProviderFactory } from './services/ai-providers/index.js';
import type { Character, Chat, Message, Settings, OnboardingStatus, APIResponse } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const upload = multer({ dest: 'uploads/' });

// CORS configuration
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins - add your development URLs here
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            // Allow any IP on port 5173
            /^http:\/\/\d+\.\d+\.\d+\.\d+:5173$/,
            // Allow Ngrok URLs
            /^https?:\/\/.*\.ngrok\.io$/,
            /^https?:\/\/.*\.ngrok-free\.app$/
        ];

        // Check if the origin matches any allowed patterns
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Database check endpoint
app.get('/api/check-database', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tables = ['characters', 'chats', 'messages', 'settings'];
        const isEmpty = await Promise.all(tables.map(async (table) => {
            const count = await database.db?.get(`SELECT COUNT(*) as count FROM ${table}`);
            return count?.count === 0;
        }));
        
        const isNewUser = isEmpty.every(empty => empty);
        const onboardingStatus = await database.db?.get('SELECT * FROM onboarding_status ORDER BY id DESC LIMIT 1');
        
        res.json({ 
            success: true,
            data: {
                isEmpty: isNewUser,
                onboardingStatus: onboardingStatus || { completed: false, current_step: 1 }
            }
        } as APIResponse<{ isEmpty: boolean; onboardingStatus: OnboardingStatus }>);
    } catch (error) {
        next(error);
    }
});

// Character endpoints
app.post('/api/characters', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const character = await database.createCharacter(req.body as Character);
        res.status(201).json({ success: true, data: character } as APIResponse<Character>);
    } catch (error) {
        next(error);
    }
});

app.get('/api/characters', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const characters = await database.getCharacters();
        res.json({ success: true, data: characters } as APIResponse<Character[]>);
    } catch (error) {
        next(error);
    }
});

// Chat endpoints
app.post('/api/chats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chat = await database.createChat(req.body as Chat);
        res.status(201).json({ success: true, data: chat } as APIResponse<Chat>);
    } catch (error) {
        next(error);
    }
});

app.get('/api/chats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chats = await database.getChats();
        res.json({ success: true, data: chats } as APIResponse<Chat[]>);
    } catch (error) {
        next(error);
    }
});

app.get('/api/chats/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chat = await database.getChat(parseInt(req.params.id));
        res.json({ success: true, data: chat } as APIResponse<Chat>);
    } catch (error) {
        next(error);
    }
});

// Message endpoints
app.post('/api/chats/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chat_id = parseInt(req.params.id);
        const { message, image } = req.body;
        
        const chat = await database.getChat(chat_id);
        const aiProvider = await AIProviderFactory.createProvider();

        // Save user message
        const userMessage = await database.createMessage({
            chat_id: chat_id,
            role: 'user',
            content: message,
            image
        } as Message);

        // Get AI response
        const aiResponse = await aiProvider.sendMessage(message, chat);

        // Save AI response
        const assistantMessage = await database.createMessage({
            chat_id: chat_id,
            role: 'assistant',
            content: aiResponse
        } as Message);

        res.json({
            success: true,
            data: {
                userMessage,
                assistantMessage
            }
        } as APIResponse<{ userMessage: Message; assistantMessage: Message }>);
    } catch (error) {
        next(error);
    }
});

// Settings endpoints
app.get('/api/settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await database.getSettings();
        res.json({ success: true, data: settings } as APIResponse<Settings>);
    } catch (error) {
        next(error);
    }
});

app.post('/api/settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await database.updateSettings(req.body as Settings);
        res.json({ success: true, data: settings } as APIResponse<Settings>);
    } catch (error) {
        next(error);
    }
});

// Character image upload endpoint
app.post('/api/upload-character-image', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const character = await imageProcessor.processCharacterImage(req.file.path);
        await fs.unlink(req.file.path);
        
        res.json({ success: true, data: character } as APIResponse<Character>);
    } catch (error) {
        next(error);
    }
});

// Onboarding status endpoint
app.post('/api/onboarding/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await database.updateOnboardingStatus(req.body as OnboardingStatus);
        res.json({ success: true, data: status } as APIResponse<OnboardingStatus>);
    } catch (error) {
        next(error);
    }
});

// Factory reset endpoint
app.post('/api/factory-reset', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await database.factoryReset();
        res.json({ 
            success: true, 
            data: {
                message: 'Factory reset complete',
                onboardingStatus: { completed: false, current_step: 1 }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Status check endpoint
app.get('/api/status', (req: Request, res: Response) => {
    res.json({ success: true, data: { status: 'online' } });
});

// Serve frontend for all other routes
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize server
async function initializeServer() {
    try {
        await database.initialize();
        // Listen on all network interfaces
        app.listen(port, '0.0.0.0', () => {
            console.log(`[${new Date().toISOString()}] Server running on port ${port}`);
            console.log(`[${new Date().toISOString()}] Access the app at http://<your-ip>:${port}`);
        });
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Failed to initialize server:`, err);
        process.exit(1);
    }
}

initializeServer();
