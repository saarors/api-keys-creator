import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcryptjs';

// Import library modules from apikeyscreator package
import { db } from 'apikeyscreator/src/utils/db.js';
import { generateToken } from 'apikeyscreator/src/utils/jwt.js';
import { authMiddleware } from 'apikeyscreator/src/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve UI files from this folder

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = db.users.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = db.users.create(email, hashed);
    const token = generateToken(user.id, user.email);

    return res.status(201).json({ message: 'Registered', user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.users.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.email);
    return res.json({ message: 'Login successful', user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// List keys (protected)
app.get('/api/keys', authMiddleware, (req, res) => {
  try {
    const keys = db.keys.findByUserId(req.user.userId);
    return res.json({ message: 'Keys retrieved', count: keys.length, keys });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Create key (protected)
app.post('/api/keys', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name required' });
    const key = db.keys.create(req.user.userId, name);
    return res.status(201).json({ message: 'Key created', key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UI + API running on http://localhost:${PORT}`));
