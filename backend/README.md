# eSkore Backend API

The eSkore backend provides a robust API for grassroots sports management, supporting athlete profiles, team management, league organization, and match tracking.

## Known Issues and Solutions

### Path-to-RegExp Errors

If you encounter the error `TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError`, it's related to the path-to-regexp library used by Express and other dependencies.

**Solution**: We've pinned specific versions of express, path-to-regexp, and router packages to avoid this issue:
- express@5.1.0
- path-to-regexp@6.2.1
- router@1.3.8 

If the error persists, run the included clean installation script:
```bash
node scripts/cleanInstall.js
```

This script:
1. Removes node_modules and package-lock.json
2. Reinstalls critical dependencies with specific versions
3. Reinstalls all remaining dependencies

We've also replaced the cors package with a manual implementation in app.js to avoid issues with URL pattern matching in CORS origin validation.

## 📋 Table of Contents

1. [Technologies](#-technologies)
2. [Prerequisites](#-prerequisites)
3. [Installation](#-installation)
4. [Environment Configuration](#-environment-configuration)
5. [Database Setup](#-database-setup)
6. [Running the Server](#-running-the-server)
7. [API Documentation](#-api-documentation)
8. [Architecture](#-architecture)
9. [Testing](#-testing)
10. [Deployment](#-deployment)
11. [Contributing](#-contributing)
12. [Troubleshooting](#-troubleshooting)

## 🛠 Technologies

- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Sequelize 6.x ORM
- **Authentication**: JWT tokens with bcrypt/bcryptjs for password hashing
- **Real-time**: Socket.IO 4.x for live updates
- **Validation**: express-validator 7.x for request validation
- **Security**: helmet, cors, express-rate-limit
- **Development**: Nodemon, ESLint, Jest

## 📋 Prerequisites

- **Node.js**: v14.0.0 or higher (v16+ recommended)
- **PostgreSQL**: v12 or higher
- **npm** or **yarn**
- PostgreSQL client (optional, for direct database access)

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eskore.git
   cd eskore/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install bcryptjs if not already included:
   ```bash
   npm install bcryptjs
   ```

## ⚙️ Environment Configuration

1. Create a `.env` file in the root directory by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Customize your environment variables:
   ```
   # Server settings
   PORT=5000
   NODE_ENV=development
   
   # Database connection
   DB_NAME=postgres        # Your PostgreSQL database name
   DB_USER=postgres        # Your PostgreSQL username
   DB_PASS=your_password   # Your PostgreSQL password
   DB_HOST=localhost       # Database host
   DB_PORT=5433            # PostgreSQL port (commonly 5432 or 5433)
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key_here   # Generate a strong secret key
   
   # CORS settings (Critical for frontend access)
   ALLOWED_ORIGINS=http://localhost:3000  # Add your frontend URL here
   ```

## 🌐 Frontend Integration

### CORS Configuration for Frontend Access

The backend implements flexible CORS (Cross-Origin Resource Sharing) settings to allow your frontend application to communicate with the API:

1. **Development Mode**: 
   - In development mode, the API allows requests from all origins
   - This makes local development easier without configuring specific origins

2. **Production Mode**:
   - In production, the API only allows requests from origins specified in the ALLOWED_ORIGINS environment variable
   - Format: `ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com`

3. **Troubleshooting CORS Issues**:
   - If your frontend receives CORS errors, check:
     - The NODE_ENV is set to 'development' OR
     - Your frontend URL is included in ALLOWED_ORIGINS
     - The request includes proper headers (Content-Type, Authorization)

### Authentication Flow

When integrating with the frontend:

1. **Login Request**: Send POST to `/api/auth/login` with email and password
2. **Token Handling**: Store the returned JWT token in localStorage or secure cookie
3. **Authenticated Requests**: Include the token in all subsequent API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

## 🔐 Authentication

### Cookie-Based Authentication

eSkore uses secure, HttpOnly cookies for authentication:

1. **Login Process**:
   - When a user logs in, the server validates credentials and generates a JWT
   - The JWT is stored in an HttpOnly cookie named `auth_token`
   - The user object is returned in the response (without the token)

2. **Authentication Flow**:
   - The browser automatically sends the cookie with each request
   - The server validates the JWT in the cookie
   - If valid, the server processes the request
   - If invalid or missing, the server returns a 401 error

3. **Security Features**:
   - **HttpOnly**: Prevents JavaScript from accessing the cookie
   - **Secure** (in production): Only sent over HTTPS
   - **SameSite=Lax**: Provides CSRF protection while allowing normal navigation
   - **1-day expiration**: Limits the lifetime of the session

### Integration with Frontend

For frontend developers:

1. Set up your API client with credentials support:
   ```javascript
   const api = axios.create({
     baseURL: 'http://localhost:5000',
     withCredentials: true // Important!
   });
   ```

2. No need to manually handle tokens - cookies are automatically sent by the browser

3. To check authentication status, call the `/api/auth/me` endpoint

4. To logout, call `/api/auth/logout` to clear the cookie

## 🗃️ Database Setup

### Creating and Configuring Your Database

1. Ensure PostgreSQL is installed and running:
   ```bash
   # Check PostgreSQL status on Windows
   sc query postgresql

   # Check PostgreSQL status on Linux/macOS
   systemctl status postgresql
   ```

2. Verify your database exists or create it:
   - **Option 1**: Using PostgreSQL command:
     ```bash
     createdb postgres
     ```
   - **Option 2**: Using SQL:
     ```sql
     CREATE DATABASE postgres;
     ```

3. Configure database access in your `.env` file:
   ```
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASS=your_actual_password
   DB_HOST=localhost
   DB_PORT=5433
   ```

### Setting Up Tables and Data

We provide several methods to initialize your database:

1. **Safe Reset Method (Recommended)**:
   ```bash
   npm run db:reset:safe
   ```
   This approach:
   - Preserves the database but removes all tables
   - Runs all migrations to create tables with correct schema
   - Seeds the database with initial test data
   - Works even when you can't drop the database

2. **Complete Database Setup (First-Time)**:
   ```bash
   # Apply migrations to create tables
   npm run db:migrate
   
   # Seed the database with initial data
   npm run db:seed
   ```

3. **Advanced Database Management**:
   ```bash
   # Undo the most recent migration
   npm run db:migrate:undo
   
   # Undo all migrations
   npm run db:migrate:undo:all
   
   # Remove all seed data
   npm run db:seed:undo
   
   # Generate a new migration file
   npm run migration:generate my-new-migration
   
   # Generate a new seed file
   npm run seed:generate demo-new-data
   ```

### Database Schema Overview

The eSkore database includes these core tables:

- **users**: Admin users with role-based access control
  - Columns: id, email, password (hashed), role, createdAt, updatedAt

- **athletes**: Player profiles with performance stats and location data
  - Columns: id, firstName, lastName, email, passwordHash, dob, height, position, country, province, district, city, createdAt, updatedAt

- **teams**: Team information, rosters and affiliations
  - Columns: id, name, logoUrl, leagueId, createdAt, updatedAt

- **leagues**: Tournament and competition data
  - Columns: id, name, startDate, endDate, createdAt, updatedAt

- **matches**: Game results and scheduling
  - Columns: id, homeTeamId, awayTeamId, homeScore, awayScore, status, date, leagueId, createdAt, updatedAt

## 🏃 Running the Server

### Development Mode

Start the server with hot-reloading for development:
```bash
npm run dev
```
The server will restart automatically when you make code changes.

### Production Mode

For production environments:
```bash
npm run start
```

### API Access

- The API will be accessible at: `http://localhost:5000`
- Health check endpoint: `http://localhost:5000/`
- API base path: `http://localhost:5000/api/`

## 📚 API Documentation

Our API follows RESTful principles with consistent response formats and proper status codes.

### Response Format

Successful responses:
```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "stack": "Stack trace (development only)
  }
}
```

### Authentication Endpoints

- `POST /api/auth/register`: Create admin/user account
  ```json
  { "email": "admin@example.com", "password": "securepass", "role": "admin" }
  ```

- `POST /api/auth/login`: Authenticate and get JWT token
  ```json
  { "email": "admin@example.com", "password": "securepass" }
  ```

- `POST /api/auth/register/athlete`: Register athlete account
  ```json
  {
    "firstName": "John", 
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1995-05-15",
    "height": 180.5,
    "position": "FW",
    "country": "Nepal",
    "province": "bagmati",
    "district": "kathmandu",
    "city": "kathmandu"
  }
  ```

- `GET /api/auth/me`: Get current user profile (authenticated)

### Team Management

- `GET /api/teams?page=1&limit=10`: List teams with pagination
- `GET /api/teams/:id`: Get team details by ID
- `POST /api/teams`: Create team (admin only)
  ```json
  { "name": "Barcelona FC", "logoUrl": "url-to-logo", "leagueId": 1 }
  ```
- `PATCH /api/teams/:id`: Update team (admin only)
- `DELETE /api/teams/:id`: Delete team (admin only)

### League Management

- `GET /api/leagues`: List all leagues
- `GET /api/leagues/:id`: Get league details
- `POST /api/leagues`: Create league (admin only)
  ```json
  { "name": "Premier League", "startDate": "2023-08-01", "endDate": "2024-05-30" }
  ```

### Match Management

- `GET /api/matches?leagueId=1&status=finished`: List matches with optional filters
- `GET /api/matches/:id`: Get match details
- `POST /api/matches`: Create match (admin only)
  ```json
  {
    "homeTeamId": 1,
    "awayTeamId": 2,
    "leagueId": 1,
    "date": "2023-10-15T15:00:00Z"
  }
  ```
- `PATCH /api/matches/:id`: Update match score/status (admin only)

### Standings

- `GET /api/standings/:leagueId`: Get league standings table

### Location Data

- `GET /api/locations/provinces?country=Nepal`: Get provinces by country
- `GET /api/locations/districts?province=bagmati`: Get districts by province
- `GET /api/locations/cities?province=on` or `?district=taplejung`: Get cities

## 🏗 Architecture

### Directory Structure

```
backend/
├── migrations/        # Database migration files
├── seeders/           # Database seed files
├── scripts/           # Utility scripts (DB reset, etc.)
├── src/
│   ├── config/        # Configuration files
│   │   ├── config.js  # Sequelize CLI config
│   │   └── db.js      # Database connection
│   ├── controllers/   # Route controller logic
│   ├── helpers/       # Helper utilities
│   ├── middleware/    # Express middleware
│   │   ├── auth.js    # Authentication middleware
│   │   └── errorHandler.js # Centralized error handling
│   ├── models/        # Sequelize models
│   │   ├── associations.js # Model relationships
│   │   └── index.js   # Model exports
│   ├── routes/        # API route definitions
│   ├── sockets/       # Socket.IO event handlers
│   └── app.js         # Express application setup
├── .env               # Environment variables (not in git)
├── .env.example       # Example environment configuration
├── .sequelizerc       # Sequelize CLI configuration
├── package.json       # Project metadata
└── server.js          # Entry point
```

### Architecture Highlights

1. **MVC Pattern**: Controllers handle request logic, Views are JSON responses, Models manage data

2. **Middleware**:
   - Authentication & Authorization
   - Request validation
   - Error handling
   - Security headers
   - Rate limiting

3. **Real-time Updates with Socket.IO**:
   - Live match score updates
   - Standings table recomputation
   - Room-based subscriptions (by league, match)

4. **Error Handling**:
   - Centralized error processor with consistent format
   - Custom ApiError class for specific error types
   - catchAsync wrapper for promise rejection handling

## 🧪 Testing

Our testing stack uses Jest and Supertest:

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🌐 Deployment

### Prerequisites

- Node.js hosting environment (AWS, Heroku, Digital Ocean, etc.)
- PostgreSQL database service
- Environment variables configuration

### Deployment Steps

1. Set up your production database
2. Configure environment variables for production
3. Install dependencies: `npm install --production`
4. Run database migrations: `NODE_ENV=production npm run db:migrate`
5. Start the application: `NODE_ENV=production npm start`

### Production Considerations

- Use process manager like PM2 or Docker for reliability
- Set up proper logging with a service like Winston
- Configure HTTPS/TLS for security
- Implement monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the code style
4. Run linting and tests: `npm run prepare-release`
5. Commit with clear messages: `git commit -m "Add feature X"`
6. Push your branch: `git push origin feature-name`
7. Submit a pull request

## ❓ Troubleshooting

### Common Issues & Solutions

#### Module Not Found Errors
- Error: `Cannot find module 'bcryptjs'`
  - Solution: Run `npm install bcryptjs`
- Error: Other missing module
  - Solution: Run `npm install` to reinstall all dependencies

#### Database Connection Issues
- Error: `cannot drop the currently open database`
  - Solution: Use `npm run db:reset:safe` instead or close other connections
- Error: Connection refused
  - Check PostgreSQL is running: `sc query postgresql` (Windows) or `systemctl status postgresql` (Linux)
  - Verify credentials in `.env` match your PostgreSQL setup
  - Check port number (commonly 5432 or 5433)

#### Migration Issues
- Error: Migration failed
  - Check migration files for syntax errors
  - Ensure tables don't have conflicting constraints
  - Try `npm run db:migrate:undo:all` then `npm run db:migrate`

#### Authentication Problems
- Error: Invalid token
  - Check JWT_SECRET is properly set in .env
  - Verify token hasn't expired
  - Ensure Authorization header format is `Bearer <token>`

#### Server Starting Issues
- Error: Address already in use
  - Another process is using your port. Find and terminate it or change PORT in .env

## 📄 License

This project is licensed under the ISC License.

---

© 2023 eSkore Team
