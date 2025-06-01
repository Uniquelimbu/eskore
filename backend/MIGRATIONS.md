# Database Migrations

The application requires certain database tables to function correctly. If you're seeing errors about missing tables (e.g., "relation 'notifications' does not exist"), you need to run the database migrations.

## Running Migrations

To run all pending migrations:

```bash
npx sequelize-cli db:migrate
```

This will apply all migration files in the `src/migrations` directory that haven't been run yet.

## Specific Migration Errors

### Missing "notifications" table

If you see errors about "relation 'notifications' does not exist":

```bash
npx sequelize-cli db:migrate --to 20250531_create_notifications_table.js
```

### Missing "user_matches" table

If you see errors about "relation 'user_matches' does not exist":

```bash
npx sequelize-cli db:migrate --to 20250531_create_user_matches_table.js
```

## Creating New Migrations

To create a new migration:

```bash
npx sequelize-cli migration:generate --name your_migration_name
```

## Reverting Migrations

To undo the most recent migration:

```bash
npx sequelize-cli db:migrate:undo
```

To revert to a specific migration:

```bash
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-example-migration.js
```
