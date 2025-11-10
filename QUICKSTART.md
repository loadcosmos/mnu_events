# MNU Events - Быстрый старт и справка

> Полное руководство для быстрого начала работы с платформой MNU Events

---

## 🚀 Быстрый старт

### 🧹 Очистка перед запуском

Перед запуском рекомендуется очистить все процессы:

**Windows PowerShell:**
```powershell
# Остановить все процессы и контейнеры
.\clean-start.ps1
```

**WSL/Linux/Mac:**
```bash
# Используйте скрипт для остановки
./clean-start.sh

# Или вручную:
pkill -f "node.*backend" || true
pkill -f "node.*vite" || true
docker-compose down
```

### Автоматический запуск (рекомендуется)

**Windows PowerShell:**
```powershell
# Чистый запуск всего стека
.\start-clean.ps1
```

**WSL/Linux/Mac:**
```bash
# Сделайте скрипты исполняемыми (первый раз)
chmod +x start-clean.sh clean-start.sh

# Чистый запуск всего стека
./start-clean.sh
```

Это запустит:
- PostgreSQL на порту 5432
- pgAdmin на http://localhost:5050
- Backend API на http://localhost:3001
- Frontend на http://localhost:5173

### Ручной запуск

#### 1. База данных

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- pgAdmin на http://localhost:5050

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл

# ⚠️ ВАЖНО: При первом запуске или после изменений в schema.prisma
npx prisma generate              # Генерация Prisma Client
npx prisma migrate dev           # Применение миграций
npm run prisma:seed              # Тестовые данные (опционально)

npm run start:dev                # http://localhost:3001
```

**Примечание:** 
- `prisma generate` нужно запускать после изменений в `schema.prisma` или после клонирования проекта
- `prisma migrate dev` нужно запускать при создании новых миграций или при первом запуске
- При обычном запуске (если ничего не менялось) можно сразу запускать `npm run start:dev`
- Скрипт `start-clean.ps1` автоматически выполняет эти команды

#### 3. Frontend

```bash
# В корне проекта
npm install
cp .env.example .env
npm run dev                      # http://localhost:5173
```

### Доступ к приложению

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Swagger Docs:** http://localhost:3001/api/docs
- **pgAdmin:** http://localhost:5050 (admin@mnuevents.kz / admin)

---

## 🔑 Тестовые аккаунты

Пароль для всех: `Password123!`

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@kazguu.kz | Password123! |
| Организатор | organizer@kazguu.kz | Password123! |
| Студент 1 | student1@kazguu.kz | Password123! |
| Студент 2 | student2@kazguu.kz | Password123! |
| Студент 3 | student3@kazguu.kz | Password123! |

---

## 📁 Ключевые файлы

### Backend
- **Schema:** `backend/prisma/schema.prisma`
- **Seed:** `backend/prisma/seed.ts`
- **Config:** `backend/src/config/configuration.ts`
- **Main:** `backend/src/main.ts`
- **Auth:** `backend/src/auth/`
- **Events:** `backend/src/events/`
- **Registrations:** `backend/src/registrations/`

### Frontend
- **Routing:** `frontend/js/App.jsx`
- **Auth Context:** `frontend/js/context/AuthContext.jsx`
- **API Client:** `frontend/js/services/apiClient.js`
- **Auth Service:** `frontend/js/services/authService.js`
- **Protected Routes:** `frontend/js/components/ProtectedRoute.jsx`
- **Pages:** `frontend/js/pages/`
- **Styles:** `frontend/css/`
- **Images:** `frontend/images/`
- **SVG:** `frontend/svg/`

---

## 🎯 Что работает

### Backend (100%)
✅ Auth (JWT, email verification)
✅ Events CRUD
✅ Registrations + Check-in
✅ Users management
✅ Swagger docs

### Frontend (70%)
✅ Login/Register UI
✅ Protected Routes с RBAC
✅ API Services Layer
✅ AuthContext для state management
✅ Student Home с событиями
✅ Organizer Dashboard UI
⚠️ Email verification page (нужна доработка)
⚠️ Event Details страница (нужна доработка)
⚠️ My Registrations страница (нужна доработка)

---

## 📚 API Endpoints (краткий список)

### Authentication
```
POST    /api/auth/register          - Регистрация
POST    /api/auth/verify-email      - Подтверждение email
POST    /api/auth/login             - Вход
POST    /api/auth/refresh           - Обновление токена
GET     /api/auth/profile           - Профиль
```

### Events
```
GET     /api/events                 - Все события (публичный)
GET     /api/events/:id             - Детали события (публичный)
POST    /api/events                 - Создать событие (ORGANIZER/ADMIN)
PATCH   /api/events/:id             - Обновить событие (Creator/ADMIN)
DELETE  /api/events/:id             - Удалить событие (Creator/ADMIN)
GET     /api/events/my              - Мои события (авторизован)
```

### Registrations
```
POST   /api/registrations          - Регистрация на событие
GET    /api/registrations/my       - Мои регистрации
DELETE /api/registrations/:id      - Отмена регистрации
GET    /api/registrations/event/:eventId  - Участники события (ORGANIZER/ADMIN)
PATCH  /api/registrations/:id/checkin     - Check-in (ORGANIZER/ADMIN)
```

### Users
```
GET    /api/users                   - Все пользователи (ADMIN)
GET    /api/users/:id              - Профиль пользователя
PATCH  /api/users/:id              - Обновить профиль
PATCH  /api/users/:id/role         - Изменить роль (ADMIN)
```

---

## 🎨 Дизайн система

**Цвета:**
- Primary: `#d62e1f` (MNU красный)
- Dark theme: `#0a0a0a` background (студенты)
- Light theme: `#ffffff` background (организаторы)
- CSI: Orange `#f59e0b`, Blue `#3b82f6`, Green `#10b981`

**Шрифт:** Montserrat (400, 500, 600, 700, 800)

**Эффекты:**
- Glassmorphism: `backdrop-filter: blur(24px)`
- Shadows: `0 8px 32px rgba(0, 0, 0, 0.2)`
- Анимации: float, slideIn, shake

---

## 🔧 Полезные команды

### Очистка и перезапуск

**Windows PowerShell:**
```powershell
# Остановить все процессы
.\clean-start.ps1

# Чистый запуск всего стека
.\start-clean.ps1
```

**Linux/Mac:**
```bash
# Остановить все процессы
pkill -f "node.*backend" || true
pkill -f "node.*vite" || true
docker-compose down

# Запустить всё заново
./start-all.sh
```

### Backend
```bash
# Prisma
npx prisma studio          # UI для базы данных
npx prisma migrate reset   # Сброс базы
npx prisma db seed        # Заполнить тестовыми данными

# Запуск
npm run start:dev          # Dev mode с hot reload
npm run start:prod        # Production mode
npm run build             # Сборка для продакшена
```

### Frontend
```bash
npm run dev                # Dev server
npm run build              # Production build
npm run preview            # Preview production build
```

### Docker
```bash
docker-compose up -d       # Запустить в фоне
docker-compose down        # Остановить
docker-compose logs -f     # Логи
docker-compose restart     # Перезапуск
```

---

## 🆘 Частые проблемы и решения

### 🔍 Быстрая проверка бэкенда

**Проверка, запущен ли бэкенд:**
```bash
# WSL/Linux
curl http://localhost:3001/api/clubs
lsof -i :3001

# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3001/api/clubs -UseBasicParsing
Get-NetTCPConnection -LocalPort 3001
```

**Запуск бэкенда:**
```bash
cd backend
npm run start:dev
```

**Проверка API:**
```bash
# Основной эндпоинт
curl http://localhost:3001/api/clubs

# Swagger документация
# Откройте: http://localhost:3001/api/docs
```

### Backend не запускается
```bash
# Проверь что PostgreSQL запущен
docker ps

# Пересоздай Prisma Client
npx prisma generate

# Проверь .env файл
cat backend/.env
```

### Frontend показывает ошибки API
```bash
# Проверь что backend запущен
curl http://localhost:3001/api

# Проверь VITE_API_URL в .env
cat .env
# Должно быть: VITE_API_URL=http://localhost:3001
# БЕЗ /api в конце!
```

### 429 Too Many Requests
```typescript
// backend/src/app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100  // Увеличь если нужно
}])
```

### События не загружаются
```bash
# Проверь что есть seed данные
npx prisma db seed

# Проверь API в Swagger
open http://localhost:3001/api/docs
```

### Проблемы с миграциями
```bash
cd backend

# Проверка статуса миграций
npx prisma migrate status

# Применение миграций
npx prisma migrate dev

# Генерация Prisma Client
npx prisma generate
```

### Порт занят
```bash
# WSL/Linux - найти процесс
lsof -i :3001
# Остановить процесс
kill -9 <PID>

# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001
Stop-Process -Id <PID> -Force
```

### Чек-лист перед проверкой API
- [ ] PostgreSQL запущен: `docker ps | grep postgres`
- [ ] Бэкенд запущен: `curl http://localhost:3001/api/clubs`
- [ ] Порт слушается: `lsof -i :3001` (Linux) или `Get-NetTCPConnection -LocalPort 3001` (Windows)

---

## 🛠 Технологический стек

### Backend
- **Framework:** NestJS 10.3.0 + TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 5.7.1
- **Authentication:** JWT + Passport
- **Email:** Nodemailer
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator
- **Rate Limiting:** @nestjs/throttler

### Frontend
- **Framework:** React 19.2.0 + JavaScript
- **Build Tool:** Vite 7.2.0
- **Routing:** React Router v7.9.5
- **State:** React Context API
- **HTTP:** Axios 1.13.2 with interceptors
- **Styling:** Original CSS (glassmorphism + MNU branding)
- **Icons:** React Icons 5.5.0

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Management:** pgAdmin

---

## 📖 Документация

- **AI Developer Workflow:** `UPDATE_PLAN.md` (рабочий протокол с MCP инструментами)
- **Архитектура:** `ARCHITECTURE.md` (полная техническая документация)
- **Roadmap:** `ROADMAP.md` (план задач и прогресс)
- **Deployment:** `DEPLOYMENT.md` (руководство по деплою)
- **Backend API:** `backend/README.md`
- **Environment Setup:** `backend/ENV_SETUP.md` (настройка .env файла)
- **API Docs:** http://localhost:3001/api/docs (после запуска)

---

## 💡 Советы при работе

1. **Всегда проверяй ARCHITECTURE.md** перед изменениями
2. **Обновляй ROADMAP.md** после завершения задач
3. **Используй Swagger** для тестирования API: http://localhost:3001/api/docs
4. **Seed данные** всегда доступны после `npx prisma db seed`
5. **JWT token** хранится в `localStorage` с ключом `token`
6. **Role** хранится в `localStorage` с ключом `role`
7. **Всегда используй apiClient** для API запросов (автоматическая обработка токенов)
8. **Используй ProtectedRoute** для защиты маршрутов

---

## 🗄 База данных

### Модели

**User**
- Email (только @kazguu.kz)
- Пароль (bcrypt)
- Имя и фамилия
- Роль (STUDENT, ORGANIZER, ADMIN)
- Подтверждение email

**Event**
- Название, описание, категория
- Место, даты начала и окончания
- Вместимость
- Статус (UPCOMING, ONGOING, COMPLETED, CANCELLED)

**Registration**
- Связь пользователь-событие
- Статус (REGISTERED, WAITLIST, CANCELLED)
- Check-in статус и время

### Схема

```
User 1--* Event (creator)
User 1--* Registration
Event 1--* Registration
```

---

## 🔐 Безопасность

- JWT аутентификация (access + refresh tokens)
- Обязательная верификация email
- Валидация силы пароля
- Role-based access control (RBAC)
- Rate limiting (10 запросов/минуту)
- CORS настройка
- Защита от SQL injection (Prisma)
- Защита от XSS

---

## 📝 Скрипты

```bash
# Backend
cd backend
npm run start:dev                # Запуск dev сервера
npm run build                    # Сборка для продакшена
npm run start:prod               # Запуск продакшен сервера
npm run prisma:seed              # Заполнение с тестовыми данными
npm run prisma:studio            # Открыть Prisma Studio

# Frontend
npm run dev                      # Запуск dev сервера
npm run build                    # Сборка для продакшена
npm run preview                  # Превью продакшен сборки

# Docker
docker-compose up -d             # Запустить PostgreSQL + pgAdmin
docker-compose down              # Остановить
docker-compose logs -f postgres  # Посмотреть логи
```

---

## 🎓 Для университета

### Готовность к передаче

✅ **Документация**
- README с подробными инструкциями
- DEPLOYMENT.md для деплоя
- Swagger API документация
- Комментарии в коде

✅ **Код**
- TypeScript для type safety
- Понятная структура проекта
- ESLint + Prettier настроены
- Git commits с ясными сообщениями

✅ **Безопасность**
- Environment variables
- JWT токены
- Password hashing
- SQL injection защита
- CORS настроен
- Rate limiting

✅ **Масштабируемость**
- Модульная архитектура
- Database indexes
- Pagination
- Error handling

---

**MNU Events - Connecting University Community Through Events! 🎓**

**Maqsut Narikbayev University, Astana, Kazakhstan**
