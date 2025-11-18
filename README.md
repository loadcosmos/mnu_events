# MNU Events Platform

Платформа для управления университетскими мероприятиями.

## Быстрый запуск

### Требования
- Node.js 20+
- Docker & Docker Compose
- npm

### Запуск

```bash
chmod +x start.sh
./start.sh
```

### Или вручную:

```bash
# 1. Запустить базу данных
docker-compose up -d

# 2. В папке backend:
cd backend
npm install
npm rebuild bcrypt
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev

# 3. В корневой папке (для frontend):
npm install
npm run dev
```

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/api/docs
- PgAdmin: http://localhost:5050 (admin@mnuevents.kz / admin)

## Структура

```
/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/          # Аутентификация, JWT
│   │   ├── users/         # Управление пользователями
│   │   ├── events/        # Мероприятия
│   │   ├── registrations/ # Регистрации на мероприятия
│   │   ├── clubs/         # Клубы
│   │   ├── common/        # ⭐ Общие утилиты и константы
│   │   │   ├── utils/    # Pagination, authorization helpers
│   │   │   └── constants/ # Время, пагинация и др.
│   │   ├── prisma/        # Сервис БД
│   │   └── config/        # Конфигурация
│   ├── prisma/            # Схема БД + миграции
│   └── .env              # Настройки (из .env.example)
├── frontend/              # React UI
│   ├── js/
│   │   ├── components/   # Компоненты UI
│   │   │   ├── ui/       # shadcn/ui компоненты
│   │   │   └── *.jsx     # Layout, ProtectedRoute, и др.
│   │   ├── pages/        # Страницы приложения
│   │   ├── services/     # API клиент и сервисы
│   │   ├── context/      # React Context (Auth)
│   │   └── utils/        # ⭐ Общие утилиты и константы
│   │       ├── constants.js      # Роли, категории, цвета
│   │       ├── categoryMappers.js # Маппинг категорий
│   │       ├── dateFormatters.js  # Форматирование дат
│   │       └── errorHandlers.js   # Обработка ошибок
│   └── css/              # Tailwind стили
├── e2e/                  # E2E тесты (Playwright)
├── docker-compose.yml    # PostgreSQL
├── CLAUDE.md             # Инструкции для разработки
└── REFACTORING_SUMMARY.md # ⭐ Отчет о рефакторинге
```

## Технологии

**Backend:**
- NestJS 10
- Prisma ORM
- PostgreSQL
- JWT Auth

**Frontend:**
- React 19
- Vite 7
- Tailwind CSS
- React Router v7

## База данных

PostgreSQL запускается в Docker:
- Host: localhost:5432
- User: mnu_user
- Password: mnu_password
- Database: mnu_events_dev

## Тестовые пользователи (после seed)

- **Admin:** admin@kazguu.kz / Password123!
- **Organizer:** organizer@kazguu.kz / Password123!
- **Student:** student1@kazguu.kz / Password123!

## 📚 Documentation

The documentation has been reorganized for clarity. Choose what you need:

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[README.md](./README.md)** | This file - quick overview | 5 min |
| **[SETUP.md](./SETUP.md)** | Installation, Docker, configuration | 15 min |
| **[CLAUDE.md](./CLAUDE.md)** | Developer quick reference | 10 min |
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | Status (82% complete), roadmap, timeline | 20 min |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Dev checklists, guidelines, UI/UX | 15 min |
| **[WSL_VS_WINDOWS_ANALYSIS.md](./WSL_VS_WINDOWS_ANALYSIS.md)** | Windows/WSL comparison | 10 min |

### Recent Improvements (2025-11-13 to 2025-11-18)
- ✅ 3 new consolidated documentation files (SETUP.md, PROJECT_STATUS.md, DEVELOPMENT.md)
- ✅ Refactored CLAUDE.md for quick reference
- ✅ Added WSL vs Windows detailed analysis
- ✅ Backend: Security fixes, shared utilities, 9 DB indexes
- ✅ Frontend: Shared utilities, code deduplication, dark theme support
- ✅ Overall: 82% implementation complete, C+ grade (production work needed)

### Current Status
- ⚠️ **Production Ready:** NO (requires 8-10 weeks of hardening)
- 🟢 **Development:** All core features complete (95%+)
- 🔴 **Security Issues:** 8 critical issues identified
- 🧪 **Testing:** <10% backend, <5% frontend coverage

## Дополнительно

### Применить новые индексы БД

```bash
cd backend
npx prisma migrate dev --name add-performance-indexes
npx prisma generate
```

### Использование новых утилит

**Backend:**
```typescript
import { validatePagination, createPaginatedResponse, requireCreatorOrAdmin } from '../common/utils';
```

**Frontend:**
```javascript
import { ROLES, formatDate, extractErrorMessage, getCategoryColor } from '@/utils';
```

### Команды разработки

```bash
# Backend
cd backend
npm run start:dev    # Dev с hot reload
npm run build        # Production build
npm test            # Unit тесты
npm run lint        # ESLint

# Frontend
npm run dev         # Dev server
npm run build       # Production build
npm run preview     # Preview build

# БД
cd backend
npx prisma studio   # GUI для БД
npx prisma migrate dev --name <name>  # Новая миграция
```
