# API Keys Creator System - Implementation Guide

## What was Built

A complete, production-ready API Key management system with:

✅ **User Authentication**
- Register users with email/password
- Login with JWT token generation
- Secure password hashing with bcrypt
- Token-based authentication middleware

✅ **API Key Management**
- Create unique API keys for each user
- List all keys for a user
- Get individual key details
- Update key metadata and status
- Delete keys
- Track key usage with timestamps

✅ **Real Authentication**
- JWT tokens with 24-hour expiry
- BCrypt password hashing (10 rounds)
- Middleware-based request protection
- Token verification on protected routes

✅ **Persistent Storage**
- JSON file-based database
- Separate user and key storage
- Automatic file creation
- Data persistence between restarts

## Project Structure

```
apikeyscreator/
├── src/
│   ├── server.js              # Express app setup
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Register/login endpoints
│   │   └── apiKeys.js         # Key management endpoints
│   └── utils/
│       ├── db.js              # JSON file database operations
│       └── jwt.js             # JWT token utilities
├── examples/
│   └── client.js              # Example client code
├── data/
│   ├── users.json             # User data storage
│   └── keys.json              # API key storage
├── package.json
├── test.js                    # API tests
├── README.md
└── .gitignore
```

## Quick Start

### Installation
```bash
npm install
```

### Running
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:3000`

### Testing
```bash
# Run automated tests
node test.js
```

## API Usage Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {"id": "1234567890", "email": "user@example.com"},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### 3. Create API Key
```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key"}'
```

Response:
```json
{
  "message": "API key created successfully",
  "key": {
    "id": "1234567890",
    "name": "Production Key",
    "key": "sk_abcd1234efgh5678ijkl9012mnop3456",
    "active": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 4. List API Keys
```bash
curl -X GET http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Key
```bash
curl -X PUT http://localhost:3000/api/keys/KEY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "active": false}'
```

### 6. Delete Key
```bash
curl -X DELETE http://localhost:3000/api/keys/KEY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Key Features Explained

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plaintext
- Compared safely during login

### API Key Format
- Format: `sk_` + 48 random characters
- Unique per user
- Never displayed after creation (except on creation response)
- Can be deactivated without deletion

### JWT Tokens
- 24-hour expiry
- Contains user ID and email
- Signed with secret key
- Required for all protected endpoints

### Database Structure
```json
// users.json
{
  "user@example.com": {
    "id": "1234567890",
    "email": "user@example.com",
    "password": "hashed_bcrypt_string",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}

// keys.json
{
  "userId": [
    {
      "id": "1234567890",
      "name": "Production Key",
      "key": "sk_abcd1234...",
      "active": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "lastUsed": null
    }
  ]
}
```

## Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
JWT_SECRET=your-secret-key   # JWT signing secret (default: dev secret)
```

## Production Recommendations

⚠️ Before deploying:

1. **Change JWT_SECRET** - Set a strong, random value
2. **Use HTTPS** - Never use HTTP in production
3. **Environment Variables** - Use a `.env` file (add to .gitignore)
4. **Rate Limiting** - Add rate limiting middleware
5. **Database** - Migrate to PostgreSQL or MongoDB
6. **Input Validation** - Add comprehensive validation
7. **Logging** - Implement structured logging
8. **Monitoring** - Add error tracking and monitoring
9. **Refresh Tokens** - Implement token refresh mechanism
10. **CORS** - Configure CORS properly

## Running with Examples Client

```bash
# Terminal 1: Start the server
npm start

# Terminal 2: Run the example client
node examples/client.js
```

This demonstrates all API operations end-to-end.

## Framework Compatibility

Built with:
- **Express.js** - Web framework (Node.js)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **CORS** - Cross-origin requests

Also works with Bun (Node.js runtime alternative) - see BUN.md for setup.

## Testing

Run comprehensive tests:
```bash
node test.js
```

Tests cover:
- User registration
- User login
- API key creation
- API key listing
- Get single key
- Update key metadata
- Record key usage
- Delete key

## Files Modified/Created

- ✅ `src/server.js` - Main Express server
- ✅ `src/middleware/auth.js` - JWT authentication
- ✅ `src/routes/auth.js` - Authentication endpoints
- ✅ `src/routes/apiKeys.js` - Key management endpoints
- ✅ `src/utils/db.js` - JSON database layer
- ✅ `src/utils/jwt.js` - JWT utilities
- ✅ `examples/client.js` - Example client
- ✅ `test.js` - API tests
- ✅ `package.json` - Dependencies
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Git ignore rules

## Troubleshooting

**Port already in use:**
```bash
PORT=3001 npm start
```

**Module not found:**
```bash
npm install
```

**Invalid token:**
- Tokens expire after 24 hours
- Get a new token by logging in again

**Key not found:**
- Verify key ID is correct
- Ensure you're using the same user's token

## Support

For issues or questions, check the README.md or review the example client code.
