# eSkore Backend Troubleshooting Guide

This guide provides detailed solutions for common issues encountered when setting up, developing, or deploying the eSkore backend.

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [Environment Setup Issues](#environment-setup-issues)
- [API Request Issues](#api-request-issues)
- [Quick Fix Commands](#quick-fix-commands)

## Authentication Issues

### 1. "No token provided" Error

This occurs when neither the auth cookie nor Authorization header contains a token.

**Solutions:**
- Make sure `withCredentials: true` is set in your frontend API client
- Check CORS settings allow credentials
- Ensure cookies are not being blocked by browser settings

To debug:
```bash
# While the server is running
curl http://localhost:5000/api/auth/debug
```

### 2. Password Authentication Failures

If login attempts fail with "Invalid credentials":

**Solutions:**
- Create/reset test users with: `node scripts/db/verifySetup.js`
- Verify database setup with: `node scripts/db/validateSchema.js`
- Check credentials carefully (the default test accounts are):
  ```
  Admin: admin@eskore.com / admin123
  Test User: test@eskore.com / Password123
  ```
- Check server logs for specific errors related to authentication
- For case-sensitive systems, ensure email capitalization matches

### 3. CORS Issues

If you see CORS errors in the browser console:

**Solutions:**
- Ensure frontend origin (e.g., http://localhost:3000) is in ALLOWED_ORIGINS
- Check that CORS headers are correctly set in app.js
- Confirm cookies are properly configured with same-site and secure settings

### 4. Token Verification Failures

If login succeeds but API calls fail with token errors:

**Solutions:**
- JWT_SECRET must be the same for token creation and verification
- Check token expiration (default is 24 hours)
- Ensure clock synchronization between services if in a distributed environment

## Database Issues

### 1. Connection Failed

If the server can't connect to PostgreSQL:

**Solutions:**
- Verify PostgreSQL is running: `sc query postgresql` (Windows) or `systemctl status postgresql` (Linux)
- Check credentials in .env match your PostgreSQL setup
- Confirm port number is correct (commonly 5432 or 5433)

### 2. Migration Failures

If database migrations fail:

**Solutions:**
- Check migration files for syntax errors
- Verify database user has appropriate permissions
- Run `npm run db:migrate:undo:all` then `npm run db:migrate`

### 3. "Cannot drop the currently open database"

**Solution:**
- Use `npm run db:reset:safe` which avoids dropping the database
- Close other connections to the database (e.g., pgAdmin, other applications)

### 4. Column Does Not Exist Errors

If you see errors like `column "columnName" does not exist`:

**Solutions:**
- Check if your database migrations have been properly applied: `npx sequelize-cli db:migrate:status`
- Apply any pending migrations: `npx sequelize-cli db:migrate`
- If needed, create a new migration to add the missing columns:
  ```bash
  # Create a new migration file
  npx sequelize-cli migration:generate --name add-missing-columns
  
  # Edit the file to add the required columns, then run
  npx sequelize-cli db:migrate
  ```
- For critical issues, run the provided fix migration:
  ```bash
  node scripts/db/applyColumnFixes.js
  ```

## Environment Setup Issues

### 1. Missing Environment Variables

If the server fails to start with environment variable errors:

**Solutions:**
- Copy .env.example to .env: `cp .env.example .env`
- Fill in all required variables in .env
- Check for typos in variable names

### 2. Port Already In Use

If you see "EADDRINUSE" errors:

**Solutions:**
- Change the PORT in .env
- Find and terminate the process using that port:
  ```bash
  # On Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # On macOS/Linux
  lsof -i :5000
  kill -9 <PID>
  ```

## API Request Issues

### 1. 404 Not Found

If an endpoint returns 404:

**Solutions:**
- Verify the route path is correct
- Check the HTTP method (GET, POST, etc.)
- Ensure the route is properly registered in app.js
- Look for typos in the URL

### 2. 500 Internal Server Error

**Solutions:**
- Check server logs for detailed error messages
- Verify database operations aren't failing
- Check for proper error handling in controllers

## Quick Fix Commands

```bash
# Recreate test user
node scripts/createTestUser.js

# Check authentication setup
node scripts/debugAuth.js

# Reset database if needed
npm run db:reset:safe

# Restart server with enhanced logging
DEBUG=express:*,auth:* npm run dev
```

Need more help? Join our [Discord community](https://discord.gg/example) or open an issue on GitHub.
