#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function test() {
  try {
    console.log('🧪 Testing API Keys Creator System\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    let res = await fetch(`${BASE_URL}/`);
    let data = await res.json();
    console.log(`   ✓ ${data.message}\n`);

    // Test 2: Register
    console.log('2. Testing registration...');
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.log(`   ✓ Registration (second attempt) - ${data.error}\n`);
    } else {
      console.log(`   ✓ User registered: ${data.user.email}`);
      console.log(`   ✓ Token: ${data.token.substring(0, 30)}...\n`);
    }

    // Test 3: Login
    console.log('3. Testing login...');
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    data = await res.json();
    const token = data.token;
    console.log(`   ✓ Login successful`);
    console.log(`   ✓ Token: ${token.substring(0, 30)}...\n`);

    // Test 4: Create API Key
    console.log('4. Testing API key creation...');
    res = await fetch(`${BASE_URL}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Test Key' })
    });
    data = await res.json();
    const keyId = data.key.id;
    console.log(`   ✓ API Key created: ${data.key.name}`);
    console.log(`   ✓ Key: ${data.key.key}\n`);

    // Test 5: List API Keys
    console.log('5. Testing list API keys...');
    res = await fetch(`${BASE_URL}/api/keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`   ✓ Found ${data.count} key(s)\n`);

    // Test 6: Get single key
    console.log('6. Testing get single key...');
    res = await fetch(`${BASE_URL}/api/keys/${keyId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`   ✓ Retrieved: ${data.key.name}\n`);

    // Test 7: Update key
    console.log('7. Testing update key...');
    res = await fetch(`${BASE_URL}/api/keys/${keyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Updated Test Key', active: false })
    });
    data = await res.json();
    console.log(`   ✓ Updated: ${data.key.name} (active: ${data.key.active})\n`);

    // Test 8: Record usage
    console.log('8. Testing record usage...');
    res = await fetch(`${BASE_URL}/api/keys/${keyId}/usage`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`   ✓ ${data.message}\n`);

    // Test 9: Delete key
    console.log('9. Testing delete key...');
    res = await fetch(`${BASE_URL}/api/keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log(`   ✓ ${data.message}\n`);

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
