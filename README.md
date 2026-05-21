# API Keys Creator System

A production-ready API key management system built with Hono, Node.js, and JSON file storage.

## Features

- **User Authentication**: Register and login with email/password using JWT
- **API Key Management**: Create, read, update, and delete API keys
- **Real Authentication**: BCrypt password hashing and JWT token verification
- **Usage Tracking**: Track when API keys are used
- **Key Status Management**: Enable/disable API keys
- **JSON File Storage**: Persistent storage in JSON files

## Installation

```bash
npm install
```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server runs on `http://localhost:3000` by default.

## Environment Variables

```bash
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

## API Endpoints

### Authentication (Public)

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "user@example.com" },
  "token": "eyJhbGc..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "user@example.com" },
  "token": "eyJhbGc..."
}
```

### API Keys (Protected - Requires Authorization Header)

All requests to `/api/keys/*` require an `Authorization: Bearer <token>` header.

#### List API Keys
```http
GET /api/keys
Authorization: Bearer eyJhbGc...
```

Response:
```json
{
  "message": "API keys retrieved successfully",
  "count": 2,
  "keys": [
    {
      "id": "1234567890",
      "name": "Production Key",
      "key": "sk_a1b2c3...d4e5f6",
      "fullKey": "sk_a1b2c3d4e5f6...",
      "active": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "lastUsed": null
    }
  ]
}
```

#### Create API Key
```http
POST /api/keys
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "My New Key"
}
```

Response:
```json
{
  "message": "API key created successfully",
  "key": {
    "id": "1234567890",
    "name": "My New Key",
    "key": "sk_abcd1234efgh5678ijkl9012mnop3456",
    "active": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Get Single API Key
```http
GET /api/keys/:id
Authorization: Bearer eyJhbGc...
```

#### Update API Key
```http
PUT /api/keys/:id
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Updated Name",
  "active": false
}
```

#### Delete API Key
```http
DELETE /api/keys/:id
Authorization: Bearer eyJhbGc...
```

#### Record Key Usage
```http
POST /api/keys/:id/usage
Authorization: Bearer eyJhbGc...
```

## File Structure

```
apikeyscreator/
├── src/
│   ├── server.js              # Main Hono app
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   └── apiKeys.js         # API key management endpoints
│   └── utils/
│       ├── db.js              # JSON file database
│       └── jwt.js             # JWT token generation/verification
├── data/
│   ├── users.json             # User storage
│   └── keys.json              # API keys storage
├── package.json
└── README.md
```

## Security Notes

⚠️ **Before production:**
1. Change the `JWT_SECRET` environment variable
2. Use HTTPS/TLS
3. Implement rate limiting
4. Consider migrating to a real database (PostgreSQL, MongoDB)
5. Add input validation and sanitization
6. Implement refresh tokens
7. Add audit logging
8. Store sensitive keys securely

## Example Usage with cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Create API Key (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key"}'

# List API Keys
curl -X GET http://localhost:3000/api/keys \
  -H "Authorization: Bearer TOKEN"
```

## License

ISC
