# API Keys Creator - Library Guide

Use the API Keys Creator as a library in your own Node.js or Bun projects.

## Installation

Copy the `src/utils` and `src/middleware` directories to your project, or install from npm (future):

```bash
npm install apikeys-creator
```

## Core Modules

### 1. Database Module (`src/utils/db.js`)

Manages all data persistence with JSON files.

```javascript
import { db } from './src/utils/db.js';

// User operations
db.users.create(email, hashedPassword);      // Create user
db.users.findByEmail(email);                 // Find user by email
db.users.readAll();                          // Get all users

// Key operations
db.keys.create(userId, keyName);             // Create new API key
db.keys.findByUserId(userId);                // Get all keys for user
db.keys.findById(userId, keyId);             // Get specific key
db.keys.update(userId, keyId, updates);      // Update key
db.keys.delete(userId, keyId);               // Delete key
db.keys.recordUsage(userId, keyId);          // Update last used timestamp
```

**Example Usage:**

```javascript
import { db } from './utils/db.js';
import bcrypt from 'bcryptjs';

// Create user
const hashedPassword = await bcrypt.hash('password', 10);
const user = db.users.create('user@example.com', hashedPassword);
console.log(user); // { id: '...', email: '...', password: '...', createdAt: '...' }

// Create API key
const apiKey = db.keys.create(user.id, 'My Key');
console.log(apiKey); // { id: '...', name: '...', key: 'sk_...', ... }

// Get all keys for user
const userKeys = db.keys.findByUserId(user.id);
console.log(userKeys); // Array of keys

// Update key status
db.keys.update(user.id, apiKey.id, { active: false });

// Delete key
db.keys.delete(user.id, apiKey.id);
```

### 2. JWT Module (`src/utils/jwt.js`)

Handles JWT token generation and verification.

```javascript
import { generateToken, verifyToken, generateApiKey } from './src/utils/jwt.js';

// Generate JWT token
const token = generateToken(userId, email);
// Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Verify JWT token
const decoded = verifyToken(token);
// Returns: { userId: '...', email: '...', iat: ..., exp: ... }

// Invalid token returns null
const invalid = verifyToken('invalid.token.here');
// Returns: null

// Generate random API key
const apiKey = generateApiKey();
// Returns: 'sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

**Example Usage:**

```javascript
import { generateToken, verifyToken } from './utils/jwt.js';

// Generate token after login
const token = generateToken('user123', 'user@example.com');

// Store token and use in requests
const headers = {
  'Authorization': `Bearer ${token}`
};

// Later, verify token from request
const decoded = verifyToken(token);
if (decoded) {
  console.log(`Token is valid for user: ${decoded.email}`);
} else {
  console.log('Token is invalid or expired');
}
```

### 3. Auth Middleware (`src/middleware/auth.js`)

Express middleware for protecting routes.

```javascript
import express from 'express';
import { authMiddleware } from './src/middleware/auth.js';

const app = express();

// Protect a route
app.get('/protected', authMiddleware, (req, res) => {
  // req.user is available here
  console.log(req.user); // { userId: '...', email: '...' }
  res.json({ message: 'This is protected' });
});

// Or protect multiple routes
app.use('/api', authMiddleware);
app.get('/api/data', (req, res) => {
  // Protected
});
```

**Example Usage:**

```javascript
import express from 'express';
import { authMiddleware } from './middleware/auth.js';

const app = express();
app.use(express.json());

// Public route
app.post('/login', (req, res) => {
  // Login logic
  const token = generateToken(user.id, user.email);
  res.json({ token });
});

// Protected routes
app.use(authMiddleware); // All routes after this require auth

app.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/data', (req, res) => {
  res.json({ userId: req.user.userId });
});
```

## Complete Example: Custom API Implementation

```javascript
import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from './utils/db.js';
import { generateToken, verifyToken } from './utils/jwt.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
app.use(express.json());

// User Registration
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  if (db.users.findByEmail(email)) {
    return res.status(409).json({ error: 'User exists' });
  }
  
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  
  // Create user
  const user = db.users.create(email, hashed);
  
  // Generate token
  const token = generateToken(user.id, user.email);
  
  res.json({ user, token });
});

// User Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = db.users.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = generateToken(user.id, user.email);
  
  res.json({ user, token });
});

// Protected: Create API Key
app.post('/api/keys', authMiddleware, (req, res) => {
  const { name } = req.body;
  const key = db.keys.create(req.user.userId, name);
  res.status(201).json(key);
});

// Protected: List Keys
app.get('/api/keys', authMiddleware, (req, res) => {
  const keys = db.keys.findByUserId(req.user.userId);
  res.json(keys);
});

app.listen(3000);
```

## Advanced Usage

### Custom Key Validation

```javascript
import { db } from './utils/db.js';

// Validate API key
function validateApiKey(keyString) {
  // Find the key in all users' keys
  const allUsers = db.users.readAll();
  
  for (const [userId, user] of Object.entries(allUsers)) {
    const userKeys = db.keys.findByUserId(user.id);
    const foundKey = userKeys.find(k => k.key === keyString && k.active);
    if (foundKey) {
      return { valid: true, userId: user.id, keyId: foundKey.id };
    }
  }
  
  return { valid: false };
}

// Use in API validation
app.use('/api/v1', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validation = validateApiKey(apiKey);
  
  if (!validation.valid) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.userId = validation.userId;
  req.keyId = validation.keyId;
  next();
});
```

### Multi-User Key Sharing

```javascript
import { db } from './utils/db.js';

// Find which user owns a key
function findKeyOwner(apiKey) {
  const allUsers = db.users.readAll();
  
  for (const [email, user] of Object.entries(allUsers)) {
    const keys = db.keys.findByUserId(user.id);
    if (keys.some(k => k.key === apiKey)) {
      return user;
    }
  }
  
  return null;
}

// Use for rate limiting per user
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const owner = findKeyOwner(apiKey);
  
  if (owner) {
    req.owner = owner;
    // Apply rate limiting based on user
  }
  
  next();
});
```

### Key Usage Analytics

```javascript
import { db } from './utils/db.js';

// Get key statistics
function getKeyStats(userId) {
  const keys = db.keys.findByUserId(userId);
  
  return {
    totalKeys: keys.length,
    activeKeys: keys.filter(k => k.active).length,
    inactiveKeys: keys.filter(k => !k.active).length,
    neverUsed: keys.filter(k => !k.lastUsed).length,
    recentlyUsed: keys.filter(k => {
      if (!k.lastUsed) return false;
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(k.lastUsed) > dayAgo;
    }).length,
  };
}

// Use in dashboard API
app.get('/dashboard/stats', authMiddleware, (req, res) => {
  const stats = getKeyStats(req.user.userId);
  res.json(stats);
});
```

## Environment Configuration

```javascript
// Load from environment
const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  tokenExpiry: process.env.TOKEN_EXPIRY || '24h',
  port: process.env.PORT || 3000,
  dataDir: process.env.DATA_DIR || './data',
};
```

## Error Handling

```javascript
import { db } from './utils/db.js';

// Graceful error handling
try {
  const user = db.users.create(email, password);
} catch (error) {
  console.error('Failed to create user:', error);
  // Handle error
}

// Validation before DB operations
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (!validateEmail(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

## Migration to Real Database

When ready to scale beyond JSON files:

```javascript
// Replace db.js with PostgreSQL adapter
import { createDbAdapter } from './adapters/postgresql.js';

const db = createDbAdapter({
  host: 'localhost',
  port: 5432,
  database: 'apikeys',
  user: 'postgres',
  password: 'secret'
});

// Rest of code stays the same!
```

## Performance Tips

1. **Cache verified tokens** to avoid repeated verification
2. **Batch key creation** if generating many keys
3. **Archive old unused keys** regularly
4. **Index by userId** when using real database
5. **Rate limit key creation** per user

## Testing Your Integration

```javascript
import { db } from './utils/db.js';
import assert from 'assert';
import bcrypt from 'bcryptjs';

// Test user creation
const hashed = await bcrypt.hash('test', 10);
const user = db.users.create('test@example.com', hashed);
assert(user.id);
assert(user.email === 'test@example.com');

// Test key creation
const key = db.keys.create(user.id, 'Test Key');
assert(key.key.startsWith('sk_'));
assert(key.active === true);

// Test retrieval
const retrieved = db.keys.findById(user.id, key.id);
assert(retrieved.name === 'Test Key');

console.log('✅ All integration tests passed!');
```

## Support

For questions or issues, refer to:
- `IMPLEMENTATION.md` - Full implementation details
- `README.md` - API documentation
- `examples/client.js` - Complete example

Happy coding! 🚀
