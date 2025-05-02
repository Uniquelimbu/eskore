# eSkore: Complete Setup Guide

This guide will walk you through setting up the entire eSkore application on your computer, from scratch. We've designed these instructions to be easy to follow even if you have little technical experience.

## Table of Contents

1. [Prerequisites Installation](#1-prerequisites-installation)
   - [Installing Node.js](#installing-nodejs)
   - [Installing PostgreSQL](#installing-postgresql)
   - [Installing Git](#installing-git)
2. [Getting the Code](#2-getting-the-code)
3. [Setting Up the Backend](#3-setting-up-the-backend)
   - [Environment Configuration](#environment-configuration)
   - [Database Setup](#database-setup)
   - [Installing Dependencies](#installing-backend-dependencies)
   - [Running Migrations](#running-migrations)
   - [Starting the Server](#starting-the-backend-server)
4. [Setting Up the Frontend](#4-setting-up-the-frontend)
   - [Environment Configuration](#frontend-environment-configuration)
   - [Installing Dependencies](#installing-frontend-dependencies)
   - [Starting the Application](#starting-the-frontend-application)
5. [Verifying Your Setup](#5-verifying-your-setup)
6. [Common Issues and Solutions](#6-common-issues-and-solutions)
7. [Next Steps](#7-next-steps)

## 1. Prerequisites Installation

Before you can run eSkore, you need to install some software that the application depends on.

### Installing Node.js

Node.js is the runtime environment that powers our application.

#### GUI Method:

1. **Download Node.js**:
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the "LTS" (Long Term Support) version (16.x or newer)
   
2. **Install Node.js**:
   - Windows: Run the downloaded installer and follow the prompts
     - Accept the license agreement
     - Keep the default installation location
     - Click "Next" until installation begins
     - Click "Finish" when complete
   
   - macOS: Open the downloaded .pkg file and follow the installation wizard
   
   - Linux: Follow the specific instructions for your distribution on the Node.js website

#### Terminal Method:

**Windows (using Chocolatey):**
```bash
# First install Chocolatey if you don't have it
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install Node.js
choco install nodejs-lts -y
```

**macOS (using Homebrew):**
```bash
# First install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs
```

**Linux (Fedora/RHEL/CentOS):**
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs
```

3. **Verify Installation**:
   - Open a terminal/command prompt
   - Type `node -v` and press Enter
   - You should see the version number (e.g., `v16.15.0`)
   - Type `npm -v` and press Enter (npm is Node's package manager)
   - You should see another version number (e.g., `8.5.5`)

### Installing PostgreSQL

PostgreSQL is the database system that stores all the application data.

#### GUI Method:

1. **Download PostgreSQL**:
   - Go to [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Select your operating system
   - Download the installer for PostgreSQL 12 or newer

2. **Install PostgreSQL**:
   - Windows/macOS: Run the downloaded installer
     - Keep the default components selected
     - Choose a password for the database superuser (postgres) and **write it down**
     - Keep the default port (5432)
     - Proceed with the installation
   
   - Linux: Follow the specific instructions for your distribution

#### Terminal Method:

**Windows (using Chocolatey):**
```bash
# Open PowerShell as Administrator
choco install postgresql -y
```

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
# Add PostgreSQL repo
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update package lists
sudo apt-get update

# Install PostgreSQL
sudo apt-get -y install postgresql-14
```

**After installation via terminal, set a password:**
```bash
# For Linux/macOS
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_password';"

# For Windows (use command prompt)
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_password';"
```

3. **Verify Installation**:
   - The installer typically includes pgAdmin, a graphical tool for managing PostgreSQL
   - Open pgAdmin (search for it in your applications/start menu)
   - Connect to the server by entering the password you created
   - If you can connect, PostgreSQL is installed correctly
   
   **Terminal Verification:**
   ```bash
   # For Linux/macOS
   psql --version
   sudo -u postgres psql -c "SELECT version();"
   
   # For Windows
   psql --version
   psql -U postgres -c "SELECT version();"
   ```

### Installing Git

Git is used to download and manage the application code.

#### GUI Method:

1. **Download Git**:
   - Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Select your operating system and download the installer

2. **Install Git**:
   - Windows: Run the downloaded installer
     - Accept the license agreement
     - Keep the default installation options
     - Choose "Use Git from the Windows Command Prompt" when prompted
     - Choose "Checkout as-is, commit as-is" for line ending conversions
     - Complete the installation
   
   - macOS: Open the downloaded .dmg file and follow the installation wizard
   
   - Linux: Follow the specific instructions for your distribution

#### Terminal Method:

**Windows (using Chocolatey):**
```bash
choco install git -y
```

**macOS (using Homebrew):**
```bash
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git -y
```

**Linux (Fedora/RHEL/CentOS):**
```bash
sudo yum install git -y
```

3. **Verify Installation**:
   - Open a terminal/command prompt
   - Type `git --version` and press Enter
   - You should see the Git version number (e.g., `git version 2.35.1`)

## 2. Getting the Code

Now that you have all the prerequisites installed, you can download the eSkore code.

1. **Create a Directory for the Project**:
   - Windows:
     - Open File Explorer
     - Navigate to a location where you want to store the project (e.g., Documents)
     - Right-click and select "New > Folder"
     - Name the folder "Projects"
   
   - macOS/Linux:
     - Open a terminal
     - Navigate to your home directory by typing `cd ~`
     - Create a Projects directory by typing `mkdir Projects`

2. **Open Terminal/Command Prompt in that Directory**:
   - Windows:
     - Navigate to the Projects folder in File Explorer
     - Hold Shift and right-click in the empty space
     - Select "Open command window here" or "Open PowerShell window here"
   
   - macOS:
     - Open Terminal
     - Type `cd ~/Projects` and press Enter
   
   - Linux:
     - Open Terminal
     - Type `cd ~/Projects` and press Enter

3. **Clone the Repository**:
   - In the terminal/command prompt, type:
     ```bash
     git clone https://github.com/eskore-team/eskore.git
     ```
   - Press Enter and wait for the download to complete
   - You should see messages showing the download progress
   - When it's done, you'll have a new folder called "eskore"

4. **Navigate to the Project Directory**:
   - Type `cd eskore` and press Enter
   - You are now in the main project directory

## 3. Setting Up the Backend

The backend is the server part of the application that handles data storage and business logic.

### Environment Configuration

1. **Navigate to the Backend Directory**:
   - From the main project directory, type:
     ```bash
     cd backend
     ```

2. **Create Environment File**:
   - We need to create a file with configuration settings
   - Windows:
     ```bash
     copy .env.example .env
     ```
   - macOS/Linux:
     ```bash
     cp .env.example .env
     ```

3. **Edit the Environment File**:
   - Open the .env file in a text editor:
     - Windows: `notepad .env`
     - macOS: `open -e .env`
     - Linux: `nano .env` or `gedit .env`
   
   - Update the following settings:
     ```
     # Database
     DB_NAME=eskore_db
     DB_USER=postgres
     DB_PASS=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     
     # Authentication
     JWT_SECRET=create_a_random_string_here_for_security
     ```
   
   - Replace `your_postgres_password` with the password you set during PostgreSQL installation
   - For `JWT_SECRET`, create a random string (e.g., `eskore_secret_key_123`)
   - Save the file and close the editor

### Database Setup

#### GUI Method:

1. **Create a New Database**:
   - Open pgAdmin (the PostgreSQL administration tool)
   - Connect to your PostgreSQL server (enter your password if prompted)
   - Right-click on "Databases" in the left sidebar
   - Select "Create > Database"
   - Enter "eskore_db" as the name
   - Click "Save"

#### Terminal Method:

1. **Create a New Database**:
   - Windows:
     ```bash
     psql -U postgres -c "CREATE DATABASE eskore_db;"
     ```
   - macOS/Linux:
     ```bash
     sudo -u postgres psql -c "CREATE DATABASE eskore_db;"
     ```

### Installing Backend Dependencies

1. **Install the Required Packages**:
   - In the terminal/command prompt (still in the backend directory), type:
     ```bash
     npm install
     ```
   - This will download and install all the necessary libraries
   - The process might take a few minutes
   - You'll see a progress indicator and some log messages

### Running Migrations

Migrations set up the database tables that the application needs.

1. **Run the Database Migrations**:
   - In the terminal (still in the backend directory), type:
     ```bash
     npm run db:migrate
     ```
   - You should see messages indicating that the tables are being created

2. **Seed the Database with Initial Data**:
   - Type:
     ```bash
     npm run db:seed
     ```
   - This adds some example data to get you started

### Starting the Backend Server

1. **Start the Development Server**:
   - In the terminal (still in the backend directory), type:
     ```bash
     npm run dev
     ```
   - You should see a message like: "Server running on port 5000 in development mode"
   - Keep this terminal window open and the server running

## 4. Setting Up the Frontend

The frontend is the user interface part of the application that runs in your web browser.

### Frontend Environment Configuration

1. **Open a New Terminal/Command Prompt**:
   - Don't close the one running the backend server!
   - Open a new terminal window

2. **Navigate to the Frontend Directory**:
   - If you're starting from the main project directory:
     ```bash
     cd frontend
     ```
   - If you need to navigate from somewhere else:
     - Windows:
       ```bash
       cd C:\Users\YourUsername\Projects\eskore\frontend
       ```
       (Replace YourUsername with your actual Windows username)
     
     - macOS/Linux:
       ```bash
       cd ~/Projects/eskore/frontend
       ```

3. **Create Environment File**:
   - Windows:
     ```bash
     copy .env.example .env.local
     ```
   - macOS/Linux:
     ```bash
     cp .env.example .env.local
     ```

4. **Edit the Environment File**:
   - Open the .env.local file in a text editor:
     - Windows: `notepad .env.local`
     - macOS: `open -e .env.local`
     - Linux: `nano .env.local`
   
   - Make sure it contains:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     REACT_APP_ENABLE_MOCK_API=false
     ```
   - Save the file and close the editor

### Installing Frontend Dependencies

1. **Install the Required Packages**:
   - In the terminal (in the frontend directory), type:
     ```bash
     npm install
     ```
   - This will download and install all the necessary libraries
   - The process might take a few minutes

### Starting the Frontend Application

1. **Start the Development Server**:
   - In the terminal (in the frontend directory), type:
     ```bash
     npm start
     ```
   - This will start the frontend application
   - A browser window should automatically open with the eSkore application
   - If it doesn't open automatically, visit [http://localhost:3000](http://localhost:3000) in your browser

## 5. Verifying Your Setup

Let's make sure everything is working correctly:

1. **Check the Frontend**:
   - You should see the eSkore homepage in your browser
   - If you see any error messages or a blank page, check the terminal for error messages

2. **Try Logging In**:
   - Use these test credentials:
     - Email: `admin@eskore.com`
     - Password: `admin123`
   - You should be able to log in and see the dashboard

3. **Explore the Application**:
   - Navigate through the different sections
   - Try creating a new user account
   - Explore the features to make sure everything is working

4. **Verify API Connection**:
   - Open your browser's developer tools (F12 or right-click → Inspect)
   - Go to the Network tab
   - Perform an action like logging in
   - You should see API requests to localhost:5000 completing successfully

## 6. Common Issues and Solutions

Here are solutions to the most common setup problems:

### Backend Issues

- **"Port already in use" error**:
  - Another application is using port 5000
  - Change the PORT in the backend .env file to 5001 or another free port
  - Restart the backend server
  - Terminal command to find the process using the port:
    ```bash
    # Windows
    netstat -ano | findstr :5000
    
    # macOS/Linux
    lsof -i :5000
    ```

- **Database connection errors**:
  - Make sure PostgreSQL is running:
    ```bash
    # Windows
    sc query postgresql
    
    # macOS
    brew services list | grep postgresql
    
    # Linux
    sudo systemctl status postgresql
    ```
  - Check that the database name, username, and password in .env are correct
  - Make sure you created the "eskore_db" database
  - Try connecting manually to verify credentials:
    ```bash
    # Windows
    psql -U postgres -d eskore_db
    
    # macOS/Linux
    sudo -u postgres psql -d eskore_db
    ```

- **Module not found errors**:
  - Run `npm install` again in the backend directory
  - Make sure you're in the correct directory when running commands
  - Try removing node_modules and reinstalling:
    ```bash
    rm -rf node_modules
    npm install
    ```

### Frontend Issues

- **"Failed to fetch" or API connection errors**:
  - Make sure the backend server is running
  - Check that REACT_APP_API_URL in .env.local points to the correct backend URL
  - If you changed the backend port, update this URL accordingly
  - Check for CORS issues in the console and ensure your backend allows connections from the frontend origin

- **White screen or rendering issues**:
  - Check browser console for errors (F12 or Ctrl+Shift+J in most browsers)
  - Make sure you ran `npm install` in the frontend directory
  - Try clearing your browser cache:
    ```bash
    # Windows (Chrome) - Run in Command Prompt
    chrome --clear-cache
    
    # macOS (Chrome)
    open -a "Google Chrome" --args --clear-cache
    ```
  - Or try an incognito window in your browser

- **npm start doesn't open a browser automatically**:
  - Manually open [http://localhost:3000](http://localhost:3000) in your browser
  - Check if there are any terminal error messages during startup

## 7. Next Steps

Congratulations! You've successfully set up the eSkore application on your computer. Here are some next steps:

- **Explore the Test Data**:
  - Log in with the admin account to see all features
  - Create your own test users and explore different roles

- **Learn More About the Project**:
  - Read the README.md files in the main, frontend, and backend directories
  - Check out the API documentation at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

- **Make Changes and Experiment**:
  - Try making small changes to see how the application works
  - The frontend code is in the `frontend/src` directory
  - The backend code is in the `backend/src` directory

- **Join the Community**:
  - Check the GitHub repository for updates
  - Report any issues you find
  - Contribute to the project if you're interested

- **Running in Production**:
  - For production deployment, refer to the deployment sections in both backend and frontend README files
  - Consider using Docker for containerization
  - Set up proper HTTPS encryption for security

---

If you encounter any issues not covered in this guide, check the [Troubleshooting Guide](backend/TROUBLESHOOTING.md) or reach out to the @UniqueLimbu for help.
