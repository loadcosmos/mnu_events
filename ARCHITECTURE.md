# MNU Events - Архитектурная Документация

> **Последнее обновление:** 2025-11-08
> **Версия:** 1.0.0
> **Статус:** MVP в разработке (Backend 100%, Frontend 30%)

---

## 📋 Оглавление

1. [Обзор системы](#обзор-системы)
2. [Технологический стек](#технологический-стек)
3. [Backend архитектура](#backend-архитектура)
4. [Frontend архитектура](#frontend-архитектура)
5. [База данных](#база-данных)
6. [API эндпоинты](#api-эндпоинты)
7. [Аутентификация и авторизация](#аутентификация-и-авторизация)
8. [Дизайн система](#дизайн-система)
9. [Окружение и конфигурация](#окружение-и-конфигурация)
10. [Важные замечания](#важные-замечания)

---

## 🎯 Обзор системы

**MNU Events** - платформа управления университетскими мероприятиями для Maqsut Narikbayev University.

### Основные возможности:
- **Для студентов:** Просмотр и регистрация на события, получение билетов/QR кодов
- **Для организаторов:** Создание событий, управление участниками, check-in через QR
- **Для администраторов:** Управление пользователями и платформой

### Роли пользователей:
- `STUDENT` - студенты MNU (email обязательно @kazguu.kz)
- `ORGANIZER` - организаторы событий (клубы, факультеты)
- `ADMIN` - администраторы платформы

---

## 🛠 Технологический стек

### Backend
- **Framework:** NestJS 10.3
- **Language:** TypeScript 5.3
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5.7
- **Authentication:** JWT (Passport.js)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI
- **Security:** Bcrypt, Helmet, Rate Limiting (Throttler)
- **Email:** Nodemailer (Gmail SMTP)
- **Runtime:** Node.js 20

### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5.3
- **Build Tool:** Vite 5.4
- **Routing:** React Router v6
- **Styling:** CSS Modules (НЕ Tailwind, несмотря на упоминание в README)
- **Icons:** Font Awesome 6.5
- **Fonts:** Montserrat (Google Fonts)

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Admin:** pgAdmin 4
- **Version Control:** Git

---

## 🏗 Backend архитектура

### Структура директорий

```
backend/
├── src/
│   ├── auth/                 # Аутентификация и авторизация
│   │   ├── guards/           # JWT, Roles guards
│   │   ├── decorators/       # @Public, @Roles, @CurrentUser
│   │   ├── strategies/       # Passport JWT strategy
│   │   └── dto/              # Auth DTOs
│   ├── events/               # События
│   │   ├── dto/              # CreateEvent, UpdateEvent, FilterEvents
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   └── events.module.ts
│   ├── registrations/        # Регистрации на события
│   │   ├── dto/
│   │   ├── registrations.controller.ts
│   │   ├── registrations.service.ts
│   │   └── registrations.module.ts
│   ├── users/                # Пользователи
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── prisma/               # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── common/               # Общие утилиты
│   │   ├── filters/          # HTTP exception filter
│   │   ├── pipes/            # Validation pipe
│   │   └── decorators/
│   ├── config/               # Конфигурация
│   │   └── configuration.ts
│   ├── app.module.ts         # Корневой модуль
│   └── main.ts               # Entry point
├── prisma/
│   ├── schema.prisma         # Prisma schema
│   └── seed.ts               # Seed данные
└── .env                      # Environment variables
```

### Модули и их функции

#### 1. **Auth Module**
**Функциональность:**
- Регистрация пользователей (с обязательной email верификацией)
- Email верификация (6-значный код)
- Вход (JWT access + refresh tokens)
- Обновление токенов
- Получение профиля текущего пользователя

**Эндпоинты:**
```
POST   /api/auth/register       - Регистрация
POST   /api/auth/verify-email   - Верификация email
POST   /api/auth/resend-code    - Повторная отправка кода
POST   /api/auth/login          - Вход
POST   /api/auth/refresh        - Обновление токена
GET    /api/auth/profile        - Получить профиль (требует JWT)
```

**Безопасность:**
- Пароли хешируются через bcrypt (10 rounds)
- JWT access token: 1 час
- JWT refresh token: 7 дней
- Email verification код: 24 часа
- Обязательная валидация @kazguu.kz для студентов

#### 2. **Events Module**
**Функциональность:**
- CRUD операции для событий
- Фильтрация по category, status, date, search
- Пагинация (page, limit)
- Получение статистики по событию
- Получение "Моих событий" (созданных организатором)

**Эндпоинты:**
```
GET    /api/events                    - Все события (публичный)
GET    /api/events/:id                - Детали события (публичный)
POST   /api/events                    - Создать (ORGANIZER/ADMIN)
PATCH  /api/events/:id                - Обновить (Creator/ADMIN)
DELETE /api/events/:id                - Удалить (Creator/ADMIN)
GET    /api/events/my                 - Мои события (JWT)
GET    /api/events/:id/statistics     - Статистика (ORGANIZER/ADMIN)
```

**Категории:**
- `ACADEMIC` - академические события
- `SPORTS` - спортивные
- `CULTURAL` - культурные
- `TECH` - технологические
- `SOCIAL` - социальные
- `CAREER` - карьерные
- `OTHER` - прочее

**Статусы:**
- `UPCOMING` - предстоящие
- `ONGOING` - идут сейчас
- `COMPLETED` - завершены
- `CANCELLED` - отменены

#### 3. **Registrations Module**
**Функциональность:**
- Регистрация на события
- Просмотр своих регистраций
- Отмена регистрации
- Check-in участников (для организаторов)
- Undo check-in
- Просмотр участников события
- Автоматический waitlist при заполнении capacity

**Эндпоинты:**
```
POST   /api/registrations              - Зарегистрироваться
GET    /api/registrations/my           - Мои регистрации
DELETE /api/registrations/:id          - Отменить регистрацию
GET    /api/registrations/event/:id    - Участники (ORGANIZER/ADMIN)
PATCH  /api/registrations/:id/checkin  - Check-in (ORGANIZER/ADMIN)
PATCH  /api/registrations/:id/undo     - Отменить check-in (ORGANIZER/ADMIN)
```

**Статусы регистрации:**
- `REGISTERED` - зарегистрирован
- `WAITLIST` - в листе ожидания
- `CANCELLED` - отменена

**Бизнес-логика:**
- Нельзя зарегистрироваться на событие дважды
- При достижении capacity автоматически WAITLIST
- При check-in проверяется статус REGISTERED
- Нельзя зарегистрироваться на прошедшее событие

#### 4. **Users Module**
**Функциональность:**
- Получение списка пользователей (Admin only)
- Просмотр профиля пользователя
- Обновление профиля (свой или Admin)
- Изменение роли (Admin only)
- Удаление пользователя (Admin или сам)

**Эндпоинты:**
```
GET    /api/users           - Все пользователи (ADMIN)
GET    /api/users/:id       - Профиль
PATCH  /api/users/:id       - Обновить профиль
PATCH  /api/users/:id/role  - Изменить роль (ADMIN)
DELETE /api/users/:id       - Удалить (ADMIN или сам)
```

---

## 🎨 Frontend архитектура

### Структура директорий

```
frontend/
├── src/
│   ├── pages/                # Страницы
│   │   ├── Login.tsx         # ✅ Логин/регистрация
│   │   ├── StudentHome.tsx   # ✅ Главная для студентов
│   │   └── OrganizerDashboard.tsx  # ⚠️ Dashboard (только UI)
│   ├── components/           # ❌ Пустая (TODO: компоненты)
│   ├── services/             # ❌ Пустая (TODO: API services)
│   ├── hooks/                # ❌ Пустая (TODO: custom hooks)
│   ├── utils/                # ❌ Пустая (TODO: утилиты)
│   ├── types/                # ❌ Пустая (TODO: TypeScript types)
│   ├── assets/               # ❌ Пустая (TODO: изображения)
│   ├── styles/               # CSS модули
│   │   ├── global.css        # Глобальные стили
│   │   ├── theme.ts          # Дизайн система
│   │   ├── auth.module.css   # Логин/регистрация
│   │   ├── student.module.css  # Студенческая тема
│   │   └── organizer.module.css  # Организаторская тема
│   ├── App.tsx               # Роутинг
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite types
├── index.html
└── .env                      # VITE_API_URL
```

### Реализованные страницы

#### 1. **Login Page** (`/login`)
**Статус:** ✅ 70% готово

**Функции:**
- Переключение между Student/Organizer ролями
- Sign In / Sign Up вкладки
- Валидация @kazguu.kz для студентов
- Интеграция с `/api/auth/register` и `/api/auth/login`
- Красивый glassmorphism дизайн с анимированным фоном

**❌ Что отсутствует:**
- Email verification flow (после регистрации должна быть страница ввода кода)
- Forgot password функционал
- Ошибки не отображаются красиво

#### 2. **StudentHome** (`/`)
**Статус:** ✅ 60% готово

**Функции:**
- Навигация (Home, Calendar, Tickets, Notifications, Logout, Profile)
- Hero секция
- Рекомендованные события (horizontal scroll)
- Фильтры по категориям (ACADEMIC, TECH, SPORTS, CULTURAL, SOCIAL, CAREER, Upcoming)
- Сетка событий с карточками
- API интеграция с `/api/events`

**❌ Что отсутствует:**
- Клик на событие не открывает детали (TODO: navigate)
- Кнопки навигации не работают (Calendar, Tickets, Notifications)
- Нет loading states
- Нет error handling

#### 3. **OrganizerDashboard** (`/organizer`)
**Статус:** ⚠️ 20% готово (только UI)

**Функции:**
- Боковая панель с навигацией
- KPI карточки (Total Events, Attendees, Active Events, Avg Rating)
- График посещаемости (placeholder)
- Таблица событий

**❌ Что отсутствует:**
- API интеграция (все данные mock)
- Эндпоинты `/api/organizer/stats` и `/api/organizer/events` не существуют
- Кнопки навигации не работают
- Create Event кнопка не работает

---

## 🗄 База данных

### Prisma Schema

#### **User Model**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  avatar    String?
  faculty   String?
  role      Role     @default(STUDENT)

  // Email verification
  emailVerified Boolean @default(false)
  verificationCode String?
  verificationCodeExpiry DateTime?

  // Relations
  createdEvents    Event[]        @relation("EventCreator")
  registrations    Registration[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  STUDENT
  ORGANIZER
  ADMIN
}
```

#### **Event Model**
```prisma
model Event {
  id          String   @id @default(uuid())
  title       String
  description String   @db.Text
  category    Category
  location    String
  startDate   DateTime
  endDate     DateTime
  capacity    Int
  imageUrl    String?
  status      EventStatus @default(UPCOMING)

  // Relations
  creatorId   String
  creator     User     @relation("EventCreator", fields: [creatorId])
  registrations Registration[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Category {
  ACADEMIC
  SPORTS
  CULTURAL
  TECH
  SOCIAL
  CAREER
  OTHER
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}
```

#### **Registration Model**
```prisma
model Registration {
  id         String   @id @default(uuid())
  userId     String
  eventId    String
  status     RegistrationStatus @default(REGISTERED)
  checkedIn  Boolean  @default(false)
  checkedInAt DateTime?

  // Relations
  user       User     @relation(fields: [userId])
  event      Event    @relation(fields: [eventId])

  createdAt  DateTime @default(now())

  @@unique([userId, eventId])
}

enum RegistrationStatus {
  REGISTERED
  WAITLIST
  CANCELLED
}
```

---

## 🔐 Аутентификация и авторизация

### Стратегия JWT

**Access Token:**
- Срок жизни: 1 час
- Payload: `{ sub: userId, email, role }`
- Передается в header: `Authorization: Bearer <token>`

**Refresh Token:**
- Срок жизни: 7 дней
- Используется для обновления access token
- Эндпоинт: `POST /api/auth/refresh`

### Guards

**JwtAuthGuard:**
- Применяется глобально ко всем эндпоинтам (APP_GUARD)
- Проверяет наличие и валидность JWT token
- Декоратор `@Public()` отключает проверку для публичных эндпоинтов

**RolesGuard:**
- Применяется глобально (APP_GUARD)
- Проверяет роль пользователя
- Декоратор `@Roles(Role.ADMIN, Role.ORGANIZER)` требует определенные роли

### Email Verification

1. При регистрации генерируется 6-значный код
2. Код отправляется на email (через Nodemailer)
3. Срок действия кода: 24 часа
4. До верификации `emailVerified = false`
5. Пользователь должен верифицировать email перед доступом к функционалу

**⚠️ ПРОБЛЕМА:** На frontend нет страницы верификации!

---

## 🎨 Дизайн система

### Цветовая палитра

```typescript
// theme.ts
export const colors = {
  // Primary
  primary: '#d62e1f',           // MNU красный
  primaryHover: '#b52419',

  // Dark theme (Students)
  dark: {
    bg: '#0a0a0a',
    bgCard: '#1a1a1a',
    bgGlass: 'rgba(26, 26, 26, 0.7)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
  },

  // Light theme (Organizers)
  light: {
    bg: '#ffffff',
    bgGray: '#f8f9fa',
    bgCard: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
  },

  // CSI Colors (используются для категорий)
  csi: {
    creativity: '#f59e0b',      // Orange (SPORTS, CULTURAL)
    service: '#3b82f6',         // Blue (SOCIAL, CAREER)
    intelligence: '#10b981',    // Green (ACADEMIC, TECH)
  },

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### Типография

**Шрифт:** Montserrat (Google Fonts)
**Веса:** 400, 500, 600, 700, 800

```typescript
export const typography = {
  fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};
```

### Spacing

```typescript
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};
```

### Эффекты

**Glassmorphism:**
```css
background: rgba(26, 26, 26, 0.7);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 28px;
```

**Shadows:**
```typescript
export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
  md: '0 4px 16px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.3)',
};
```

### Animations

```css
/* Floating particles */
@keyframes particleFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(50px, -80px) rotate(120deg); }
  66% { transform: translate(-40px, 60px) rotate(240deg); }
}

/* Slide in */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shake (for errors) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## ⚙️ Окружение и конфигурация

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://mnu_user:mnu_password@localhost:5432/mnu_events_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1h"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
REFRESH_TOKEN_EXPIRATION="7d"

# Email Verification
EMAIL_VERIFICATION_SECRET="your-email-verification-secret"
EMAIL_VERIFICATION_EXPIRATION="24h"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@mnuevents.kz"

# Application
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
THROTTLE_TTL=60         # 60 seconds
THROTTLE_LIMIT=100      # 100 requests per TTL (увеличено для dev)

# File Upload
MAX_FILE_SIZE=5242880   # 5MB
UPLOAD_DIR="./uploads"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

**⚠️ ВАЖНО:** URL **НЕ** должен содержать `/api` - это добавляется в коде!

---

## ⚠️ Важные замечания

### 1. API Prefix

Backend использует глобальный префикс `/api`:
```typescript
// main.ts
app.setGlobalPrefix('api');
```

Все эндпоинты начинаются с `/api/...`

### 2. CORS

CORS настроен на `http://localhost:5173` (frontend dev server).

В production нужно изменить на реальный домен!

### 3. Rate Limiting

Текущий лимит: **100 запросов в 60 секунд** (для development).

В production рекомендуется снизить до 10-20.

### 4. Email Verification

⚠️ **КРИТИЧЕСКАЯ ПРОБЛЕМА:**
- Backend требует email verification
- Frontend не имеет страницы для ввода кода
- После регистрации пользователь не может войти до верификации!

### 5. Protected Routes

⚠️ **ПРОБЛЕМА:**
- Нет защиты роутов на frontend
- Студент может зайти на `/organizer`
- Нет проверки JWT token перед рендером

### 6. API Services

⚠️ **ПРОБЛЕМА:**
- Нет centralized API layer
- Каждый компонент делает fetch напрямую
- Нет error handling и retry логики
- Нет interceptors для добавления token

### 7. Organizer Dashboard API

⚠️ **ПРОБЛЕМА:**
- Dashboard использует несуществующие эндпоинты:
  - `/api/organizer/stats` ❌
  - `/api/organizer/events` ❌
- Должно быть:
  - `/api/events/my` ✅
  - Custom statistics endpoint (TODO)

### 8. CSS Modules vs Tailwind

⚠️ **НЕСООТВЕТСТВИЕ:**
- README упоминает Tailwind CSS
- Реально используются CSS Modules
- Нет Tailwind конфигурации

### 9. Seed Data

Backend имеет seed данные:
- 5 пользователей (1 Admin, 1 Organizer, 3 Students)
- 10 событий (разные категории)
- 7 регистраций

**Пароль для всех:** `Password123!`

**Тестовые аккаунты:**
```
student1@kazguu.kz / Password123!
student2@kazguu.kz / Password123!
student3@kazguu.kz / Password123!
organizer@kazguu.kz / Password123!
admin@kazguu.kz / Password123!
```

### 10. Docker Compose

Проект настроен с Docker Compose:
- PostgreSQL на порту 5432
- pgAdmin на порту 5050 (admin@mnuevents.kz / admin)

---

## 📊 Статус готовности

| Компонент | Готовность | Примечания |
|-----------|-----------|-----------|
| Backend Auth | ✅ 100% | Полностью работает |
| Backend Events | ✅ 100% | Полностью работает |
| Backend Registrations | ✅ 100% | Полностью работает |
| Backend Users | ✅ 100% | Полностью работает |
| Frontend Login | ⚠️ 70% | Нет email verification flow |
| Frontend Student Home | ⚠️ 60% | Нет переходов, частичный API |
| Frontend Organizer Dashboard | ⚠️ 20% | Только UI, mock данные |
| Frontend Event Details | ❌ 0% | Отсутствует |
| Frontend Registrations | ❌ 0% | Отсутствует |
| Frontend Profile | ❌ 0% | Отсутствует |
| Frontend Create Event | ❌ 0% | Отсутствует |
| Frontend Participants | ❌ 0% | Отсутствует |
| Frontend API Services | ❌ 0% | Отсутствует |
| Frontend Protected Routes | ❌ 0% | Отсутствует |

**Общий прогресс:** Backend 100% | Frontend 30% | **Итого: ~50% MVP**

---

## 📚 Полезные команды

### Backend
```bash
# Установка зависимостей
npm install

# Генерация Prisma Client
npx prisma generate

# Миграция базы данных
npx prisma migrate dev

# Seed данных
npx prisma db seed

# Запуск dev сервера
npm run start:dev

# Swagger документация
http://localhost:3001/api/docs
```

### Frontend
```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Build для production
npm run build
```

### Docker
```bash
# Запуск PostgreSQL + pgAdmin
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f
```

---

## 🔗 Ссылки

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Swagger Docs:** http://localhost:3001/api/docs
- **pgAdmin:** http://localhost:5050

---

**Конец документации**
