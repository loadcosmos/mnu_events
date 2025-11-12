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
├── backend/          # NestJS API
│   ├── src/         # Исходный код
│   ├── prisma/      # База данных схема
│   └── .env         # Настройки (создать из .env.example)
├── frontend/        # React UI
│   ├── js/          # Компоненты и страницы
│   └── css/         # Стили
└── docker-compose.yml  # PostgreSQL
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

- **Admin:** admin@kazguu.kz / Password123
- **Organizer:** organizer@kazguu.kz / Password123
- **Student:** student@mkazguu.kz / Password123
