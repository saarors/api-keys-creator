import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { apiKeysRoutes } from './routes/apiKeys.js';
import { authRoutes } from './routes/auth.js';

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API Keys Creator System running' });
});

// Public auth routes
app.use('/auth', authRoutes);

// Protected API routes
app.use('/api/keys', authMiddleware, apiKeysRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ API Keys Creator System running on http://localhost:${PORT}`);
});
