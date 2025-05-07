<div align="center">
  <h1>eSkore Backend Utility Scripts</h1>
  <p>Comprehensive collection of development, testing, and database management tools</p>
</div>

## 📋 Overview

This directory contains specialized utility scripts designed to streamline development workflows, database management, testing procedures, and debugging operations for the eSkore backend. These tools are organized by function to ensure easy discovery and efficient usage throughout the development lifecycle.

## 🏗️ Directory Structure

```
scripts/
├── db/           # Database management (migrations, seeding, reset operations)
├── test/         # Testing utilities (automated tests, verification tools)
├── debug/        # Debugging and diagnostics (route analysis, system checks)
└── utils/        # General utilities (user management, maintenance tools)
```

## 💾 Database Management Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **resetDbSafe.js** | Reset database tables without dropping the database | `node scripts/db/resetDbSafe.js` |
| **createMigration.js** | Generate properly timestamped migration file | `node scripts/db/createMigration.js "add-new-feature"` |
| **createSampleData.js** | Populate database with essential test data | `node scripts/db/createSampleData.js` |
| **createTestUser.js** | Create/update test user account | `node scripts/db/createTestUser.js` |

### Example: Database Reset Operation

```bash
# Reset database tables while preserving the database itself
node scripts/db/resetDbSafe.js

# Optional: With environment specification
NODE_ENV=development node scripts/db/resetDbSafe.js
```

## 🧪 Testing Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **runTests.js** | Orchestrate multiple test suites in sequence | `node scripts/test/runTests.js [suite]` |
| **authTest.js** | Validate authentication flow end-to-end | `node scripts/test/authTest.js` |
| **serializationTest.js** | Verify JSON serialization security | `node scripts/test/serializationTest.js` |

### Example: Running Specific Test Suites

```bash
# Run all test suites
node scripts/test/runTests.js all

# Run only authentication tests
node scripts/test/runTests.js auth

# Run only serialization tests
node scripts/test/runTests.js serialization
```

## 🔍 Debugging Tools

| Script | Description | Usage |
|--------|-------------|-------|
| **preStartCheck.js** | Verify environment before server start | `node scripts/debug/preStartCheck.js` |
| **debugRoutes.js** | Display all registered API routes | `node scripts/debug/debugRoutes.js` |

### Example: Pre-Launch System Check

```bash
# Verify database connection, environment variables, and JWT configuration
node scripts/debug/preStartCheck.js

# Output route table for API documentation or debugging
node scripts/debug/debugRoutes.js
```

## 🛠️ Utility Tools

| Script | Description | Usage |
|--------|-------------|-------|
| **userManagement.js** | User account creation and management | `node scripts/utils/userManagement.js [command]` |
| **cleanupLogs.js** | Remove log files from logs directory | `node scripts/utils/cleanupLogs.js` |
| **convertToUnifiedUserModel.js** | Legacy data migration utility | `node scripts/utils/convertToUnifiedUserModel.js` |
| **migrateAthleteData.js** | Athlete-specific data migration | `node scripts/utils/migrateAthleteData.js` |

### Example: User Management Operations

```bash
# Create or update standard test user
node scripts/utils/userManagement.js create-test

# View available commands
node scripts/utils/userManagement.js help
```

## 🔄 CI/CD Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **verifyBuild.js** | Validate build integrity for deployment | `node scripts/ci/verifyBuild.js` |
| **prepareRelease.js** | Prepare codebase for release | `node scripts/ci/prepareRelease.js [version]` |

## 📋 Contributing New Scripts

When creating new utility scripts:

1. **Placement**: Add script to the appropriate subdirectory based on its function
2. **Documentation**: Update this README with script name, purpose, and usage examples
3. **Structure**: Follow established patterns for argument handling and output formatting
4. **Error Handling**: Implement robust error handling with descriptive messages
5. **Header Comment**: Include a detailed header comment block explaining:
   ```javascript
   /**
    * Script Name: scriptName.js
    * 
    * Purpose: What the script does and when to use it
    * 
    * Usage:
    *   node scripts/category/scriptName.js [arguments]
    * 
    * Options:
    *   --option1      Description of option 1
    *   --option2=val  Description of option 2 with value
    * 
    * Examples:
    *   node scripts/category/scriptName.js --example=value
    * 
    * @author Your Name
    */
   ```

## ⚙️ Best Practices

- **Environment Variables**: Scripts should respect the `NODE_ENV` environment variable
- **Exit Codes**: Use appropriate exit codes (0 for success, non-zero for failure)
- **Logging**: Implement consistent logging with clear success/error indicators
- **Confirmation**: Request confirmation for destructive operations
- **Documentation**: Keep this README updated when adding or modifying scripts

---

<div align="center">
  <p>© 2025 eSkore Team. All rights reserved.</p>
</div>
