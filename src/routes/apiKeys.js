import express from 'express';
import { db } from '../utils/db.js';

export const apiKeysRoutes = express.Router();

// List all API keys for user
apiKeysRoutes.get('/', (req, res) => {
  const keys = db.keys.findByUserId(req.user.userId);

  return res.json({
    message: 'API keys retrieved successfully',
    count: keys.length,
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      key: k.key.substring(0, 10) + '...' + k.key.substring(k.key.length - 4),
      fullKey: k.key,
      active: k.active,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
    })),
  });
});

// Get single API key
apiKeysRoutes.get('/:id', (req, res) => {
  const keyId = req.params.id;

  const key = db.keys.findById(req.user.userId, keyId);
  if (!key) {
    return res.status(404).json({ error: 'API key not found' });
  }

  return res.json({
    message: 'API key retrieved successfully',
    key: {
      id: key.id,
      name: key.name,
      key: key.key.substring(0, 10) + '...' + key.key.substring(key.key.length - 4),
      fullKey: key.key,
      active: key.active,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
    },
  });
});

// Create new API key
apiKeysRoutes.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Key name is required'
      });
    }

    const newKey = db.keys.create(req.user.userId, name);

    return res.status(201).json({
      message: 'API key created successfully',
      key: {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
        active: newKey.active,
        createdAt: newKey.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// Update API key (name, status)
apiKeysRoutes.put('/:id', async (req, res) => {
  try {
    const keyId = req.params.id;
    const { name, active } = req.body;

    const key = db.keys.findById(req.user.userId, keyId);
    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (active !== undefined) updates.active = active;

    const updatedKey = db.keys.update(req.user.userId, keyId, updates);

    return res.json({
      message: 'API key updated successfully',
      key: {
        id: updatedKey.id,
        name: updatedKey.name,
        key: updatedKey.key.substring(0, 10) + '...' + updatedKey.key.substring(updatedKey.key.length - 4),
        active: updatedKey.active,
        createdAt: updatedKey.createdAt,
        lastUsed: updatedKey.lastUsed,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

// Delete API key
apiKeysRoutes.delete('/:id', (req, res) => {
  const keyId = req.params.id;

  const key = db.keys.findById(req.user.userId, keyId);
  if (!key) {
    return res.status(404).json({ error: 'API key not found' });
  }

  db.keys.delete(req.user.userId, keyId);

  return res.json({
    message: 'API key deleted successfully',
  });
});

// Record key usage
apiKeysRoutes.post('/:id/usage', (req, res) => {
  const keyId = req.params.id;

  const key = db.keys.findById(req.user.userId, keyId);
  if (!key) {
    return res.status(404).json({ error: 'API key not found' });
  }

  db.keys.recordUsage(req.user.userId, keyId);

  return res.json({
    message: 'API key usage recorded',
  });
});
