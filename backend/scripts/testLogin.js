require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing Login API');
    
    // Try to login with the credentials from the seeders
    const credentials = [
      { email: 'test@example.com', password: 'testpass123' },
      { email: 'john.doe@example.com', password: 'password123' },
      { email: 'admin@eskore.com', password: 'admin123' },
    ];
    
    for (const cred of credentials) {
      try {
        console.log(`\nTrying login with ${cred.email}...`);
        const response = await axios.post('http://localhost:5000/api/auth/login', cred);
        
        console.log('✅ Login successful!');
        console.log('Status:', response.status);
        
        // Log parts of the response safely
        const { token, user } = response.data;
        console.log('Token (truncated):', token ? `${token.substring(0, 20)}...` : 'None');
        console.log('User:', JSON.stringify(user, null, 2));
        
        // Try to use the token to get user data
        if (token) {
          console.log('\nTesting auth with token...');
          const authResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Auth check passed:', authResponse.status);
        }
        
        // No need to try more credentials if one works
        break;
      } catch (err) {
        console.error(`❌ Login failed for ${cred.email}:`, err.response?.data || err.message);
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
