#!/bin/bash

echo "==================================="
echo "  MNU Events Platform - Startup"
echo "==================================="

# 1. Start Docker (database)
echo ""
echo "1. Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database
echo "   Waiting for database to be ready..."
sleep 5

# 2. Setup backend
echo ""
echo "2. Setting up backend..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi

# Rebuild bcrypt (важно для WSL)
echo "   Rebuilding bcrypt..."
npm rebuild bcrypt --silent

# Prisma setup
echo "   Running Prisma migrations..."
npx prisma migrate dev --name init

echo "   Generating Prisma client..."
npx prisma generate

echo "   Seeding database..."
npx prisma db seed || echo "   Note: Seed might fail if data exists"

# 3. Start backend
echo ""
echo "3. Starting backend server..."
npm run start:dev &
BACKEND_PID=$!

cd ..

# 4. Install frontend dependencies if needed
echo ""
echo "4. Setting up frontend..."
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

# 5. Start frontend
echo ""
echo "5. Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================="
echo "  Services Started!"
echo "==================================="
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:3001/api/docs"
echo "PgAdmin:  http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
