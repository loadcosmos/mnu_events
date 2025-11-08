# MNU Events - Быстрая справка

> Краткая шпаргалка для быстрого ориентирования в проекте

---

## 🚀 Быстрый старт

```bash
# 1. База данных
docker-compose up -d

# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# 3. Frontend
cd frontend
npm install
npm run dev
```

**Доступ:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- pgAdmin: http://localhost:5050 (admin@mnuevents.kz / admin)

---

## 🔑 Тестовые аккаунты

Пароль для всех: `Password123!`

```
student1@kazguu.kz
student2@kazguu.kz
student3@kazguu.kz
organizer@kazguu.kz
admin@kazguu.kz
```

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
- **Routing:** `frontend/src/App.tsx`
- **Theme:** `frontend/src/styles/theme.ts`
- **Global CSS:** `frontend/src/styles/global.css`
- **Login:** `frontend/src/pages/Login.tsx`
- **Student Home:** `frontend/src/pages/StudentHome.tsx`
- **Organizer Dashboard:** `frontend/src/pages/OrganizerDashboard.tsx`

---

## 🎯 Что работает

### Backend (100%)
✅ Auth (JWT, email verification)
✅ Events CRUD
✅ Registrations + Check-in
✅ Users management
✅ Swagger docs

### Frontend (30%)
✅ Login/Register UI
✅ Student Home с событиями
✅ Organizer Dashboard UI
❌ Email verification page
❌ Event Details
❌ My Registrations
❌ API services layer
❌ Protected routes

---

## 🔴 Критические TODO

1. **Email Verification страница** - после регистрации
2. **API Services Layer** - centralized API calls
3. **Protected Routes** - защита роутов по ролям
4. **Event Details страница** - клик на событие
5. **My Registrations страница** - список регистраций
6. **Organizer Dashboard API** - подключить к реальным данным

---

## 🐛 Известные проблемы

- ⚠️ `.env` файл: `VITE_API_URL=http://localhost:3001` (БЕЗ /api!)
- ⚠️ Backend префикс: все эндпоинты начинаются с `/api/`
- ⚠️ Email verification: backend требует, frontend не реализует
- ⚠️ Protected routes: нет защиты, студент может зайти на /organizer
- ⚠️ Organizer endpoints: `/api/organizer/stats` не существует (использовать `/api/events/my`)

---

## 📚 API Endpoints (краткий список)

### Auth
```
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/profile
```

### Events
```
GET    /api/events              (публичный)
GET    /api/events/:id          (публичный)
POST   /api/events              (ORGANIZER/ADMIN)
PATCH  /api/events/:id          (Creator/ADMIN)
DELETE /api/events/:id          (Creator/ADMIN)
GET    /api/events/my           (авторизован)
```

### Registrations
```
POST   /api/registrations
GET    /api/registrations/my
DELETE /api/registrations/:id
GET    /api/registrations/event/:eventId  (ORGANIZER/ADMIN)
PATCH  /api/registrations/:id/checkin     (ORGANIZER/ADMIN)
```

### Users
```
GET    /api/users        (ADMIN)
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

---

## 🎨 Дизайн система (краткая)

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

### Backend
```bash
# Prisma
npx prisma studio          # UI для базы данных
npx prisma migrate reset   # Сброс базы
npx prisma db seed         # Заполнить тестовыми данными

# Запуск
npm run start:dev          # Dev mode с hot reload
npm run start:prod         # Production mode
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

## 📖 Документация

- **Архитектура:** `ARCHITECTURE.md` (полная техническая документация)
- **Roadmap:** `ROADMAP.md` (план задач и прогресс)
- **Quick Reference:** `QUICK_REFERENCE.md` (этот файл)

---

## 💡 Советы при работе

1. **Всегда проверяй ARCHITECTURE.md** перед изменениями
2. **Обновляй ROADMAP.md** после завершения задач
3. **Используй Swagger** для тестирования API: http://localhost:3001/api/docs
4. **Seed данные** всегда доступны после `npx prisma db seed`
5. **JWT token** хранится в `localStorage` с ключом `token`
6. **Role** хранится в `localStorage` с ключом `role`

---

## 🆘 Частые проблемы и решения

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

# Проверь VITE_API_URL в frontend/.env
cat frontend/.env
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

---

**Конец Quick Reference**

_Для полной информации смотри ARCHITECTURE.md и ROADMAP.md_
