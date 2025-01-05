import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { AppDataSource } from './data-source.js';
import { characterRouter } from './routes/character.js';
import { chatRouter } from './routes/chat.js';
import { settingsRouter } from './routes/settings.js';
import { setupSocketHandlers } from './socket.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Settings } from './entities/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://192.168.1.92:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// API routes
app.use('/api/characters', characterRouter);
app.use('/api/chats', chatRouter);
app.use('/api/settings', settingsRouter);

// Health check route
app.get('/api/status', (_req, res) => {
  res.json({ 
    success: true,
    data: { 
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Test route
app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Server is accessible from React Native',
      timestamp: new Date().toISOString()
    }
  });
});

// WebSocket setup
setupSocketHandlers(httpServer);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

// Initialize database and settings
async function initializeDatabase() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Check if settings exist, create default if not
    const settingsRepository = AppDataSource.getRepository(Settings);
    const existingSettings = await settingsRepository.findOne({ where: { id: 1 } });

    if (!existingSettings) {
      console.log('Creating default settings...');
      const defaultSettings = settingsRepository.create({
        aiProvider: 'openrouter',
        sillytavernIp: 'localhost',
        sillytavernPort: '8000',
        openrouterApiKey: '',
        theme: 'mocha',
        onboardingCompleted: false,
        onboardingStep: 0
      });
      await settingsRepository.save(defaultSettings);
      console.log('Default settings created');
    }

    // Create uploads directories if they don't exist
    const fs = await import('fs/promises');
    const dirs = [
      join(__dirname, '..', 'uploads'),
      join(__dirname, '..', 'uploads', 'characters'),
      join(__dirname, '..', 'uploads', 'messages')
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error during initialization:', error);
    return false;
  }
}

// Server options
const serverOptions = {
  port: PORT,
  host: HOST
};

// Start server
async function startServer() {
  try {
    const initialized = await initializeDatabase();
    if (!initialized) {
      console.error('Failed to initialize database. Server will not start.');
      process.exit(1);
    }

    httpServer.listen(serverOptions, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log('Available routes:');
      console.log('- GET  /api/status     - Health check');
      console.log('- GET  /api/test       - Connection test');
      console.log('- GET  /api/characters - List characters');
      console.log('- GET  /api/chats      - List chats');
      console.log('- GET  /api/settings   - Get settings');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    AppDataSource.destroy()
      .then(() => {
        console.log('Data Source has been destroyed');
        process.exit(0);
      })
      .catch((error: Error) => {
        console.error('Error during Data Source destruction:', error);
        process.exit(1);
      });
  });
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
