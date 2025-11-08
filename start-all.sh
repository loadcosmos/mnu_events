#!/bin/bash

echo "🚀 Запуск MNU Events Platform..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки успешности команды
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# 1. Запуск базы данных
echo "📊 Запуск PostgreSQL через Docker..."
docker-compose up -d
check_success "PostgreSQL запущен"
echo ""

# Ждем пока PostgreSQL полностью запустится
echo "⏳ Ожидание готовности базы данных..."
sleep 5
check_success "База данных готова"
echo ""

# 2. Настройка и запуск бэкенда
echo "🔧 Настройка бэкенда..."
cd backend

# Проверка .env
if [ ! -f .env ]; then
  echo -e "${YELLOW}Создание .env файла...${NC}"
  cp .env.example .env
  check_success ".env создан"
fi

# Установка зависимостей
if [ ! -d node_modules ]; then
  echo "📦 Установка зависимостей бэкенда..."
  npm install
  check_success "Зависимости бэкенда установлены"
fi

# Prisma setup
echo "🗄️  Настройка Prisma..."
npx prisma generate > /dev/null 2>&1
check_success "Prisma client сгенерирован"

npx prisma migrate dev --name init > /dev/null 2>&1
check_success "Миграции применены"

npm run prisma:seed > /dev/null 2>&1
check_success "Тестовые данные загружены"

echo ""
echo "🚀 Запуск бэкенда (NestJS)..."
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..
sleep 10

# 3. Запуск фронтенда
echo ""
echo "⚛️  Настройка фронтенда..."

# Проверка .env
if [ ! -f .env ]; then
  echo -e "${YELLOW}Создание .env файла...${NC}"
  cp .env.example .env
  check_success ".env создан"
fi

# Установка зависимостей
if [ ! -d node_modules ]; then
  echo "📦 Установка зависимостей фронтенда..."
  npm install
  check_success "Зависимости фронтенда установлены"
fi

echo ""
echo "✅ Все сервисы запущены!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend:      http://localhost:5173"
echo "🔌 Backend API:   http://localhost:3001/api"
echo "📚 Swagger Docs:  http://localhost:3001/api/docs"
echo "🗄️  pgAdmin:       http://localhost:5050"
echo "   (admin@mnuevents.kz / admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 Тестовые аккаунты:"
echo "   Admin:     admin@kazguu.kz / Password123!"
echo "   Organizer: organizer@kazguu.kz / Password123!"
echo "   Student:   student1@kazguu.kz / Password123!"
echo ""
echo "🛑 Для остановки: Ctrl+C, затем kill $BACKEND_PID"
echo "   и docker-compose down"
echo ""

# Запуск фронтенда (это блокирующая команда)
echo "🚀 Запуск фронтенда (Vite)..."
npm run dev

# При завершении фронтенда остановить бэкенд
echo ""
echo "🛑 Остановка бэкенда..."
kill $BACKEND_PID

echo "✅ Все процессы остановлены"
