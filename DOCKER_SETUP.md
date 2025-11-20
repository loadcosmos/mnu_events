# Docker Setup Guide

Complete guide for running the MNU Events Platform using Docker.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Service URLs & Credentials](#service-urls--credentials)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

This project uses Docker to provide a consistent development environment across all platforms. The setup includes:

- **Frontend**: React + Vite application served via Nginx
- **Backend**: NestJS API with PostgreSQL database
- **Database**: PostgreSQL 15 with persistent data storage
- **Networking**: Isolated Docker network for secure inter-service communication

**Benefits:**
- ✅ No need to install Node.js, PostgreSQL, or other dependencies locally
- ✅ Identical environment for all developers
- ✅ One command to start everything
- ✅ Easy cleanup and reset

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### 1. Docker Desktop

**Windows:**
- Download from: https://www.docker.com/products/docker-desktop
- Minimum requirements: Windows 10 64-bit (Pro, Enterprise, or Education)
- Enable WSL 2 backend during installation

**macOS:**
- Download from: https://www.docker.com/products/docker-desktop
- Supports macOS 10.15 or newer

**Linux:**
- Install Docker Engine: https://docs.docker.com/engine/install/
- Install Docker Compose: https://docs.docker.com/compose/install/

### 2. WSL 2 (Windows Only)

If you're on Windows, Docker Desktop requires WSL 2:

1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart your computer
4. Set WSL 2 as default: `wsl --set-default-version 2`

### 3. Verify Installation

```bash
# Check Docker version
docker --version
# Output: Docker version 24.0.0 or higher

# Check Docker Compose version
docker compose version
# Output: Docker Compose version v2.20.0 or higher

# Verify Docker is running
docker ps
# Should show empty list or running containers (no errors)
```

---

## 🚀 Quick Start

### Step 1: Clone and Navigate

```bash
# If you haven't cloned the repository yet
git clone <repository-url>
cd mnu_events
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# (Optional) Edit backend/.env if you need custom configuration
# The defaults work out of the box for Docker
```

### Step 3: Start Everything

**Linux/macOS/WSL:**
```bash
./start.sh
```

**Windows (PowerShell):**
```powershell
docker compose up --build -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

🎉 **You're all set!** The application is now running.

---

## 🔐 Service URLs & Credentials

### Application Access

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main web application |
| Backend API | http://localhost:3001 | REST API endpoints |
| API Documentation | http://localhost:3001/api | Swagger/OpenAPI docs |
| Database | localhost:5432 | PostgreSQL (internal only) |

### Default Admin Credentials

After seeding the database, you can log in with:

```
Email: admin@kazguu.kz
Password: Password123!
```

⚠️ **Security Note**: Change the admin password immediately after first login in production environments.

### Database Credentials

These are set in [`backend/.env`](backend/.env):

```
Database Name: mnu_events
Username: postgres
Password: postgres
Host: postgres (internal) / localhost (external)
Port: 5432
```

---

## 🛠️ Common Commands

### Starting Services

```bash
# Start all services (detached mode)
docker compose up -d

# Start with live logs
docker compose up

# Rebuild and start (after code changes)
docker compose up --build -d
```

### Stopping Services

```bash
# Stop all services (keeps data)
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v

# Stop specific service
docker compose stop backend
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Last 100 lines
docker compose logs --tail=100 -f
```

### Database Operations

```bash
# Run migrations
docker compose exec backend npx prisma migrate deploy

# Seed the database
docker compose exec backend npx prisma db seed

# Reset database (⚠️ deletes all data)
docker compose exec backend npx prisma migrate reset

# Open Prisma Studio (database GUI)
docker compose exec backend npx prisma studio
# Then visit: http://localhost:5555
```

### Executing Commands in Containers

```bash
# Access backend shell
docker compose exec backend sh

# Access frontend shell
docker compose exec frontend sh

# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres -d mnu_events

# Run npm commands in backend
docker compose exec backend npm install <package-name>
docker compose exec backend npm run test
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Cleaning Up

```bash
# Remove all stopped containers
docker compose rm

# Clean up everything (containers, networks, volumes)
docker compose down -v --remove-orphans

# Remove unused Docker images
docker image prune -a

# Complete Docker cleanup (⚠️ affects all Docker projects)
docker system prune -a --volumes
```

### Health Checks

```bash
# Check status of all services
docker compose ps

# Inspect specific service
docker compose ps backend

# Check resource usage
docker stats
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Problem**: Error message like `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Option 1: Stop the conflicting service
# Find what's using the port (Windows)
netstat -ano | findstr :3000
# Find what's using the port (Linux/macOS)
lsof -i :3000

# Option 2: Change the port in docker-compose.yml
# Edit the ports section:
services:
  frontend:
    ports:
      - "3001:80"  # Changed from 3000:80
```

### Database Connection Errors

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
```bash
# 1. Ensure database container is running
docker compose ps postgres

# 2. Check database logs
docker compose logs postgres

# 3. Restart database
docker compose restart postgres

# 4. Verify connection string in backend/.env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mnu_events"
```

### Build Failures

**Problem**: Docker build fails with dependency errors

**Solution**:
```bash
# 1. Clean build with no cache
docker compose build --no-cache

# 2. Remove old images and rebuild
docker compose down
docker image prune -a
docker compose up --build
```

### Migrations Not Running

**Problem**: Database schema is outdated

**Solution**:
```bash
# 1. Manually run migrations
docker compose exec backend npx prisma migrate deploy

# 2. If migrations fail, check migration status
docker compose exec backend npx prisma migrate status

# 3. Reset database (⚠️ loses data)
docker compose exec backend npx prisma migrate reset
```

### Frontend Not Loading

**Problem**: Browser shows "Cannot connect" or white screen

**Solution**:
```bash
# 1. Check if container is running
docker compose ps frontend

# 2. Check frontend logs
docker compose logs frontend

# 3. Rebuild frontend
docker compose up --build frontend

# 4. Clear browser cache and hard reload (Ctrl+Shift+R)
```

### Performance Issues

**Problem**: Application is slow

**Solution**:
```bash
# 1. Check resource usage
docker stats

# 2. Increase Docker Desktop resources
# Docker Desktop → Settings → Resources
# Recommended: 4GB RAM, 2 CPUs minimum

# 3. Restart Docker Desktop
```

### WSL 2 Issues (Windows)

**Problem**: Docker not starting or WSL errors

**Solution**:
```bash
# 1. Restart WSL
wsl --shutdown
# Then restart Docker Desktop

# 2. Update WSL
wsl --update

# 3. Ensure WSL 2 is default
wsl --set-default-version 2
```

### Container Exits Immediately

**Problem**: Container starts then stops

**Solution**:
```bash
# 1. Check exit logs
docker compose logs <service-name>

# 2. Run interactively to see errors
docker compose run backend sh

# 3. Check for syntax errors in code
```

### Permission Denied Errors

**Problem**: Permission errors when running commands

**Solution**:
```bash
# Linux/macOS: Fix file permissions
chmod +x start.sh

# Windows WSL: Run Docker Desktop as Administrator
# Or run commands from WSL terminal
```

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 │ HTTP :3000                    │ HTTP :3001
                 │                               │
┌────────────────▼────────────────┐ ┌───────────▼────────────────┐
│      Frontend Container         │ │     Backend Container      │
│  ┌──────────────────────────┐   │ │  ┌─────────────────────┐   │
│  │   React + Vite App       │   │ │  │   NestJS API        │   │
│  │   (Built static files)   │   │ │  │   - Controllers     │   │
│  └──────────┬───────────────┘   │ │  │   - Services        │   │
│             │                    │ │  │   - Prisma ORM      │   │
│  ┌──────────▼───────────────┐   │ │  └─────────┬───────────┘   │
│  │   Nginx Web Server       │   │ │            │               │
│  │   - Serves static files  │   │ │            │ TCP :5432     │
│  │   - Port 80 (internal)   │   │ │            │               │
│  └──────────────────────────┘   │ │  ┌─────────▼───────────┐   │
│         Port 3000                │ │  │  Prisma Client      │   │
└──────────────────────────────────┘ │  └─────────┬───────────┘   │
                                     │            │               │
                                     │            │               │
                                     └────────────┼───────────────┘
                                                  │
                                                  │
                                     ┌────────────▼───────────────┐
                                     │   PostgreSQL Container     │
                                     │  ┌─────────────────────┐   │
                                     │  │  PostgreSQL 15      │   │
                                     │  │  Database: mnu_events│  │
                                     │  │  Port: 5432         │   │
                                     │  └─────────────────────┘   │
                                     │  ┌─────────────────────┐   │
                                     │  │  Volume: pgdata     │   │
                                     │  │  (Persistent data)  │   │
                                     │  └─────────────────────┘   │
                                     └────────────────────────────┘

Network: mnu_events_network (Bridge)
```

### Service Communication Flow

```
1. User Request Flow
   User → Frontend (localhost:3000)
   Frontend → Backend API (http://backend:3001 internally)
   Backend → PostgreSQL (postgres:5432 internally)

2. Data Flow
   PostgreSQL → Backend (via Prisma ORM)
   Backend → Frontend (JSON API responses)
   Frontend → User (Rendered UI)

3. Development Flow
   Code Changes → Docker Rebuild
   Docker Rebuild → Hot Reload (if configured)
   Hot Reload → Browser Update
```

### Container Details

#### Frontend Container
- **Base Image**: node:18-alpine (build), nginx:alpine (production)
- **Build Process**: Multi-stage build
  1. Stage 1: Install dependencies & build with Vite
  2. Stage 2: Copy built files to Nginx
- **Exposed Port**: 3000 (mapped from internal 80)
- **Health Check**: HTTP GET on /
- **Restart Policy**: unless-stopped

#### Backend Container
- **Base Image**: node:18-alpine
- **Dependencies**: PostgreSQL client, Prisma CLI
- **Exposed Port**: 3001
- **Environment**: Development mode with hot reload
- **Startup**: Waits for database, runs migrations, starts server
- **Health Check**: HTTP GET on /health
- **Restart Policy**: unless-stopped

#### PostgreSQL Container
- **Image**: postgres:15-alpine
- **Database**: mnu_events
- **Volume**: pgdata (persists across container restarts)
- **Port**: 5432 (accessible on host)
- **Health Check**: pg_isready command
- **Restart Policy**: unless-stopped

### Volume Management

```
pgdata (PostgreSQL data)
├── Database files
├── Transaction logs
└── Configuration

Persistence:
- Data survives container restarts
- Data survives `docker compose down`
- Data deleted with `docker compose down -v`
```

---

## ⚙️ Advanced Configuration

### Environment Variables

Edit [`backend/.env`](backend/.env) to customize:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mnu_events"

# API
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Production Deployment

For production, use the production compose file:

```bash
# Build for production
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# View production logs
docker compose -f docker-compose.prod.yml logs -f
```

### Custom Network Configuration

Edit [`docker-compose.yml`](docker-compose.yml) to customize ports:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access on localhost:8080

  backend:
    ports:
      - "8081:3001"  # Access on localhost:8081
```

### Adding New Services

To add a new service (e.g., Redis):

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - mnu_events_network
    restart: unless-stopped
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. Check the logs: `docker compose logs -f`
2. Search existing issues in the repository
3. Create a new issue with:
   - Error message
   - Output of `docker compose ps`
   - Output of `docker compose logs`
   - Your operating system and Docker version

---

**Last Updated**: 2025-11-13  
**Docker Compose Version**: 2.x  
**Tested On**: Windows 11 (WSL2), macOS, Ubuntu Linux