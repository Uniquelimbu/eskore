<div align="center">
  <img src="frontend/public/images/logos/eskore-logo.png" alt="eSkore Logo" width="200">
  <h1>eSkore Developer Onboarding Guide</h1>
  <p>Complete step-by-step setup for the eSkore platform</p>
</div>

## 📋 Table of Contents

1. [Prerequisites Installation](#-prerequisites-installation)
   - [Node.js Installation](#nodejs-installation)
   - [PostgreSQL Installation](#postgresql-installation)
   - [Git Installation](#git-installation)
2. [Project Setup](#-project-setup)
   - [Getting the Code](#getting-the-code)
   - [Repository Structure](#repository-structure)
3. [Backend Configuration](#-backend-configuration)
   - [Environment Setup](#environment-setup)
   - [Database Initialization](#database-initialization)
   - [Starting the API Server](#starting-the-api-server)
4. [Frontend Configuration](#-frontend-configuration)
   - [Environment Variables](#environment-variables)
   - [Starting the Application](#starting-the-application)
5. [Development Workflow](#-development-workflow)
   - [Code Structure](#code-structure)
   - [Contribution Process](#contribution-process)
6. [Troubleshooting](#-troubleshooting)
   - [Common Issues](#common-issues)
   - [Getting Help](#getting-help)

## 🛠️ Prerequisites Installation

The following tools are required to run the eSkore platform locally.

### Node.js Installation

Node.js is the JavaScript runtime that powers both our frontend and backend.

<details>
<summary><strong>Windows Installation</strong></summary>

#### Option 1: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (16.x or newer)
3. Run the installer and follow the prompts
4. Verify installation by opening Command Prompt and typing:
   ```bash
   node -v
   npm -v
   ```

#### Option 2: Using Chocolatey
```bash
# Install Chocolatey first if not already installed (run in Admin PowerShell)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js LTS
choco install nodejs-lts -y
```
</details>

<details>
<summary><strong>macOS Installation</strong></summary>

#### Option 1: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (16.x or newer)
3. Run the installer and follow the prompts
4. Verify installation by opening Terminal and typing:
   ```bash
   node -v
   npm -v
   ```

#### Option 2: Using Homebrew
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```
</details>

<details>
<summary><strong>Linux Installation</strong></summary>

#### Ubuntu/Debian
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

#### Fedora/RHEL/CentOS
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs
```
</details>

### PostgreSQL Installation

PostgreSQL is our database system for storing application data.

<details>
<summary><strong>Windows Installation</strong></summary>

#### Option 1: Direct Download
1. Visit [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Download the installer for PostgreSQL 14 or newer
3. Run the installer and follow the prompts
   - Set a password for the postgres user and keep it secure
   - Keep the default port (5432)
4. Verify installation by opening Command Prompt and typing:
   ```bash
   psql -V
   ```

#### Option 2: Using Chocolatey
```bash
# Install PostgreSQL
choco install postgresql -y
```
</details>

<details>
<summary><strong>macOS Installation</strong></summary>

#### Using Homebrew
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```
</details>

<details>
<summary><strong>Linux Installation</strong></summary>

#### Ubuntu/Debian
```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update package lists
sudo apt-get update

# Install PostgreSQL
sudo apt-get -y install postgresql-14

# Verify installation
psql --version
```

#### After installation, set a password
```bash
# For Linux/macOS
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_password';"

# For Windows
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_password';"
```
</details>

### Git Installation

Git is required to download and manage the source code.

<details>
<summary><strong>Windows Installation</strong></summary>

#### Option 1: Direct Download
1. Visit [git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. Use the default options for most prompts
4. For "Adjusting your PATH environment," select "Git from the command line and also from 3rd-party software"
5. For line endings, choose "Checkout as-is, commit as-is"
6. Verify installation:
   ```bash
   git --version
   ```

#### Option 2: Using Chocolatey
```bash
choco install git -y
```
</details>

<details>
<summary><strong>macOS Installation</strong></summary>

#### Option 1: Direct Download
1. Visit [git-scm.com/download/mac](https://git-scm.com/download/mac)
2. Download and install

#### Option 2: Using Homebrew
```bash
brew install git
```

#### Option 3: Xcode Command Line Tools
```bash
xcode-select --install
```
</details>

<details>
<summary><strong>Linux Installation</strong></summary>

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install git -y
```

#### Fedora/RHEL/CentOS
```bash
sudo yum install git -y
```
</details>

## 📦 Project Setup

### Getting the Code

1. **Create a project directory**
   ```bash
   # Create a directory for your projects
   mkdir -p ~/Projects
   cd ~/Projects
   ```

2. **Clone the repository**
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/eskore.git
   cd eskore
   ```

3. **Install all dependencies at once**
   ```bash
   # Install both frontend and backend dependencies
   npm run setup
   ```

### Repository Structure

The eSkore repository is organized as follows:

```
eskore/
├── frontend/          # React application
├── backend/           # Express API server
├── docs/              # Documentation files
└── scripts/           # Development utility scripts
```

## 🖥️ Backend Configuration

### Environment Setup

1. **Create environment configuration**
   ```bash
   # Navigate to the backend directory
   cd backend
   
   # Copy the example environment file
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your database credentials and other settings:
   ```properties
   # Server settings
   PORT=5000
   NODE_ENV=development
   
   # Database settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=eskore_db
   DB_USER=postgres
   DB_PASS=your_postgres_password
   
   # JWT settings
   JWT_SECRET=create_a_secure_random_string_here
   JWT_EXPIRES_IN=24h
   
   # CORS settings
   CORS_ORIGIN=http://localhost:3000
   ```

### Database Initialization

1. **Create the database**
   ```bash
   # For Windows (in Command Prompt)
   createdb -U postgres eskore_db
   
   # For macOS/Linux
   sudo -u postgres createdb eskore_db
   ```

2. **Run database migrations**
   ```bash
   # Create database tables
   npm run db:migrate
   
   # Seed the database with initial data
   npm run db:seed
   ```

### Starting the API Server

1. **Start the development server**
   ```bash
   # Start with hot reloading
   npm run dev
   ```

2. **Verify the server is running** by accessing:
   - API: http://localhost:5000/api/health
   - API Documentation: http://localhost:5000/api-docs

## 🎨 Frontend Configuration

### Environment Variables

1. **Create environment configuration**
   ```bash
   # Navigate to the frontend directory
   cd frontend
   
   # Copy the example environment file
   cp .env.example .env.local
   ```

2. **Edit the `.env.local` file** with API settings:
   ```properties
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_API_TIMEOUT=30000
   REACT_APP_ENABLE_ANALYTICS=false
   ```

### Starting the Application

1. **Start the development server**
   ```bash
   # Start with hot reloading
   npm start
   ```

2. **Access the application** at http://localhost:3000
   - Login with the default test account:
     - Email: `test@eskore.com`
     - Password: `Password123`

## 🔄 Development Workflow

### Code Structure

#### Backend Structure

```
backend/
├── src/
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Sequelize models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── tests/             # Test files
└── migrations/        # Database migrations
```

#### Frontend Structure

```
frontend/
├── public/            # Static assets
└── src/
    ├── components/    # Reusable UI components
    ├── contexts/      # React contexts
    ├── hooks/         # Custom React hooks
    ├── pages/         # Page components
    ├── services/      # API service layers
    └── utils/         # Helper functions
```

### Contribution Process

1. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with appropriate tests

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

4. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** on GitHub

See the [CONTRIBUTING.md](backend/CONTRIBUTING.md) file for detailed contribution guidelines.

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>Database Connection Issues</strong></summary>

#### Error: "ECONNREFUSED connecting to PostgreSQL"
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure the database exists: `createdb eskore_db`
</details>

<details>
<summary><strong>Node.js or npm Errors</strong></summary>

#### Error: "Module not found"
- Run `npm install` to install missing dependencies
- Check Node.js version compatibility

#### Error: "Command not found: npm"
- Reinstall Node.js and ensure npm is properly installed
</details>

<details>
<summary><strong>Frontend Connection Issues</strong></summary>

#### Error: "Failed to fetch" or CORS errors
- Ensure backend API is running
- Check CORS settings in backend
- Verify API URL in frontend .env file
</details>

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting Guide](backend/TROUBLESHOOTING.md)
2. Join our [Discord community](https://discord.gg/eskore)
3. Search or open an issue on [GitHub](https://github.com/your-org/eskore/issues)

---

<div align="center">
  <p>Welcome to the eSkore team! We're excited to have you on board.</p>
  <p>© 2025 eSkore Team. All rights reserved.</p>
</div>
