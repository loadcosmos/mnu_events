# Installation Guide for MNU Events Platform

This guide provides detailed instructions for installing and running the MNU Events Platform from scratch. Follow these steps to set up the development environment on your local machine.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Preparation](#environment-preparation)
3. [Repository Cloning](#repository-cloning)
4. [Dependency Installation](#dependency-installation)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Database Configuration](#database-configuration)
7. [Application Startup](#application-startup)
8. [Functionality Verification](#functionality-verification)
9. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11 (with WSL2), macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 5 GB free space
- **CPU**: Dual-core processor (Quad-core recommended)

### Required Software
- **Git** (version 2.25+)
- **Node.js** (version 18+)
- **npm** (version 8+)
- **Docker** (version 20+)
- **Docker Compose** (version 2+)

### Recommended Software
- **VS Code** (or your preferred code editor)
- **PostgreSQL client** (for manual database access, optional)

## Environment Preparation

### For Windows Users
1. Install WSL2 (Windows Subsystem for Linux) if not already installed:
   ```bash
   wsl --install
   ```
2. Restart your computer after WSL installation
3. Set WSL2 as the default version:
   ```bash
   wsl --set-default-version 2
   ```

### Installing Git
- **Windows**: Download from https://git-scm.com/download/win
- **macOS**: Install via Homebrew:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install git
  ```
- **Linux (Ubuntu)**:
  ```bash
  sudo apt update
 sudo apt install git
  ```

### Installing Node.js and npm
- **Option 1**: Download from https://nodejs.org/ (LTS version recommended)
- **Option 2**: Using package manager:
  - **Windows (with Chocolatey)**:
    ```bash
    choco install nodejs
    ```
 - **macOS (with Homebrew)**:
    ```bash
    brew install node
    ```
  - **Linux (Ubuntu)**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

### Installing Docker
- **Windows**: Download Docker Desktop from https://www.docker.com/products/docker-desktop
  - Make sure to enable WSL 2 backend during installation
- **macOS**: Download Docker Desktop from https://www.docker.com/products/docker-desktop
- **Linux (Ubuntu)**:
 ```bash
  sudo apt update
  sudo apt install ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
 sudo usermod -aG docker $USER
  ```
  - Log out and log back in for group changes to take effect

### Verifying Installation
After installing all required software, verify the installations:

```bash
# Check Git version
git --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Verify Docker is running
docker ps
```

## Repository Cloning

1. Open your terminal or command prompt
2. Navigate to the directory where you want to store the project:
   ```bash
   cd ~
   mkdir projects
   cd projects
   ```
3. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
4. Navigate into the project directory:
   ```bash
   cd mnu_events
   ```

## Dependency Installation

### Frontend Dependencies
1. Navigate to the project root directory:
   ```bash
   cd ~/projects/mnu_events  # or wherever you cloned the project
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```

### Backend Dependencies
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. For WSL users, rebuild bcrypt to ensure compatibility:
   ```bash
   npm rebuild bcrypt
   ```

## Environment Variables Setup

### Backend Environment Variables
1. In the `backend` directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file in your preferred text editor:
   ```bash
   nano .env  # or use your preferred editor like code .env
   ```
3. Configure the following key variables:
   - `DATABASE_URL`: Connection string for PostgreSQL (default should work for Docker setup)
   - `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `EMAIL_VERIFICATION_SECRET`: Generate unique random strings (32+ characters)
   - `SMTP_*` variables: Optional, only needed for email verification functionality

   Example of generating secure secrets:
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Frontend Environment Variables
The frontend uses environment variables defined in the Docker configuration. No additional setup is required for development.

## Database Configuration

### Using Docker (Recommended)
The project includes Docker configuration for easy database setup. If you're using the Docker method, the database will be configured automatically when you start the services.

### Manual Database Setup (Alternative)
If you prefer to set up PostgreSQL manually:
1. Install PostgreSQL locally (version 15+)
2. Create a database named `mnu_events_dev`
3. Create a user with appropriate permissions
4. Update the `DATABASE_URL` in `backend/.env` to point to your local database

### Running Database Migrations
After setting up the database, run the following commands in the backend directory:
```bash
# Apply database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database with test data
npx prisma db seed
```

## Application Startup

### Method 1: Using Docker (Recommended)
This method starts all services (frontend, backend, PostgreSQL, PgAdmin) in containers.

1. Make sure you're in the project root directory:
   ```bash
   cd ~/projects/mnu_events
   ```
2. Make the startup script executable:
   ```bash
   chmod +x start.sh
   ```
3. Run the startup script:
   ```bash
   ./start.sh
   ```
   This script will:
   - Stop any existing containers
   - Build and start all services
   - Wait for services to be healthy
   - Run database migrations
   - Seed the database with initial data

### Method 2: Running Locally Without Docker
This method requires manual setup of each service.

#### Starting the Database
1. If using Docker for just the database:
   ```bash
   cd ~/projects/mnu_events
   docker-compose up -d postgres
   ```

#### Starting the Backend
1. Navigate to the backend directory:
   ```bash
   cd ~/projects/mnu_events/backend
   ```
2. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```
   The backend will be available at http://localhost:3001

#### Starting the Frontend
1. In a new terminal, navigate to the project root:
   ```bash
   cd ~/projects/mnu_events
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

## Functionality Verification

### Accessing the Application
After successful startup, the application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **PgAdmin** (if using Docker): http://localhost:5050

### Testing Login
Use one of the test accounts to verify functionality:
- **Admin**: admin@mnu.edu.kz / admin123
- **Organizer**: organizer@kazguu.kz / Password123!
- **Student**: student1@kazguu.kz / Password123!

### Basic Functionality Tests
1. Visit the frontend at http://localhost:5173
2. Try to register a new account
3. Log in with one of the test accounts
4. Create a test event (as organizer or admin)
5. Register for an event (as a student)
6. Check the API documentation at http://localhost:3001/api/docs

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
**Problem**: Error message like `Bind for 0.0.0:3000 failed: port is already allocated`

**Solutions**:
1. Stop the conflicting service:
   - **Windows**:
     ```cmd
     netstat -ano | findstr :3001
     taskkill /PID <PID> /F
     ```
   - **Linux/macOS**:
     ```bash
     lsof -i :3001
     kill -9 <PID>
     ```

2. Change the port in `docker-compose.yml`:
   ```yaml
   services:
     backend:
       ports:
         - "3002:3001"  # Changed from 3001:3001
     frontend:
       ports:
         - "5174:5173" # Changed from 5173:5173
   ```

#### Database Connection Errors
**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
1. Ensure database container is running:
   ```bash
   docker-compose ps postgres
   ```
2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```
3. Restart database:
   ```bash
   docker-compose restart postgres
   ```
4. Verify connection string in `backend/.env`:
   ```
   DATABASE_URL="postgresql://mnu_user:mnu_password@localhost:5432/mnu_events_dev"
   ```

#### Build Failures
**Problem**: Docker build fails with dependency errors

**Solutions**:
1. Clean build with no cache:
   ```bash
   docker-compose build --no-cache
   ```
2. Remove old images and rebuild:
   ```bash
   docker-compose down
   docker image prune -a
   docker-compose up --build
   ```

#### Migrations Not Running
**Problem**: Database schema is outdated

**Solutions**:
1. Manually run migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```
2. If migrations fail, check migration status:
   ```bash
   npx prisma migrate status
   ```
3. Reset database (⚠️ loses data):
   ```bash
   npx prisma migrate reset
   ```

#### Frontend Not Loading
**Problem**: Browser shows "Cannot connect" or white screen

**Solutions**:
1. Check if container is running:
   ```bash
   docker-compose ps frontend
   ```
2. Check frontend logs:
   ```bash
   docker-compose logs frontend
   ```
3. Rebuild frontend:
   ```bash
   docker-compose up --build frontend
   ```
4. Clear browser cache and hard reload (Ctrl+Shift+R)

#### Performance Issues
**Problem**: Application is slow

**Solutions**:
1. Check resource usage:
   ```bash
   docker stats
   ```
2. Increase Docker Desktop resources:
   - Docker Desktop → Settings → Resources
   - Recommended: 4GB RAM, 2 CPUs minimum
3. Restart Docker Desktop

#### WSL 2 Issues (Windows)
**Problem**: Docker not starting or WSL errors

**Solutions**:
1. Restart WSL:
   ```bash
   wsl --shutdown
   ```
   Then restart Docker Desktop
2. Update WSL:
   ```bash
   wsl --update
   ```
3. Ensure WSL 2 is default:
   ```bash
   wsl --set-default-version 2
   ```

#### Permission Denied Errors
**Problem**: Permission errors when running commands

**Solutions**:
- **Linux/macOS**: Fix file permissions:
  ```bash
  chmod +x start.sh
  ```
- **Windows WSL**: Run Docker Desktop as Administrator
  - Or run commands from WSL terminal

### Getting Help
If you encounter issues not covered in this guide:

1. Check the logs:
   ```bash
   docker-compose logs -f
   ```
2. Search existing issues in the repository
3. Create a new issue with:
   - Error message
   - Output of `docker-compose ps`
   - Output of `docker-compose logs`
   - Your operating system and Docker version