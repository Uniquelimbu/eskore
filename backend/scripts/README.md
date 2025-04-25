# eSkore Backend Scripts

This directory contains utility scripts for development, testing, and database management. 
Scripts are organized by function to make them easier to find and use.

## Directory Structure

```
scripts/
├── db/           # Database management scripts
├── test/         # Testing utilities
├── debug/        # Debugging tools
└── utils/        # General utilities
```

## Usage Guide

### Database Management

- `db/resetDbSafe.js` - Reset database without dropping it (primary reset tool)
  ```bash
  node scripts/db/resetDbSafe.js
  ```

- `db/createMigration.js` - Create a new migration file with proper timestamp
  ```bash
  node scripts/db/createMigration.js "create-new-table"
  ```

- `db/createSampleData.js` - Populate the database with sample data for testing
  ```bash
  node scripts/db/createSampleData.js
  ```

### Testing

- `test/runTests.js` - Run multiple tests in sequence
  ```bash
  # Run all tests
  node scripts/test/runTests.js all
  
  # Run just authentication tests
  node scripts/test/runTests.js auth
  
  # Run just serialization tests
  node scripts/test/runTests.js serialization
  ```

- `test/authTest.js` - Test authentication flow and user login
  ```bash
  node scripts/test/authTest.js
  ```

- `test/serializationTest.js` - Test JSON serialization safety
  ```bash
  node scripts/test/serializationTest.js
  ```

### Debugging

- `debug/preStartCheck.js` - Run checks before starting the server
  ```bash
  node scripts/debug/preStartCheck.js
  ```

- `debug/debugRoutes.js` - Display all API routes and check for path issues
  ```bash
  node scripts/debug/debugRoutes.js
  ```

### User Management

- `utils/userManagement.js` - Create or update users and profiles
  ```bash
  # Create test users
  node scripts/utils/userManagement.js create-test
  
  # Create admin-athlete links
  node scripts/utils/userManagement.js link-admin
  
  # Fix authentication data
  node scripts/utils/userManagement.js fix-auth
  ```

## Contributing

When adding a new script:
1. Place it in the appropriate subdirectory
2. Document it in this README
3. Include proper logging and error handling
4. Add a comment at the top explaining its purpose
