<div align="center">
  <img src="../frontend/public/images/logos/eskore-logo.png" alt="eSkore API" width="120">
  <h1>eSkore Backend API</h1>
  <p>Robust REST API for eSports performance tracking and analysis</p>
  
  <p>
    <img src="https://img.shields.io/badge/node-v16.0.0+-blue.svg" alt="Node Version">
    <img src="https://img.shields.io/badge/express-v5.x-green.svg" alt="Express Version">
    <img src="https://img.shields.io/badge/PostgreSQL-v12+-9cf.svg" alt="PostgreSQL Version">
    <img src="https://img.shields.io/badge/license-ISC-green" alt="License">
  </p>
  
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-database">Database</a> •
    <a href="#-authentication">Authentication</a> •
    <a href="#-troubleshooting">Troubleshooting</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

## 📋 Overview

The eSkore backend provides a robust REST API for eSports performance tracking and analytics, supporting:

- Athlete profiles and statistics management
- Team and league organization
- Match tracking and detailed statistics
- Authentication with secure cookie-based JWT
- Real-time updates and data synchronization

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v16.0.0+ ([download](https://nodejs.org/))
- **PostgreSQL**: v12+ ([download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   git clone https://github.com/yourusername/eskore.git
   cd eskore/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the API:** The server will be running at [http://localhost:5000](http://localhost:5000)

## 🏗️ Project Structure

```
backend/
├── migrations/        # Database migration files
├── seeders/           # Database seed files
├── scripts/           # Utility scripts
├── src/
│   ├── config/        # Configuration (DB, app settings)
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Sequelize data models
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic
│   ├── utils/         # Helper utilities
│   ├── app.js         # Express app setup
│   └── server.js      # Server entry point
├── .env.example       # Example environment variables
├── .sequelizerc       # Sequelize CLI configuration
└── package.json       # Project dependencies
```

## ⚙️ Environment Configuration

Create a `.env` file with these variables:

```properties
# Server
PORT=5000
NODE_ENV=development

# Database
DB_NAME=eskore_db
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=1d

# CORS (for frontend access)
ALLOWED_ORIGINS=http://localhost:3000

# Logging (optional)
LOG_LEVEL=debug
```

For production, additional environment variables may be needed. See the [Deployment](#-deployment) section for details.

## 🔐 Authentication

eSkore uses secure, HttpOnly cookies with JWT tokens:

### Login Flow

1. Client POSTs credentials to `/api/auth/login`
2. Server validates credentials, generates JWT, and sets secure HttpOnly cookie
3. Server returns user data (without sensitive information)
4. The cookie is automatically included in subsequent requests

### Authentication Code Example

```javascript
// Login request
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'yourpassword'
  })
});

// Authenticated request
const data = await fetch('http://localhost:5000/api/protected-route', {
  credentials: 'include' // This sends the HttpOnly cookie
});
```

## 🗃️ Database

### Schema Overview

The core data model includes:

- **Users** - Unified table for all users (athletes, managers, admins) with role-based access. Includes profile data like name, DOB, height, position, country etc.
- **Roles** - Defines user roles (e.g., admin, user, manager, organizer).
- **UserRoles** - Junction table linking users to additional roles.
- **Teams** - Team information and management.
- **Leagues** - Tournament/competition organization.
- **Matches** - Game results and detailed statistics.
- **Tournaments** - Tournament details and management.
- **UserTournament** / **TeamTournament** - Associations for tournament participation.
- *(Add other relevant models)*

### Database Commands

```bash
# Apply migrations to create/update tables
npm run db:migrate

# Undo latest migration
npm run db:migrate:undo

# Seed database with sample data (creates admin, test user)
npm run db:seed

# Safe database reset (keeps DB, resets tables & reseeds)
npm run db:reset:safe
```

## 📚 API Documentation

### API Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.eskore.com/api` (example)

### Interactive Documentation

Access interactive API docs at `/api-docs` when the server is running:
- Development: http://localhost:5000/api-docs

### Core Endpoints

#### Authentication

| Method | Endpoint             | Description                   |
|--------|----------------------|-------------------------------|
| POST   | `/api/auth/register` | Register a new user           |
| POST   | `/api/auth/login`    | Authenticate and get JWT      |
| GET    | `/api/auth/me`       | Get current user profile      |
| POST   | `/api/auth/logout`   | Log out (clear cookie)        |
| GET    | `/api/auth/check-email` | Check if an email exists    |

#### Users (Includes Athlete Profiles)

| Method | Endpoint         | Description                   | Access        |
|--------|------------------|-------------------------------|---------------|
| GET    | `/api/users`     | List users (paginated)        | Admin         |
| GET    | `/api/users/:id` | Get user profile by ID        | Admin / Self  |
| PATCH  | `/api/users/:id` | Update user profile           | Admin / Self  |
| DELETE | `/api/users/:id` | Delete user (soft/hard)       | Admin         |
| GET    | `/api/users/search` | Search users by criteria    | Authenticated |

#### Teams

| Method | Endpoint         | Description                   |
|--------|------------------|-------------------------------|
| GET    | `/api/teams`     | List teams (paginated)        |
| GET    | `/api/teams/:id` | Get team details              |
| POST   | `/api/teams`     | Create team                   |
| PATCH  | `/api/teams/:id` | Update team                   |
| DELETE | `/api/teams/:id` | Delete team                   |

#### Matches

| Method | Endpoint           | Description                   |
|--------|--------------------|-------------------------------|
| GET    | `/api/matches`     | List matches (filtered)       |
| GET    | `/api/matches/:id` | Get match details             |
| POST   | `/api/matches`     | Create match                  |
| PATCH  | `/api/matches/:id` | Update match score/status     |

#### Leagues & Standings

| Method | Endpoint                 | Description                   |
|--------|--------------------------|-------------------------------|
| GET    | `/api/leagues`           | List all leagues              |
| GET    | `/api/standings/:leagueId` | Get league standings          |

#### Tournaments

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| GET    | `/api/tournaments`           | List tournaments                  |
| GET    | `/api/tournaments/:id`       | Get tournament details            |
| POST   | `/api/tournaments`           | Create tournament                 |
| PATCH  | `/api/tournaments/:id`       | Update tournament                 |
| DELETE | `/api/tournaments/:id`       | Delete tournament                 |
| POST   | `/api/tournaments/:id/join`  | Join tournament (user/team)       |
| POST   | `/api/tournaments/:id/leave` | Leave tournament (user/team)      |

### Response Format

Successful response:

```json
{
  "data": { },
  "message": "Optional success message"
}
```

Error response:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🧪 Testing

eSkore uses Jest and Supertest for testing:

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🌐 Deployment

### Production Setup

1. Configure production environment:
   ```bash
   # .env in production
   NODE_ENV=production
   PORT=5000
   DB_HOST=your_production_db_host
   # ... other vars
   ```

2. Install production dependencies:
   ```bash
   npm install --production
   ```

3. Run database migrations:
   ```bash
   NODE_ENV=production npm run db:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Production Best Practices

- Use a process manager like [PM2](https://pm2.keymetrics.io/)
- Set up HTTPS with a reverse proxy ([Nginx](https://nginx.org/))
- Implement logging and monitoring
- Use containerization ([Docker](https://www.docker.com/))

## ❓ Troubleshooting

<details>
<summary><b>Common Issues</b></summary>

### Module Not Found Errors
- **Error**: `Cannot find module 'bcryptjs'`
- **Solution**: Run `npm install bcryptjs`

### Database Connection Issues
- **Error**: `Connection refused`
- **Solution**: Check PostgreSQL is running, verify credentials in `.env`

### Authentication Problems
- **Error**: Invalid token
- **Solution**: Ensure JWT_SECRET is properly set, verify token format

### CORS Errors
- **Error**: CORS policy blocked request
- **Solution**: Add frontend URL to ALLOWED_ORIGINS in .env
</details>

<details>
<summary><b>Debugging Tools</b></summary>

Run with enhanced logging:
```bash
DEBUG=express:*,auth:* npm run dev
```

Utility scripts:
```bash
# Check authentication setup
node scripts/debugAuth.js

# Reset database if needed
npm run db:reset:safe
```
</details>

> 📑 **Need more help?** See our detailed [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide for step-by-step solutions to common issues, or check our [GitHub Issues](https://github.com/eskore-team/eskore/issues) for existing solutions.

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

Steps to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with clear messages: `git commit -m "Add amazing feature"`
6. Push your branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">
  <p>© 2023-2024 eSkore Team. All rights reserved.</p>
  <p>Made with ❤️ for the eSports community</p>
</div>
