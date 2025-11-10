# MNU Events - Чистый запуск
# Останавливает все процессы и запускает проект с нуля

Write-Host "🧹 Очистка процессов..." -ForegroundColor Yellow

# 1. Остановка Node.js процессов (кроме системных)
Write-Host "`n📦 Остановка Node.js процессов..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -notlike "*cursor*" }
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Остановлено $($nodeProcesses.Count) Node.js процессов" -ForegroundColor Green
} else {
    Write-Host "✅ Node.js процессы не найдены" -ForegroundColor Green
}

# 2. Остановка Docker контейнеров
Write-Host "`n🐳 Остановка Docker контейнеров..." -ForegroundColor Cyan
if (Test-Path "docker-compose.yml") {
    docker-compose down 2>&1 | Out-Null
    Write-Host "✅ Docker контейнеры остановлены" -ForegroundColor Green
} else {
    Write-Host "⚠️  docker-compose.yml не найден" -ForegroundColor Yellow
}

# 3. Проверка портов
Write-Host "`n🔍 Проверка портов..." -ForegroundColor Cyan
$ports = @(3001, 5173, 5432, 5050)
$busyPorts = @()
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $busyPorts += $port
    }
}

if ($busyPorts.Count -eq 0) {
    Write-Host "✅ Все порты свободны (3001, 5173, 5432, 5050)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Занятые порты: $($busyPorts -join ', ')" -ForegroundColor Yellow
}

Write-Host "`n✨ Очистка завершена!" -ForegroundColor Green
Write-Host "`n📋 Для запуска проекта используйте:" -ForegroundColor Cyan
Write-Host "   1. docker-compose up -d          # База данных" -ForegroundColor White
Write-Host "   2. cd backend && npm run start:dev  # Backend" -ForegroundColor White
Write-Host "   3. npm run dev                    # Frontend" -ForegroundColor White
Write-Host "`n   Или используйте: ./start-all.sh" -ForegroundColor White

