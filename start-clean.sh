#!/bin/bash
# MNU Events - Чистый запуск всего стека (Bash версия для WSL/Linux)
# Останавливает все процессы, очищает и запускает проект заново

set -e  # Остановка при ошибке

echo "🚀 MNU Events - Чистый запуск"
echo "================================"

# Шаг 1: Очистка
echo ""
echo "🧹 Шаг 1: Очистка процессов..."
bash clean-start.sh

sleep 2

# Шаг 2: Запуск базы данных
echo ""
echo "🐳 Шаг 2: Запуск базы данных..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
    if [ $? -eq 0 ]; then
        echo "✅ База данных запущена"
        echo "   PostgreSQL: localhost:5432"
        echo "   pgAdmin: http://localhost:5050"
        sleep 3
    else
        echo "❌ Ошибка запуска базы данных"
        exit 1
    fi
else
    echo "❌ docker-compose.yml не найден"
    exit 1
fi

# Шаг 3: Подготовка базы данных (Prisma)
echo ""
echo "🗄️  Шаг 3: Подготовка базы данных..."
if [ -d "backend" ]; then
    cd backend
    
    # Генерация Prisma Client
    echo "   Генерация Prisma Client..."
    npm run prisma:generate
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка генерации Prisma Client"
        cd ..
        exit 1
    fi
    echo "   ✅ Prisma Client сгенерирован"
    
    # Применение миграций
    echo "   Применение миграций..."
    npm run prisma:migrate
    if [ $? -ne 0 ]; then
        echo "⚠️  Предупреждение: возможны проблемы с миграциями"
        echo "   (Это нормально, если миграции уже применены)"
    else
        echo "   ✅ Миграции применены"
    fi
    
    cd ..
    sleep 2
else
    echo "❌ Папка backend не найдена"
    exit 1
fi

# Шаг 4: Запуск бэкенда
echo ""
echo "⚙️  Шаг 4: Запуск бэкенда..."
if [ -d "backend" ]; then
    cd backend
    # Проверяем наличие node_modules
    if [ ! -d "node_modules" ]; then
        echo "   ⚠️  node_modules не найден, устанавливаем зависимости..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ Ошибка установки зависимостей бэкенда"
            cd ..
            exit 1
        fi
        echo "   ✅ Зависимости установлены"
    fi
    echo "   Запуск в фоне: npm run start:dev"
    nohup npm run start:dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    cd ..
    echo "✅ Бэкенд запускается (PID: $BACKEND_PID)..."
    echo "   API: http://localhost:3001/api"
    echo "   Swagger: http://localhost:3001/api/docs"
    echo "   Логи: tail -f backend.log"
    sleep 8
else
    echo "❌ Папка backend не найдена"
    exit 1
fi

# Шаг 5: Запуск фронтенда
echo ""
echo "🎨 Шаг 5: Запуск фронтенда..."
if [ -d "frontend" ]; then
    cd frontend
    # Проверяем наличие node_modules
    if [ ! -d "node_modules" ]; then
        echo "   ⚠️  node_modules не найден, устанавливаем зависимости..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ Ошибка установки зависимостей фронтенда"
            cd ..
            exit 1
        fi
        echo "   ✅ Зависимости установлены"
    fi
    echo "   Запуск в фоне: npm run dev"
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    echo "✅ Фронтенд запускается (PID: $FRONTEND_PID)..."
    echo "   Frontend: http://localhost:5173"
    echo "   Логи: tail -f frontend.log"
    sleep 5
else
    echo "❌ Папка frontend не найдена"
    exit 1
fi

# Итог
echo ""
echo "✨ Готово! Все сервисы запущены:"
echo "   📊 PostgreSQL: localhost:5432"
echo "   🔧 pgAdmin: http://localhost:5050"
echo "   ⚙️  Backend API: http://localhost:3001/api"
echo "   📚 Swagger: http://localhost:3001/api/docs"
echo "   🎨 Frontend: http://localhost:5173"
echo ""
echo "💡 Для остановки используйте: bash clean-start.sh"
echo "💡 Для просмотра логов:"
echo "   - Бэкенд: tail -f backend.log"
echo "   - Фронтенд: tail -f frontend.log"

