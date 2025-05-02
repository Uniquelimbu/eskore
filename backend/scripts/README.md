# eSkore Backend Scripts

This directory contains utility scripts for development, testing, and database management.
Scripts are organized by function to make them easier to find and use.

## Directory Structure

```
scripts/
├── db/           # Database management scripts (reset, migrate, seed)
├── test/         # Testing utilities (run tests, specific test scripts)
├── debug/        # Debugging tools (pre-start checks, route listing)
└── utils/        # General utilities (user management, migration helpers)
```

## Usage Guide

### Database Management

- `db/resetDbSafe.js` - Reset database without dropping it (primary reset tool)
  ```bash
  node scripts/db/resetDbSafe.js
  ```

- `db/createMigration.js` - Create a new migration file with proper timestamp
  ```bash
  node scripts/db/createMigration.js "your-migration-name"
  ```

- `db/createSampleData.js` - Populate the database with sample data (admin, test user)
  ```bash
  node scripts/db/createSampleData.js
  ```

### Testing

- `test/runTests.js` - Run multiple tests in sequence
  ```bash
  # Run all tests defined in the script
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

- `debug/preStartCheck.js` - Run checks before starting the server (DB connection, JWT secret)
  ```bash
  node scripts/debug/preStartCheck.js
  ```

- `debug/debugRoutes.js` - Display all registered API routes
  ```bash
  node scripts/debug/debugRoutes.js
  ```

### User Management

- `utils/userManagement.js` - Create or update users
  ```bash
  # Create/update the standard test user
  node scripts/utils/userManagement.js create-test

  # Show help for user management script
  node scripts/utils/userManagement.js help
  ```

### Migration Utilities (Use with caution after initial migration)

- `utils/convertToUnifiedUserModel.js` - (If kept) Script to migrate legacy models to User model.
- `utils/migrateAthleteData.js` - (If kept) Script specifically for migrating Athlete data.

## Contributing

When adding a new script:
1. Place it in the appropriate subdirectory (`db`, `test`, `debug`, `utils`).
2. Document its purpose and usage in this README.
3. Include proper logging and error handling.
4. Add a comment block at the top explaining its purpose and usage.
