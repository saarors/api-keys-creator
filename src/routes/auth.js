import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../utils/db.js';
import { generateToken } from '../utils/jwt.js';

export const authRoutes = express.Router();

// Register
authRoutes.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.users.create(email, hashedPassword);

    const token = generateToken(user.id, user.email);

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// Login
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = generateToken(user.id, user.email);

    return res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get current user
authRoutes.get('/me', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const user = db.users.findByEmail(req.query.email);
  
  return res.json({
    message: 'User retrieved successfully',
    user: user ? { id: user.id, email: user.email } : null,
  });
});
