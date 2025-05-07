<div align="center">
  <img src="https://github.com/eSkore-App/eskore-frontend/blob/main/public/images/logos/eskore-logo.png?raw=true" alt="eSkore API" width="120">
  <h1>eSkore Backend API</h1>
  <p>Enterprise-grade REST API for esports performance tracking and analytics</p>
  
  <p>
    <img src="https://img.shields.io/badge/node-v16.0.0+-339933.svg" alt="Node Version">
    <img src="https://img.shields.io/badge/express-v5.x-000000.svg" alt="Express Version">
    <img src="https://img.shields.io/badge/PostgreSQL-v14+-4169E1.svg" alt="PostgreSQL Version">
    <img src="https://img.shields.io/badge/sequelize-v6.x-52B0E7.svg" alt="Sequelize Version">
    <img src="https://img.shields.io/badge/coverage-90%25-brightgreen.svg" alt="Test Coverage">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </p>
  
  <p>
    <a href="#-quick-setup">Quick Setup</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-database">Database</a> •
    <a href="#-authentication">Authentication</a> •
    <a href="#-troubleshooting">Troubleshooting</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

## 📋 Overview

The eSkore backend provides a robust, scalable API service powering the eSkore platform. It is built with Node.js, Express, and PostgreSQL to deliver high-performance data processing for esports analytics, team management, and tournament organization.

<div align="center">
  <img src="../docs/images/api-architecture.png" alt="API Architecture Diagram" width="700">
</div>

## 🚀 Quick Setup

### Prerequisites

- **Node.js**: v16.0.0 or later ([download](https://nodejs.org/))
- **PostgreSQL**: v14.0 or later ([download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### Installation

```bash
# Navigate to the backend directory
cd eskore/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and server settings

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Start the development server
npm run dev
```

The API will be available at http://localhost:5000, with interactive documentation at http://localhost:5000/api-docs.

## 📂 Project Structure

```
backend/
├── bin/                # CLI utilities and executables
├── config/             # Configuration files
│   ├── database.js     # Database configuration
│   └── server.js       # Server configuration
├── migrations/         # Database migration files
├── seeders/            # Database seed data
├── scripts/            # Utility and maintenance scripts
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   │   ├── auth.js     # Authentication middleware
│   │   ├── validation/ # Request validation
│   │   └── error.js    # Error handling
│   ├── models/         # Sequelize data models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic and data processing
│   │   ├── auth/       # Authentication services
│   │   ├── team/       # Team management
│   │   └── stats/      # Statistics processing
│   ├── utils/          # Helper utilities
│   ├── app.js          # Express application setup
│   └── server.js       # Server entry point
├── tests/              # Test suite
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── fixtures/       # Test data
├── .env.example        # Example environment configuration
├── package.json        # Project dependencies
└── README.md           # This documentation
```

## ⚙️ Configuration

The application uses environment variables for configuration. Create a `.env` file with the following:

```properties
# Server Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT=100

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eskore_db
DB_USER=postgres
DB_PASS=yourpassword
DB_LOGGING=true

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=yourpassword
EMAIL_FROM=noreply@eskore.com

# File Storage (optional)
STORAGE_TYPE=local # or s3
S3_BUCKET_NAME=eskore-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Logging
LOG_LEVEL=debug
```

## 🗄️ Database

eSkore uses PostgreSQL with Sequelize ORM for data storage and management.

### Entity Relationship Diagram

<div align="center">
  <img src="../docs/images/database-erd.png" alt="Database ERD" width="700">
</div>

### Core Data Models

- **User**: Player profiles, coaches, administrators
- **Team**: Team profiles and management
- **UserTeam**: Player-team associations with roles
- **Match**: Game matches and results
- **Tournament**: Tournament organization and brackets
- **Statistics**: Performance metrics and analytics
- **Game**: Game titles and configurations

### Database Operations

```bash
# Run pending migrations
npm run db:migrate

# Undo the most recent migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Create a new migration file
npm run db:migration:create -- --name add-new-feature

# Seed the database
npm run db:seed

# Undo the most recent seeder
npm run db:seed:undo

# Reset database (⚠️ Destructive - development only)
npm run db:reset
```

## 🔐 Authentication & Authorization

The API uses JWT-based authentication with secure, HttpOnly cookies for secure sessions.

### Authentication Flow

1. **Login/Register**: Client submits credentials to `/api/auth/login` or `/api/auth/register`
2. **Token Generation**: Server validates credentials and generates JWT tokens:
   - Access token (short-lived)
   - Refresh token (long-lived)
3. **Cookie Storage**: Tokens are stored in HttpOnly cookies
4. **Authorization**: Protected routes verify the access token
5. **Token Refresh**: When the access token expires, the refresh token is used to issue a new one
6. **Logout**: Clears authentication cookies

### Role-Based Access Control

The system implements a flexible RBAC system with these core roles:

- **User**: Basic authenticated user
- **Team Owner**: Team creation and management capabilities
- **Team Admin**: Team management with limited permissions
- **Tournament Organizer**: Create and manage tournaments
- **System Administrator**: Full system access

### Middleware Protection Example

```javascript
// Protecting a route with authentication and role checks
router.post('/tournaments', 
  requireAuth,                  // Verify authentication
  checkRole(['admin', 'organizer']), // Verify user role
  validateTournament,           // Validate request data
  tournamentController.create   // Handle the request
);
```

## 🌐 API Endpoints

The API follows RESTful principles with resource-based URLs, appropriate HTTP methods, and standardized responses.

### Core Endpoints

#### Authentication

| Method | Endpoint              | Description                    | Access      |
|--------|----------------------|--------------------------------|-------------|
| POST   | `/api/auth/register` | Register a new user            | Public      |
| POST   | `/api/auth/login`    | Authenticate and get tokens    | Public      |
| POST   | `/api/auth/refresh`  | Refresh access token           | Public      |
| POST   | `/api/auth/logout`   | Logout and clear tokens        | Authenticated |
| GET    | `/api/auth/me`       | Get current user profile       | Authenticated |

#### Users

| Method | Endpoint                 | Description                     | Access      |
|--------|-------------------------|---------------------------------|-------------|
| GET    | `/api/users`            | List users (paginated)          | Admin       |
| GET    | `/api/users/:id`        | Get user by ID                  | Admin/Self  |
| PATCH  | `/api/users/:id`        | Update user                     | Admin/Self  |
| GET    | `/api/users/:id/stats`  | Get user statistics             | Authenticated |
| GET    | `/api/users/search`     | Search users                    | Authenticated |

#### Teams

| Method | Endpoint                  | Description                     | Access      |
|--------|--------------------------|----------------------------------|-------------|
| GET    | `/api/teams`             | List teams (paginated)           | Authenticated |
| POST   | `/api/teams`             | Create a new team                | Authenticated |
| GET    | `/api/teams/:id`         | Get team by ID                   | Authenticated |
| PATCH  | `/api/teams/:id`         | Update team                      | Team Owner/Admin |
| DELETE | `/api/teams/:id`         | Delete team                      | Team Owner |
| GET    | `/api/teams/:id/members` | List team members                | Authenticated |
| POST   | `/api/teams/:id/members` | Add member to team               | Team Owner/Admin |
| DELETE | `/api/teams/:id/members/:userId` | Remove team member      | Team Owner/Admin |

#### Matches

| Method | Endpoint                  | Description                      | Access      |
|--------|--------------------------|------------------------------------|-------------|
| GET    | `/api/matches`           | List matches (paginated/filtered)  | Authenticated |
| POST   | `/api/matches`           | Create a new match                 | Team Owner/Admin |
| GET    | `/api/matches/:id`       | Get match by ID                    | Authenticated |
| PATCH  | `/api/matches/:id`       | Update match                       | Team Owner/Admin |
| DELETE | `/api/matches/:id`       | Delete match                       | Team Owner/Admin |
| POST   | `/api/matches/:id/result`| Submit match result                | Team Owner/Admin |

#### Tournaments

| Method | Endpoint                       | Description                     | Access      |
|--------|-----------------------------|---------------------------------|-------------|
| GET    | `/api/tournaments`          | List tournaments                | Authenticated |
| POST   | `/api/tournaments`          | Create tournament               | Organizer/Admin |
| GET    | `/api/tournaments/:id`      | Get tournament by ID            | Authenticated |
| PATCH  | `/api/tournaments/:id`      | Update tournament               | Organizer/Admin |
| DELETE | `/api/tournaments/:id`      | Delete tournament               | Organizer/Admin |
| POST   | `/api/tournaments/:id/teams`| Register team for tournament    | Team Owner |

## 🔄 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sample Team",
    "createdAt": "2025-06-15T14:30:00Z",
    "updatedAt": "2025-06-15T14:30:00Z"
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## 🧪 Testing

The project uses Jest for unit and integration testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/unit/auth.test.js

# Run tests in watch mode
npm test -- --watch
```

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **Mock Services**: External dependencies are mocked for testing
- **Test Database**: Tests run against a separate test database

## 📊 Monitoring & Logging

The application includes comprehensive logging and monitoring:

- **Morgan**: HTTP request logging
- **Winston**: Application logging with multiple transports
- **Prometheus**: Metrics collection (optional)
- **Health Checks**: Endpoint for monitoring systems

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t eskore-api .

# Run container
docker run -p 5000:5000 --env-file .env eskore-api
```

### Deployment Options

- **Traditional VPS/VM**: Deploy to any Node.js hosting environment
- **Docker**: Containerized deployment
- **Kubernetes**: Orchestrated deployment for high availability
- **Serverless**: Functions deployment (requires architecture adjustments)

## 📋 API Development Guide

### Adding a New Endpoint

1. **Create Controller**: Add methods in the appropriate controller
2. **Define Routes**: Map endpoints in the route file
3. **Add Validation**: Create validation middleware if needed
4. **Write Tests**: Add unit and integration tests
5. **Update Documentation**: Update API documentation

### Code Standards

- Use async/await for asynchronous operations
- Follow error handling best practices
- Document all functions with JSDoc comments
- Follow naming conventions
- Use TypeScript types when available

## 🤝 Contributing

Please see our [contribution guidelines](../CONTRIBUTING.md) for details on how to contribute to the project.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Implement your changes
4. Write tests for your changes
5. Ensure all tests pass and linting is clean
6. Submit a pull request with a comprehensive description

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>Database Connection Issues</strong></summary>

**Problem**: Cannot connect to the database
**Solutions**:
- Verify database credentials in .env file
- Check that PostgreSQL service is running
- Ensure the database exists: `createdb eskore_db`
- Check network connectivity to the database server
</details>

<details>
<summary><strong>Migration Errors</strong></summary>

**Problem**: Database migrations fail
**Solutions**:
- Check for errors in migration files
- Verify database permissions
- For development, try resetting the database:
  ```bash
  npm run db:reset
  ```
</details>

<details>
<summary><strong>Authentication Issues</strong></summary>

**Problem**: JWT validation failures or cookie issues
**Solutions**:
- Verify JWT_SECRET in .env
- Check cookie settings (especially in development)
- Clear browser cookies and try again
- Verify withCredentials is enabled on frontend requests
</details>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">
  <p>© 2025 eSkore Team. All rights reserved.</p>
  <p>Made with ❤️ for the global esports community</p>
</div>
