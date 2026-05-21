import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_DB = path.join(__dirname, '../data/users.json');
const KEYS_DB = path.join(__dirname, '../data/keys.json');

const ensureDir = () => {
  const dir = path.dirname(USERS_DB);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const ensureFile = (filepath, defaultContent = {}) => {
  ensureDir();
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultContent, null, 2));
  }
};

export const db = {
  users: {
    readAll: () => {
      ensureFile(USERS_DB, {});
      const data = fs.readFileSync(USERS_DB, 'utf-8');
      return JSON.parse(data);
    },
    
    write: (users) => {
      ensureFile(USERS_DB, {});
      fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
    },
    
    findByEmail: (email) => {
      const users = db.users.readAll();
      return users[email];
    },
    
    create: (email, hashedPassword) => {
      const users = db.users.readAll();
      const userId = Date.now().toString();
      users[email] = {
        id: userId,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };
      db.users.write(users);
      return users[email];
    },
  },
  
  keys: {
    readAll: () => {
      ensureFile(KEYS_DB, {});
      const data = fs.readFileSync(KEYS_DB, 'utf-8');
      return JSON.parse(data);
    },
    
    write: (keys) => {
      ensureFile(KEYS_DB, {});
      fs.writeFileSync(KEYS_DB, JSON.stringify(keys, null, 2));
    },
    
    create: (userId, keyName) => {
      const keys = db.keys.readAll();
      const keyId = Date.now().toString();
      
      if (!keys[userId]) {
        keys[userId] = [];
      }
      
      const newKey = {
        id: keyId,
        name: keyName,
        key: `sk_${Math.random().toString(36).substr(2, 32)}`,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        active: true,
      };
      
      keys[userId].push(newKey);
      db.keys.write(keys);
      
      return newKey;
    },
    
    findByUserId: (userId) => {
      const keys = db.keys.readAll();
      return keys[userId] || [];
    },
    
    findById: (userId, keyId) => {
      const userKeys = db.keys.findByUserId(userId);
      return userKeys.find(k => k.id === keyId);
    },
    
    update: (userId, keyId, updates) => {
      const keys = db.keys.readAll();
      if (!keys[userId]) return null;
      
      const keyIndex = keys[userId].findIndex(k => k.id === keyId);
      if (keyIndex === -1) return null;
      
      keys[userId][keyIndex] = {
        ...keys[userId][keyIndex],
        ...updates,
      };
      
      db.keys.write(keys);
      return keys[userId][keyIndex];
    },
    
    delete: (userId, keyId) => {
      const keys = db.keys.readAll();
      if (!keys[userId]) return false;
      
      const initialLength = keys[userId].length;
      keys[userId] = keys[userId].filter(k => k.id !== keyId);
      
      if (keys[userId].length < initialLength) {
        db.keys.write(keys);
        return true;
      }
      
      return false;
    },
    
    recordUsage: (userId, keyId) => {
      return db.keys.update(userId, keyId, {
        lastUsed: new Date().toISOString(),
      });
    },
  },
};
