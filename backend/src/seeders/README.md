# Database Seeders

This directory contains all database seeders for the eSkore application. Seeders populate the database with initial or test data.

## Running Seeders

To run all seeders in the correct order, use the npm script:

```bash
npm run db:seed:ordered
```

This script will:
1. Validate the seeders for proper naming and dependencies
2. Run the seeders in the following order:

   a. Users (20240101000002-demo-users.js)
   b. Tournaments (20240101000005-demo-tournaments.js)

## Naming Convention

Seeders follow a specific naming convention to ensure they run in the correct order:

- YYYYMMDD prefix for date ordering
- Descriptive name for the content (e.g., demo-users, demo-tournaments)
- Optional numbering suffix for same-day seeders (e.g., -001, -002)

## Validating Seeders

To validate that all seeders are correctly formatted and follow best practices:

```bash
npm run db:validate
```

This script will check all seeder files for syntax errors, missing functions, and common issues. It will attempt to fix any problems it finds.

## Seeder Files

### 20240101000002-demo-users.js
Creates sample user accounts with various roles:
- Admin user (admin@eskore.com)
- Regular user (user@eskore.com)
- Test user (test@eskore.com)
- Coach (coach@eskore.com)
- Athlete (athlete@eskore.com)

All users are created with the password: `Password123`

### 20240101000005-demo-tournaments.js
Creates sample tournaments:
- Summer Cup 2025
- Winter Championship 2025

## Best Practices for Seeders

1. Always check if records already exist before inserting to avoid duplicates
2. Ensure proper relationships between entities
3. Use consistent password hashing for user accounts
4. Follow the naming convention: `YYYYMMDD-description.js`
5. Include both 'up' and 'down' methods for each seeder

## Business Logic Considerations

- A team must have at least one user with the role of manager
- Users can have different roles within teams (manager, athlete, coach)
- Teams should be properly associated with users to avoid orphaned teams
