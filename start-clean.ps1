# MNU Events - Чистый запуск всего стека
# Останавливает все процессы, очищает и запускает проект заново

Write-Host "🚀 MNU Events - Чистый запуск" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Шаг 1: Очистка
Write-Host "`n🧹 Шаг 1: Очистка процессов..." -ForegroundColor Yellow
& "$PSScriptRoot\clean-start.ps1"

Start-Sleep -Seconds 2

# Шаг 2: Запуск базы данных
Write-Host "`n🐳 Шаг 2: Запуск базы данных..." -ForegroundColor Cyan
if (Test-Path "docker-compose.yml") {
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ База данных запущена" -ForegroundColor Green
        Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
        Write-Host "   pgAdmin: http://localhost:5050" -ForegroundColor White
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Ошибка запуска базы данных" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ docker-compose.yml не найден" -ForegroundColor Red
    exit 1
}

# Шаг 3: Подготовка базы данных (Prisma)
Write-Host "`n🗄️  Шаг 3: Подготовка базы данных..." -ForegroundColor Cyan
if (Test-Path "backend") {
    Push-Location backend
    
    # Генерация Prisma Client
    Write-Host "   Генерация Prisma Client..." -ForegroundColor White
    npm run prisma:generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка генерации Prisma Client" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "   ✅ Prisma Client сгенерирован" -ForegroundColor Green
    
    # Применение миграций
    Write-Host "   Применение миграций..." -ForegroundColor White
    npm run prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Предупреждение: возможны проблемы с миграциями" -ForegroundColor Yellow
        Write-Host "   (Это нормально, если миграции уже применены)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Миграции применены" -ForegroundColor Green
    }
    
    Pop-Location
    Start-Sleep -Seconds 2
} else {
    Write-Host "❌ Папка backend не найдена" -ForegroundColor Red
    exit 1
}

# Шаг 4: Запуск бэкенда
Write-Host "`n⚙️  Шаг 4: Запуск бэкенда..." -ForegroundColor Cyan
if (Test-Path "backend") {
    $backendPath = Join-Path $PWD "backend"
    Push-Location $backendPath
    
    # Проверяем наличие node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "   ⚠️  node_modules не найден, устанавливаем зависимости..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Ошибка установки зависимостей бэкенда" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Write-Host "   ✅ Зависимости установлены" -ForegroundColor Green
    }
    
    Write-Host "   Запуск в фоне: npm run start:dev" -ForegroundColor White
    $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend starting...' -ForegroundColor Cyan; npm run start:dev" -PassThru -WindowStyle Minimized
    Pop-Location
    Write-Host "✅ Бэкенд запускается (PID: $($proc.Id))..." -ForegroundColor Green
    Write-Host "   API: http://localhost:3001/api" -ForegroundColor White
    Write-Host "   Swagger: http://localhost:3001/api/docs" -ForegroundColor White
    Write-Host "   Подождите 8-10 секунд..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Проверяем доступность бэкенда
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/docs" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Backend is running!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backend still starting..." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Папка backend не найдена" -ForegroundColor Red
    exit 1
}

# Шаг 5: Запуск фронтенда
Write-Host "`n🎨 Шаг 5: Запуск фронтенда..." -ForegroundColor Cyan
if (Test-Path "frontend") {
    $frontendPath = Join-Path $PWD "frontend"
    Set-Location $frontendPath
    
    # Проверяем наличие node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "   ⚠️  node_modules не найден, устанавливаем зависимости..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Ошибка установки зависимостей фронтенда" -ForegroundColor Red
            Set-Location $PSScriptRoot
            exit 1
        }
        Write-Host "   ✅ Зависимости установлены" -ForegroundColor Green
    }
    
    Write-Host "   Запуск в фоне: npm run dev" -ForegroundColor White
    $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend starting...' -ForegroundColor Cyan; npm run dev" -PassThru -WindowStyle Minimized
    Write-Host "✅ Фронтенд запускается (PID: $($proc.Id))..." -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   Подождите 5-10 секунд..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Проверяем доступность фронтенда
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Frontend is running!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Frontend still starting..." -ForegroundColor Yellow
    }
    
    Set-Location $PSScriptRoot
} else {
    Write-Host "❌ Папка frontend не найдена" -ForegroundColor Red
    exit 1
}

# Итог
Write-Host "`n✨ Готово! Все сервисы запущены:" -ForegroundColor Green
Write-Host "   📊 PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   🔧 pgAdmin: http://localhost:5050" -ForegroundColor White
Write-Host "   ⚙️  Backend API: http://localhost:3001/api" -ForegroundColor White
Write-Host "   📚 Swagger: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "   🎨 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`n💡 Для остановки используйте: ./clean-start.ps1" -ForegroundColor Cyan

