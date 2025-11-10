#!/bin/bash
# MNU Events - Остановка всех процессов (Bash версия для WSL/Linux)

echo "🧹 Остановка всех процессов..."

# Остановка Node.js процессов (бэкенд и фронтенд)
echo "   Остановка Node.js процессов..."
pkill -f "npm run start:dev" || true
pkill -f "npm run dev" || true
pkill -f "node.*backend" || true
pkill -f "vite" || true

# Остановка процессов по PID файлам (если есть)
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    rm -f frontend.pid
fi

# Остановка и удаление Docker контейнеров
echo "   Остановка Docker контейнеров..."
if docker-compose ps -q > /dev/null 2>&1; then
    docker-compose down
    echo "   ✅ Docker контейнеры остановлены"
else
    echo "   ℹ️  Docker контейнеры не запущены"
fi

# Проверка портов
echo ""
echo "🔍 Проверка портов:"
PORTS=(3001 5173 5432 5050)
for port in "${PORTS[@]}"; do
    if lsof -ti:$port > /dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo "   ❌ Port $port is still in use"
    else
        echo "   ✅ Port $port is free"
    fi
done

echo ""
echo "✅ Очистка завершена"

