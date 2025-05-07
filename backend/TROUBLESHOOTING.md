<div align="center">
  <img src="../frontend/public/images/logos/eskore-logo.png" alt="eSkore Troubleshooting" width="120">
  <h1>eSkore Backend Troubleshooting Guide</h1>
  <p>Comprehensive solutions for common development and deployment issues</p>
</div>

## 📋 Table of Contents

- [Authentication Issues](#-authentication-issues)
- [Database Connectivity](#-database-connectivity)
- [Environment Configuration](#-environment-configuration)
- [API Request Problems](#-api-request-problems)
- [Performance Concerns](#-performance-concerns)
- [Deployment Challenges](#-deployment-challenges)
- [Common Error Codes](#-common-error-codes)
- [Diagnostic Tools](#-diagnostic-tools)

## 🔐 Authentication Issues

### JWT Token Problems

<details>
<summary><strong>Error: "No token provided" or "Invalid token"</strong></summary>

#### Symptoms
- API returns 401 Unauthorized
- Error message mentions missing or invalid token
- Authentication appears to succeed but subsequent requests fail

#### Solutions
1. **Check frontend API client configuration**
   ```javascript
   // Ensure withCredentials is set to true
   const apiClient = axios.create({
     baseURL: '/api',
     withCredentials: true
   });
   ```

2. **Verify cookie settings**
   ```javascript
   // In your backend auth middleware
   res.cookie('auth_token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   });
   ```

3. **Check CORS configuration**
   ```javascript
   // In app.js or server.js
   app.use(cors({
     origin: process.env.CORS_ORIGIN.split(','),
     credentials: true
   }));
   ```

4. **Debug token validation**
   ```bash
   # Run auth debug utility
   node scripts/debug/authDebug.js
   ```

5. **Clear browser cookies and try again** (for development)
</details>

### Login Failures

<details>
<summary><strong>Error: "Invalid credentials" despite correct password</strong></summary>

#### Symptoms
- Login consistently fails with "Invalid credentials"
- Password reset doesn't resolve the issue
- Test accounts also fail to authenticate

#### Solutions
1. **Reset test accounts**
   ```bash
   node scripts/db/createTestUser.js
   ```

2. **Check database user table**
   ```bash
   # Using psql
   psql -U postgres -d eskore_db -c "SELECT email, password FROM users LIMIT 5;"
   ```

3. **Verify bcrypt is working correctly**
   ```bash
   # Run password verification test
   node scripts/test/passwordCheck.js
   ```

4. **Check for case sensitivity issues**
   - Email addresses are typically case-insensitive
   - Ensure proper email normalization before lookup

5. **Ensure database migrations are applied**
   ```bash
   npx sequelize-cli db:migrate:status
   ```
</details>

### Session Management

<details>
<summary><strong>Error: "Session expired" or frequent logouts</strong></summary>

#### Symptoms
- Users are logged out unexpectedly
- Session expires before the expected time
- Multiple logins required during normal use

#### Solutions
1. **Check token expiration settings**
   ```javascript
   // In auth controller
   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
     expiresIn: process.env.JWT_EXPIRES_IN || '24h'
   });
   ```

2. **Implement token refresh mechanism**
   ```javascript
   // Create refresh endpoint
   router.post('/refresh-token', authController.refreshToken);
   ```

3. **Adjust cookie settings**
   ```javascript
   // Increase cookie maxAge
   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   ```

4. **Verify environment timezone settings** to ensure token expiration calculations are consistent
</details>

## 🗄️ Database Connectivity

### Connection Failures

<details>
<summary><strong>Error: "ECONNREFUSED" or "Connection timed out"</strong></summary>

#### Symptoms
- Server fails to start with database connection errors
- Queries fail with timeout or connection errors
- Intermittent connection drops during operation

#### Solutions
1. **Verify PostgreSQL is running**
   ```bash
   # On Windows
   sc query postgresql
   
   # On Linux
   systemctl status postgresql
   
   # On macOS
   brew services list | grep postgres
   ```

2. **Check database credentials in .env**
   ```properties
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=eskore_db
   DB_USER=postgres
   DB_PASS=yourpassword
   ```

3. **Test connection with psql**
   ```bash
   psql -h localhost -U postgres -d eskore_db -c "SELECT 1"
   ```

4. **Check network configuration** (especially in containerized environments)
   - Ensure proper host mapping
   - Verify network firewall settings
   - Check Docker network configuration if applicable

5. **Create database if it doesn't exist**
   ```bash
   createdb -U postgres eskore_db
   ```
</details>

### Migration Issues

<details>
<summary><strong>Error: "SequelizeDatabaseError" during migrations</strong></summary>

#### Symptoms
- Migrations fail with database errors
- Columns or tables missing despite migration
- Inconsistent schema across environments

#### Solutions
1. **Check migration status**
   ```bash
   npx sequelize-cli db:migrate:status
   ```

2. **Fix or revert problematic migrations**
   ```bash
   # Undo latest migration
   npx sequelize-cli db:migrate:undo
   
   # Undo all migrations
   npx sequelize-cli db:migrate:undo:all
   
   # Reapply migrations
   npx sequelize-cli db:migrate
   ```

3. **Run safe database reset** (for development environment only)
   ```bash
   npm run db:reset:safe
   ```

4. **Check for schema conflicts** between model definitions and existing database

5. **Apply missing column fix**
   ```bash
   node scripts/db/fixMissingColumns.js
   ```
</details>

<details>
<summary><strong>Error: "column X does not exist" in queries</strong></summary>

#### Symptoms
- Queries fail referencing missing columns
- Models appear to have properties that the database doesn't have
- Error occurs after model changes but database schema is unchanged

#### Solutions
1. **Create a migration to add the missing column**
   ```bash
   npx sequelize-cli migration:generate --name add-missing-column
   ```

2. **Edit the migration file**
   ```javascript
   'use strict';
   
   module.exports = {
     up: async (queryInterface, Sequelize) => {
       await queryInterface.addColumn('table_name', 'column_name', {
         type: Sequelize.STRING,
         allowNull: true
       });
     },
     
     down: async (queryInterface, Sequelize) => {
       await queryInterface.removeColumn('table_name', 'column_name');
     }
   };
   ```

3. **Run the migration**
   ```bash
   npx sequelize-cli db:migrate
   ```

4. **Add the column safely with error handling**
   ```bash
   node scripts/db/addColumnSafely.js table_name column_name STRING
   ```
</details>

## ⚙️ Environment Configuration

<details>
<summary><strong>Error: "Cannot find module" or "Module not found"</strong></summary>

#### Symptoms
- Server fails to start with module not found errors
- Imports fail despite code being present
- Working code stops working without changes

#### Solutions
1. **Install missing dependencies**
   ```bash
   npm install
   
   # For specific missing module
   npm install missing-module-name
   ```

2. **Check for syntax errors in import statements**

3. **Verify node_modules exists and is not corrupted**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Check Node.js version compatibility**
   ```bash
   node -v
   # Ensure it matches the version in package.json engines
   ```

5. **Clear npm cache**
   ```bash
   npm cache clean --force
   ```
</details>

<details>
<summary><strong>Error: "env var not found" or configuration issues</strong></summary>

#### Symptoms
- Server starts but features fail due to missing configuration
- Environment-specific code fails
- Security features don't work properly

#### Solutions
1. **Verify .env file exists and is properly formatted**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

2. **Check for syntax errors in .env**
   - No spaces around equals sign
   - No quotes needed for most values
   - Multi-line values need proper formatting

3. **Use environment validation**
   ```javascript
   // Add to server startup
   const requiredEnvVars = ['NODE_ENV', 'PORT', 'DB_HOST', 'JWT_SECRET'];
   for (const envVar of requiredEnvVars) {
     if (!process.env[envVar]) {
       console.error(`Error: Environment variable ${envVar} is required`);
       process.exit(1);
     }
   }
   ```

4. **Run environment check utility**
   ```bash
   node scripts/debug/checkEnv.js
   ```
</details>

## 🌐 API Request Problems

<details>
<summary><strong>Error: 404 Not Found on API routes</strong></summary>

#### Symptoms
- API endpoints return 404
- Routes work in some environments but not others
- Routes suddenly stop working

#### Solutions
1. **Verify route registration**
   ```bash
   # Print all registered routes
   node scripts/debug/listRoutes.js
   ```

2. **Check API URL path**
   - Frontend uses correct base URL
   - Route paths match between frontend and backend
   - API version prefix is consistent

3. **Verify express router mounting**
   ```javascript
   // In app.js or main router file
   app.use('/api/users', userRoutes);
   ```

4. **Test route with curl or Postman**
   ```bash
   curl -v http://localhost:5000/api/users
   ```

5. **Check for middleware that might be blocking the route**
   - Authentication middleware
   - CORS configuration
   - Rate limiting
</details>

<details>
<summary><strong>Error: CORS policy blocked requests</strong></summary>

#### Symptoms
- Browser console shows CORS errors
- Requests fail from frontend but work in Postman
- Specific HTTP methods fail with CORS errors

#### Solutions
1. **Check CORS configuration**
   ```javascript
   // In app.js
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true
   }));
   ```

2. **Verify allowed origins**
   - Add your development URL to CORS_ORIGIN
   - For multiple origins, use comma-separated list
   - For development, consider using wildcard (not recommended for production)

3. **Check preflight requests**
   - Ensure OPTIONS requests are handled correctly
   - Verify CORS headers are present in the response

4. **Test with CORS disabled** (for development only)
   ```bash
   # Install and use CORS browser extension
   # or
   # Start Chrome with CORS disabled (not for regular use)
   chrome --disable-web-security --user-data-dir="/tmp/chrome-dev"
   ```
</details>

## 🚀 Performance Concerns

<details>
<summary><strong>Slow query performance</strong></summary>

#### Symptoms
- API endpoints become increasingly slow
- Database CPU usage spikes
- Timeouts on complex queries

#### Solutions
1. **Add indexes to frequently queried columns**
   ```javascript
   // In a migration
   await queryInterface.addIndex('users', ['email']);
   ```

2. **Optimize query patterns**
   - Reduce JOIN complexity
   - Use pagination for large result sets
   - Select only needed columns

3. **Implement query caching**
   ```javascript
   // Using Redis for caching
   const cachedData = await redisClient.get(`user:${userId}`);
   if (cachedData) {
     return JSON.parse(cachedData);
   }
   
   const userData = await User.findByPk(userId);
   await redisClient.set(`user:${userId}`, JSON.stringify(userData), 'EX', 3600);
   return userData;
   ```

4. **Run database analysis**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM users WHERE email LIKE '%@example.com';
   ```

5. **Monitor database with pgAdmin or similar tools**
</details>

<details>
<summary><strong>Memory leaks or high resource utilization</strong></summary>

#### Symptoms
- Server memory usage increases over time
- Performance degrades after extended uptime
- Server crashes with out-of-memory errors

#### Solutions
1. **Implement proper connection pooling**
   ```javascript
   // In database config
   const sequelize = new Sequelize(/* ... */, {
     pool: {
       max: 5,
       min: 0,
       acquire: 30000,
       idle: 10000
     }
   });
   ```

2. **Use memory profiling tools**
   ```bash
   # Run with Node.js memory profiling
   node --inspect server.js
   
   # Then connect Chrome DevTools to inspect memory usage
   ```

3. **Implement proper clean-up**
   - Close connections when done
   - Dispose of event listeners
   - Avoid circular references

4. **Set up monitoring and auto-restart**
   ```javascript
   // Using PM2
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'eskore-api',
       script: 'server.js',
       instances: 'max',
       autorestart: true,
       max_memory_restart: '1G'
     }]
   };
   ```

5. **Consider implementing horizontal scaling**
</details>

## 🚢 Deployment Challenges

<details>
<summary><strong>Error: "Address already in use" on deployment</strong></summary>

#### Symptoms
- Server fails to start on deployment
- Error indicates port is already in use
- Restart doesn't resolve the issue

#### Solutions
1. **Check for existing processes**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   # or
   netstat -ano | grep 5000
   ```

2. **Kill the existing process**
   ```bash
   kill -9 <PID>
   ```

3. **Use a different port**
   ```javascript
   // In .env
   PORT=5001
   ```

4. **Configure proper service management**
   ```bash
   # Using systemd
   sudo systemctl restart eskore-api
   ```

5. **Set up proper process management with PM2**
   ```bash
   pm2 start server.js --name eskore-api
   ```
</details>

<details>
<summary><strong>Error: SSL/TLS certificate issues</strong></summary>

#### Symptoms
- HTTPS connections fail
- Certificate warnings in browser
- API requests fail with SSL errors

#### Solutions
1. **Verify certificate configuration**
   ```javascript
   // In server.js for direct HTTPS
   const https = require('https');
   const fs = require('fs');
   
   const options = {
     key: fs.readFileSync('/path/to/privkey.pem'),
     cert: fs.readFileSync('/path/to/fullchain.pem')
   };
   
   https.createServer(options, app).listen(443);
   ```

2. **Use proper certificate paths**
   - Check for typos in file paths
   - Ensure permissions allow reading certificate files
   - Verify certificates are valid and not expired

3. **Set up reverse proxy** (recommended approach)
   ```nginx
   # Nginx configuration
   server {
     listen 443 ssl;
     server_name api.eskore.com;
     
     ssl_certificate /etc/letsencrypt/live/api.eskore.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/api.eskore.com/privkey.pem;
     
     location / {
       proxy_pass http://localhost:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

4. **Renew expired certificates**
   ```bash
   sudo certbot renew
   ```
</details>

## 🚫 Common Error Codes

| Code | Description | Common Causes | Solutions |
|------|-------------|--------------|-----------|
| `401` | Unauthorized | Invalid/missing JWT, expired token | Ensure auth token is sent, check expiration, verify token signing |
| `403` | Forbidden | Insufficient permissions | Check user roles, verify access control logic |
| `404` | Not Found | Invalid route, resource doesn't exist | Verify URL, check resource IDs, confirm route registration |
| `422` | Unprocessable Entity | Validation errors, invalid data | Check request data format, review validation rules |
| `500` | Internal Server Error | Unhandled exceptions, server bugs | Check server logs, improve error handling, fix bugs |
| `503` | Service Unavailable | Server overload, maintenance mode | Scale resources, implement queuing, check dependencies |

## 🔧 Diagnostic Tools

### Useful Diagnostic Commands

```bash
# Check Node.js version
node -v

# List installed npm packages
npm list --depth=0

# Check database connection
node scripts/db/testConnection.js

# List API routes
node scripts/debug/listRoutes.js

# Test authentication flow
node scripts/debug/testAuth.js

# Verify environment setup
node scripts/debug/checkEnv.js

# Run database diagnostics
node scripts/db/diagnose.js
```

### Monitoring and Debugging

- **Logging**: Use structured logging with Winston
  ```javascript
  logger.info('Operation successful', { userId: user.id, action: 'login' });
  ```

- **Performance Monitoring**: Set up monitoring with tools like New Relic or PM2
  ```bash
  pm2 monit
  ```

- **Request Debugging**: Enable detailed request logging
  ```javascript
  app.use(morgan('dev'));
  ```

---

<div align="center">
  <p>Need more help? Join our <a href="https://discord.gg/eskore">Discord community</a> or <a href="https://github.com/your-org/eskore/issues">open an issue</a>.</p>
  <p>© 2025 eSkore Team. All rights reserved.</p>
</div>
