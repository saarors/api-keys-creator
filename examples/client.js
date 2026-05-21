/**
 * Example API Client - Demonstrates how to interact with the API Keys Creator System
 * 
 * Usage:
 * node examples/client.js
 */

const BASE_URL = 'http://localhost:3000';

class APIKeysClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  async request(method, endpoint, body = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  async register(email, password) {
    const result = await this.request('POST', '/auth/register', {
      email,
      password,
    });
    this.token = result.token;
    return result;
  }

  async login(email, password) {
    const result = await this.request('POST', '/auth/login', {
      email,
      password,
    });
    this.token = result.token;
    return result;
  }

  async listKeys() {
    return this.request('GET', '/api/keys');
  }

  async createKey(name) {
    return this.request('POST', '/api/keys', { name });
  }

  async getKey(id) {
    return this.request('GET', `/api/keys/${id}`);
  }

  async updateKey(id, updates) {
    return this.request('PUT', `/api/keys/${id}`, updates);
  }

  async deleteKey(id) {
    return this.request('DELETE', `/api/keys/${id}`);
  }

  async recordKeyUsage(id) {
    return this.request('POST', `/api/keys/${id}/usage`);
  }
}

// Example usage
async function main() {
  const client = new APIKeysClient();

  try {
    console.log('=== API Keys Creator System - Example Usage ===\n');

    // 1. Register
    console.log('1. Registering user...');
    const registerResult = await client.register('demo@example.com', 'securepass123');
    console.log('✓ User registered:', registerResult.user);
    console.log('✓ Token received:', registerResult.token.substring(0, 20) + '...\n');

    // 2. Create API keys
    console.log('2. Creating API keys...');
    const key1 = await client.createKey('Production API Key');
    console.log('✓ Created key:', key1.key);
    console.log('  Full key:', key1.key.key, '\n');

    const key2 = await client.createKey('Development API Key');
    console.log('✓ Created key:', key2.key.name, '\n');

    // 3. List all keys
    console.log('3. Listing all API keys...');
    const listResult = await client.listKeys();
    console.log(`✓ Found ${listResult.count} keys:`);
    listResult.keys.forEach((key, i) => {
      console.log(`  ${i + 1}. ${key.name} - ${key.key} (${key.active ? 'Active' : 'Inactive'})`);
    });
    console.log();

    // 4. Get single key
    const keyId = key1.key.id;
    console.log('4. Getting single key...');
    const getResult = await client.getKey(keyId);
    console.log('✓ Key details:', getResult.key);
    console.log();

    // 5. Update key
    console.log('5. Updating key...');
    const updateResult = await client.updateKey(keyId, {
      name: 'Updated Production Key',
      active: false,
    });
    console.log('✓ Updated key:', updateResult.key);
    console.log();

    // 6. Record usage
    console.log('6. Recording key usage...');
    await client.recordKeyUsage(keyId);
    console.log('✓ Usage recorded\n');

    // 7. Delete key
    console.log('7. Deleting key...');
    const deleteResult = await client.deleteKey(keyId);
    console.log('✓ Key deleted:', deleteResult.message);
    console.log();

    // 8. Final list
    console.log('8. Listing keys after deletion...');
    const finalList = await client.listKeys();
    console.log(`✓ Now have ${finalList.count} keys`);

    console.log('\n=== Example completed successfully! ===');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { APIKeysClient };
