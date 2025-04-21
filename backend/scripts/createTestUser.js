require('dotenv').config();
const bcrypt = require('bcrypt');
const Athlete = require('../src/models/Athlete');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create password hash directly (bypassing model hooks to ensure consistency)
    const password = 'testpass123';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Generated password hash:', passwordHash);
    
    // Check if test user exists
    const existingUser = await Athlete.findOne({
      where: { email: 'test@example.com' }
    });
    
    if (existingUser) {
      console.log('Test user exists - updating password...');
      // Update password directly in database to ensure it's correct
      await existingUser.update({ passwordHash });
      console.log('✅ Test user updated successfully!');
      console.log('ID:', existingUser.id);
      console.log('Email: test@example.com');
      console.log('Password: testpass123');
      return;
    }
    
    // Create a new test user
    const athlete = await Athlete.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash, // Use pre-generated hash to avoid model hooks
      dob: '2000-01-01',
      height: 175,
      position: 'FW',
      country: 'Canada',
      province: 'on',
      city: 'toronto',
    });
    
    console.log('✅ Test user created successfully!');
    console.log('ID:', athlete.id);
    console.log('Email: test@example.com');
    console.log('Password: testpass123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit();
  }
}

createTestUser();
