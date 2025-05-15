# Database Templates

This folder contains templates used for database operations, scripts, and migrations.

## Folder Structure

- **migrations/**: Templates for database schema changes
- **seeds/**: Templates for generating seed data
- **schemas/**: Database schema definition templates
- **queries/**: Common query templates
- **utilities/**: Helper templates and utilities

## Usage Guidelines

1. **Naming Convention**: All templates should follow the format: `[purpose]_[description].js|sql`
2. **Documentation**: Each template file should include a header comment explaining:
   - Purpose of the template
   - Required parameters
   - Example usage
   - Date created/last updated
   - Version information

## Template Management

When adding new templates:
1. Check if a similar template already exists
2. Follow the naming convention
3. Add appropriate documentation
4. Update this README if you're adding a new category

When updating templates:
1. Add a change log comment at the top of the file
2. Update the "last updated" date and version
3. Ensure backward compatibility or document breaking changes

## Common Tasks

### Creating a New Migration

```js
// Example of creating a new migration from template
const { migrations } = require('../../index');

// Generate a table creation migration
migrations.generate('create-users-table', 'create_table', {
  tableName: 'users',
  columns: [
    { name: 'id', type: 'UUID', primaryKey: true },
    { name: 'username', type: 'STRING', allowNull: false },
    { name: 'created_at', type: 'DATE', defaultValue: 'NOW()' }
  ]
});
```

### Creating a Seeder

```js
// Example of creating a new seeder from template
const seederGenerator = require('./seeds/basic_seeder.js');

const newSeeder = seederGenerator({
  tableName: 'users',
  data: [
    { username: 'admin', email: 'admin@example.com', role: 'admin' },
    { username: 'user', email: 'user@example.com', role: 'user' }
  ]
});
```

## Validation

All templates are automatically validated when using the database CLI tools:

```bash
# Run validation on all templates
node scripts/db/cli.js validate-templates
```

## Need Help?

For more information about using these templates, run:

```bash
node scripts/db/cli.js help
```

Or generate complete documentation:

```bash
node scripts/db/cli.js generate docs
```
