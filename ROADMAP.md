# MNU Events - Roadmap & План задач

> **Последнее обновление:** 2025-11-08
> **Версия:** 1.0.0
> **Текущий статус:** MVP Phase 1 (50% завершено)

---

## 📊 Общий прогресс

| Фаза | Статус | Прогресс | Дедлайн |
|------|--------|---------|---------|
| **Phase 1: MVP Backend** | ✅ Завершено | 100% | Готово |
| **Phase 2: MVP Frontend Core** | 🟡 В процессе | 30% | В работе |
| **Phase 3: MVP Features** | ⏸️ Ожидание | 0% | - |
| **Phase 4: Advanced Features** | ⏸️ Планируется | 0% | - |

---

## 🎯 Phase 1: MVP Backend [✅ ЗАВЕРШЕНО]

### ✅ Часть 1.1: Инфраструктура (100%)
- [x] NestJS setup с TypeScript
- [x] Prisma ORM + PostgreSQL
- [x] Docker Compose (PostgreSQL + pgAdmin)
- [x] Environment configuration
- [x] Swagger documentation
- [x] Rate limiting (Throttler)
- [x] Global validation pipes
- [x] Error handling (HttpExceptionFilter)

### ✅ Часть 1.2: Аутентификация (100%)
- [x] JWT authentication (access + refresh tokens)
- [x] Email verification (6-значный код)
- [x] Nodemailer setup (Gmail SMTP)
- [x] Password hashing (Bcrypt)
- [x] Guards: JwtAuthGuard, RolesGuard
- [x] Decorators: @Public, @Roles, @CurrentUser
- [x] Валидация @kazguu.kz для студентов

**Эндпоинты:**
- [x] POST /api/auth/register
- [x] POST /api/auth/verify-email
- [x] POST /api/auth/resend-code
- [x] POST /api/auth/login
- [x] POST /api/auth/refresh
- [x] GET /api/auth/profile

### ✅ Часть 1.3: Events CRUD (100%)
- [x] Events service и controller
- [x] CRUD операции (Create, Read, Update, Delete)
- [x] Фильтрация (category, status, date, search)
- [x] Пагинация (page, limit)
- [x] Статистика по событию
- [x] "Мои события" для организаторов
- [x] RBAC (ORGANIZER/ADMIN can create)

**Эндпоинты:**
- [x] GET /api/events (публичный)
- [x] GET /api/events/:id (публичный)
- [x] POST /api/events (ORGANIZER/ADMIN)
- [x] PATCH /api/events/:id (Creator/ADMIN)
- [x] DELETE /api/events/:id (Creator/ADMIN)
- [x] GET /api/events/my
- [x] GET /api/events/:id/statistics

### ✅ Часть 1.4: Registrations (100%)
- [x] Registration service и controller
- [x] Регистрация на события
- [x] Автоматический waitlist при capacity
- [x] Отмена регистрации
- [x] Check-in функционал
- [x] Undo check-in
- [x] Просмотр участников события
- [x] Unique constraint (userId + eventId)

**Эндпоинты:**
- [x] POST /api/registrations
- [x] GET /api/registrations/my
- [x] DELETE /api/registrations/:id
- [x] GET /api/registrations/event/:eventId
- [x] PATCH /api/registrations/:id/checkin
- [x] PATCH /api/registrations/:id/undo-checkin

### ✅ Часть 1.5: Users Management (100%)
- [x] Users service и controller
- [x] Просмотр профиля
- [x] Обновление профиля
- [x] Изменение роли (Admin only)
- [x] Удаление пользователя
- [x] Список пользователей (Admin only)

**Эндпоинты:**
- [x] GET /api/users (ADMIN)
- [x] GET /api/users/:id
- [x] PATCH /api/users/:id
- [x] PATCH /api/users/:id/role (ADMIN)
- [x] DELETE /api/users/:id

### ✅ Часть 1.6: Seed Data (100%)
- [x] Seed script с тестовыми данными
- [x] 5 пользователей (Admin, Organizer, 3 Students)
- [x] 10 разнообразных событий
- [x] 7 регистраций с check-ins

---

## 🔥 Phase 2: MVP Frontend Core [🟡 30% В ПРОЦЕССЕ]

### ✅ Часть 2.1: Дизайн система (100%)
- [x] Theme.ts (colors, typography, spacing, shadows)
- [x] Global CSS (reset, scrollbar, fonts)
- [x] CSS Modules setup
- [x] Font Awesome 6.5 icons
- [x] Montserrat font (Google Fonts)
- [x] Glassmorphism стили
- [x] Анимации (float, slideIn, shake)

### ⚠️ Часть 2.2: Логин и регистрация (70%)
**Статус:** Частично готово

**✅ Готово:**
- [x] Login.tsx компонент
- [x] Переключатель Student/Organizer
- [x] Sign In / Sign Up вкладки
- [x] Валидация @kazguu.kz
- [x] API интеграция с /api/auth/register и /api/auth/login
- [x] Анимированный красный фон
- [x] Glassmorphism контейнер
- [x] Error/success messages

**❌ TODO:**
- [ ] **Email Verification страница** (КРИТИЧНО!)
  - [ ] Создать `/verify-email` страницу
  - [ ] Форма для ввода 6-значного кода
  - [ ] Кнопка "Resend code"
  - [ ] Таймер (24 часа)
  - [ ] API интеграция с `/api/auth/verify-email`
  - [ ] Редирект на dashboard после успешной верификации
- [ ] Forgot password flow
- [ ] Better error handling (toasts)
- [ ] Loading states

**Приоритет:** 🔴 Критический (без email verification система не работает!)

### ⚠️ Часть 2.3: Student Home (60%)
**Статус:** Частично готово

**✅ Готово:**
- [x] StudentHome.tsx компонент
- [x] Top navigation (Home, Calendar, Tickets, Notifications, Logout, Profile)
- [x] Hero секция с gradient текстом
- [x] Рекомендованные события (horizontal scroll)
- [x] Фильтры категорий (ACADEMIC, TECH, SPORTS, CULTURAL, SOCIAL, CAREER, Upcoming)
- [x] Сетка событий с карточками
- [x] API интеграция с `/api/events`
- [x] Темная тема с glassmorphism
- [x] Анимированный фон с particles
- [x] Hover эффекты на карточках
- [x] onClick handlers на карточках (console.log)

**❌ TODO:**
- [ ] **Event Details страница** (КРИТИЧНО!)
  - [ ] Создать `/events/:id` страницу
  - [ ] Детальная информация о событии
  - [ ] Кнопка "Register for Event"
  - [ ] Проверка уже зарегистрирован или нет
  - [ ] Отображение capacity и available slots
  - [ ] Информация о создателе
  - [ ] API интеграция
- [ ] Calendar page (`/calendar`)
- [ ] My Tickets page (`/tickets`)
- [ ] Notifications page (`/notifications`)
- [ ] Search функционал
- [ ] Loading states для событий
- [ ] Error handling
- [ ] Empty state когда нет событий

**Приоритет:** 🔴 Критический (Event Details), 🟡 Средний (остальное)

### ⚠️ Часть 2.4: Organizer Dashboard (20%)
**Статус:** Только UI

**✅ Готово:**
- [x] OrganizerDashboard.tsx компонент
- [x] Боковая панель с навигацией
- [x] KPI карточки (mock данные)
- [x] График (placeholder)
- [x] Таблица событий (mock данные)
- [x] Светлая тема
- [x] Responsive sidebar

**❌ TODO:**
- [ ] **API интеграция** (КРИТИЧНО!)
  - [ ] Подключить к `/api/events/my`
  - [ ] Создать эндпоинт для статистики (backend TODO)
  - [ ] Real-time данные вместо mock
- [ ] **Create Event кнопка**
  - [ ] Роутинг на `/organizer/events/new`
- [ ] Навигация по sidebar
- [ ] Event actions (Edit, View, Delete)
- [ ] Loading states
- [ ] Error handling

**Приоритет:** 🟡 Средний

### ❌ Часть 2.5: API Services Layer (0%)
**Статус:** Отсутствует

**TODO:**
- [ ] Создать `/src/services/api/` структуру
- [ ] Axios instance с базовой конфигурацией
- [ ] Interceptors для JWT token
- [ ] Interceptors для error handling
- [ ] API services:
  - [ ] `authService.ts` (login, register, verify, refresh)
  - [ ] `eventsService.ts` (getAll, getById, create, update, delete)
  - [ ] `registrationsService.ts` (register, cancel, getMyRegistrations)
  - [ ] `usersService.ts` (getProfile, updateProfile)
- [ ] TypeScript types для всех API responses
- [ ] Error handling utilities
- [ ] Retry logic

**Приоритет:** 🔴 Критический

### ❌ Часть 2.6: Protected Routes (0%)
**Статус:** Отсутствует

**TODO:**
- [ ] Создать `ProtectedRoute` компонент
- [ ] Проверка JWT token в localStorage
- [ ] Редирект на `/login` если нет токена
- [ ] Проверка роли пользователя
- [ ] Роут guards:
  - [ ] Student routes (/, /events/:id, /tickets, /profile)
  - [ ] Organizer routes (/organizer/*)
  - [ ] Admin routes (/admin/*)
- [ ] Редирект на правильный dashboard по роли после логина

**Приоритет:** 🔴 Критический

### ❌ Часть 2.7: State Management (0%)
**Статус:** Отсутствует

**TODO:**
- [ ] Auth Context (useAuth hook)
  - [ ] Current user state
  - [ ] Login/logout/refresh functions
  - [ ] Token management
- [ ] Events Context (опционально, можно через React Query)
- [ ] Notifications Context (для toasts)

**Приоритет:** 🟡 Средний

---

## 🚀 Phase 3: MVP Features [⏸️ 0% ОЖИДАНИЕ]

### ❌ Часть 3.1: My Registrations Page (0%)
**Приоритет:** 🔴 Критический

**TODO:**
- [ ] Создать `/my-registrations` страницу
- [ ] Список зарегистрированных событий
- [ ] Фильтры: Upcoming / Past / Waitlist
- [ ] Статус регистрации (REGISTERED, WAITLIST, CANCELLED)
- [ ] Кнопка "Cancel Registration" с confirmation
- [ ] Check-in статус (если событие прошло)
- [ ] Empty state
- [ ] API интеграция с `/api/registrations/my`

### ❌ Часть 3.2: User Profile Page (0%)
**Приоритет:** 🟡 Средний

**TODO:**
- [ ] Создать `/profile` страницу
- [ ] Отображение информации:
  - [ ] Avatar (upload TODO)
  - [ ] First Name, Last Name
  - [ ] Email (read-only)
  - [ ] Faculty
  - [ ] Role badge
- [ ] Форма редактирования
- [ ] Change password функционал (backend TODO)
- [ ] Avatar upload (backend TODO)
- [ ] API интеграция с `/api/users/:id`
- [ ] Validation

### ❌ Часть 3.3: Create/Edit Event (Organizer) (0%)
**Приоритет:** 🔴 Критический

**TODO:**
- [ ] Создать `/organizer/events/new` страницу
- [ ] Создать `/organizer/events/:id/edit` страницу
- [ ] Multi-step форма (3 шага):
  - **Step 1: Basic Info**
    - [ ] Title (required)
    - [ ] Description (required, rich text editor - React Quill)
    - [ ] Category (dropdown, required)
    - [ ] Location (required)
  - **Step 2: Schedule & Capacity**
    - [ ] Start Date & Time (required, datepicker)
    - [ ] End Date & Time (required, datepicker)
    - [ ] Capacity (required, number input)
    - [ ] Валидация: endDate > startDate, startDate > now
  - **Step 3: Image & Preview**
    - [ ] Image upload (optional, drag & drop)
    - [ ] Preview карточки события
    - [ ] Submit button
- [ ] Framer Motion анимации переходов между шагами
- [ ] Validation для всех полей
- [ ] API интеграция с `/api/events` (POST/PATCH)
- [ ] Success toast + редирект на dashboard
- [ ] Error handling

### ❌ Часть 3.4: Event Participants Management (Organizer) (0%)
**Приоритет:** 🟡 Средний

**TODO:**
- [ ] Создать `/organizer/events/:id/participants` страницу
- [ ] Таблица участников:
  - [ ] Name, Email, Faculty
  - [ ] Registration Status (REGISTERED, WAITLIST)
  - [ ] Check-in Status (checked in / not checked in)
  - [ ] Check-in Time (если checked in)
- [ ] Фильтры: All / Checked In / Not Checked In / Waitlist
- [ ] Поиск по имени/email
- [ ] Bulk actions:
  - [ ] Check-in selected
  - [ ] Export to Excel (backend TODO)
- [ ] Manual check-in/undo кнопки для каждого участника
- [ ] API интеграция с `/api/registrations/event/:eventId`
- [ ] Real-time updates (опционально, через polling)

### ❌ Часть 3.5: Calendar View (0%)
**Приоритет:** 🟢 Низкий

**TODO:**
- [ ] Создать `/calendar` страницу
- [ ] Календарь компонент (react-big-calendar или react-calendar)
- [ ] Отображение событий по датам
- [ ] Клик на событие → Event Details
- [ ] Фильтры по категориям
- [ ] Переключение: Month / Week / Day views
- [ ] API интеграция с `/api/events`

### ❌ Часть 3.6: Notifications System (0%)
**Приоритет:** 🟢 Низкий

**TODO:**
- [ ] Backend:
  - [ ] Notifications model в Prisma
  - [ ] Notifications service и controller
  - [ ] Эндпоинты: GET /api/notifications, PATCH /api/notifications/:id/read
  - [ ] Автоматические уведомления:
    - [ ] При регистрации на событие
    - [ ] Напоминание за 1 день до события
    - [ ] Когда событие отменено
- [ ] Frontend:
  - [ ] `/notifications` страница
  - [ ] Список уведомлений (read/unread)
  - [ ] Badge с количеством непрочитанных в навигации
  - [ ] Mark as read функционал
  - [ ] Mark all as read
  - [ ] Real-time updates (WebSocket или polling)

---

## 🎨 Phase 4: Advanced Features [⏸️ 0% ПЛАНИРУЕТСЯ]

### ❌ Часть 4.1: Student Profile с CSI Gamification (0%)
**Оригинальный brief: Часть 3**

**TODO:**
- [ ] Создать `/profile/stats` страницу (или раздел в `/profile`)
- [ ] CSI Progress Bars:
  - [ ] Creativity (оранжевый) - прогресс по SPORTS, CULTURAL событиям
  - [ ] Service (синий) - прогресс по SOCIAL, CAREER событиям
  - [ ] Intelligence (зеленый) - прогресс по ACADEMIC, TECH событиям
  - [ ] Система очков (points) за каждое посещенное событие
  - [ ] Уровни: Bronze, Silver, Gold, Platinum
- [ ] Badges система:
  - [ ] "Event Explorer" - посетил первое событие
  - [ ] "Social Butterfly" - посетил 5 social событий
  - [ ] "Tech Guru" - посетил 10 tech событий
  - [ ] И т.д. (10-15 badges)
- [ ] Timeline посещенных событий
- [ ] Leaderboard (топ студентов по CSI points)
- [ ] Backend:
  - [ ] CSI points calculation logic
  - [ ] Badges system
  - [ ] Leaderboard endpoint

### ❌ Часть 4.2: QR Check-in System (0%)
**Оригинальный brief: Часть 6**

**TODO:**
- [ ] Student Ticket:
  - [ ] `/tickets/:registrationId` страница
  - [ ] QR code генерация (qrcode.react)
  - [ ] QR код содержит: registrationId + signature
  - [ ] Информация о событии
  - [ ] Countdown до начала события
  - [ ] Apple Wallet / Google Pay integration (опционально)
- [ ] Organizer Scanner:
  - [ ] `/organizer/checkin` страница
  - [ ] QR scanner (react-qr-reader)
  - [ ] Сканирование QR кода
  - [ ] Верификация signature
  - [ ] Зеленая вспышка при успешном check-in
  - [ ] Красная вспышка при ошибке (уже checked in, invalid QR)
  - [ ] Sound feedback
  - [ ] Статистика: сколько checked in / total
- [ ] Backend:
  - [ ] QR signature generation/verification
  - [ ] Check-in через QR (POST /api/registrations/checkin-qr)

### ❌ Часть 4.3: Analytics Dashboard (Organizer) (0%)
**Оригинальный brief: Часть 7**

**TODO:**
- [ ] Создать `/organizer/analytics` страницу
- [ ] Графики (recharts):
  - [ ] Attendance over time (line chart)
  - [ ] Events by category (pie chart)
  - [ ] Top 10 events by attendance (bar chart)
  - [ ] Registration trends (line chart)
- [ ] KPIs:
  - [ ] Total events created
  - [ ] Total attendees
  - [ ] Average attendance rate (checked in / registered)
  - [ ] Average rating (после добавления ratings)
- [ ] Фильтры: Last 7 days / 30 days / 3 months / All time
- [ ] Export reports (PDF или Excel)
- [ ] Backend:
  - [ ] Analytics service
  - [ ] Aggregation queries (Prisma aggregate)
  - [ ] GET /api/analytics/overview

### ❌ Часть 4.4: Ratings & Feedback (0%)

**TODO:**
- [ ] Backend:
  - [ ] Ratings model (userId, eventId, rating 1-5, comment)
  - [ ] Ratings service и controller
  - [ ] POST /api/ratings (только для checked in users)
  - [ ] GET /api/ratings/event/:eventId (для организаторов)
  - [ ] Средний rating для события
- [ ] Frontend:
  - [ ] Rating modal после события (для студентов)
  - [ ] 5-star rating компонент
  - [ ] Comment textarea
  - [ ] Feedback display для организаторов
  - [ ] Rating distribution chart

### ❌ Часть 4.5: Admin Panel (0%)

**TODO:**
- [ ] Создать `/admin` layout с sidebar
- [ ] Users Management:
  - [ ] `/admin/users` - список всех пользователей
  - [ ] Поиск и фильтры
  - [ ] Change role функционал
  - [ ] Ban/unban users
- [ ] Events Moderation:
  - [ ] `/admin/events` - все события
  - [ ] Approve/reject новых событий (опционально)
  - [ ] Delete inappropriate events
- [ ] Platform Statistics:
  - [ ] `/admin/dashboard`
  - [ ] Total users, events, registrations
  - [ ] Growth charts
  - [ ] Active users metrics
- [ ] System Settings:
  - [ ] Email templates configuration
  - [ ] Rate limiting settings
  - [ ] Feature flags

### ❌ Часть 4.6: Email Notifications (0%)

**TODO:**
- [ ] Email templates (Handlebars или React Email):
  - [ ] Welcome email после регистрации
  - [ ] Email verification code
  - [ ] Event registration confirmation
  - [ ] Event reminder (1 day before)
  - [ ] Event cancellation notice
  - [ ] Check-in confirmation
- [ ] Background jobs (Bull или BullMQ):
  - [ ] Queue для отправки emails
  - [ ] Scheduled jobs для reminders
  - [ ] Retry logic
- [ ] Backend настройка:
  - [ ] Email service refactoring
  - [ ] Template engine integration
  - [ ] Job queue setup

### ❌ Часть 4.7: Image Upload (0%)

**TODO:**
- [ ] Backend:
  - [ ] Multer setup для file upload
  - [ ] POST /api/upload/event-image
  - [ ] Image validation (размер, тип)
  - [ ] Resize images (Sharp)
  - [ ] Хранение: локально или S3
- [ ] Frontend:
  - [ ] Drag & drop компонент
  - [ ] Image preview
  - [ ] Crop functionality (опционально)
  - [ ] Progress bar при загрузке

### ❌ Часть 4.8: Advanced Search & Filters (0%)

**TODO:**
- [ ] Backend:
  - [ ] Full-text search (Prisma или PostgreSQL FTS)
  - [ ] Advanced filters API
  - [ ] Sorting options
- [ ] Frontend:
  - [ ] Search bar с suggestions
  - [ ] Advanced filters panel:
    - [ ] Date range picker
    - [ ] Multiple categories
    - [ ] Faculty filter
    - [ ] Capacity range
    - [ ] Rating filter
  - [ ] Sort by: date, popularity, rating
  - [ ] Save filter presets

### ❌ Часть 4.9: Club Management (0%)

**TODO:**
- [ ] Backend:
  - [ ] Clubs model (name, description, members, organizers)
  - [ ] Clubs service и controller
  - [ ] Club membership system
- [ ] Frontend:
  - [ ] `/clubs` страница - список всех клубов
  - [ ] `/clubs/:id` - страница клуба с событиями
  - [ ] Join/leave club функционал
  - [ ] Club admin panel для управления событиями

---

## 🐛 Known Issues & Tech Debt

### 🔴 Критические блокирующие баги (Фаза 0 - Немедленно!)
- [ ] ❌ **Опечатка в AdminLoginPage**: `login.logout()` вместо `logout()` на строке 42
- [ ] ❌ **Отсутствует эндпоинт POST /api/auth/logout** на бэкенде
- [ ] ❌ **CSS стили не применяются** на страницах Login, Admin Login и Dashboard

### Критические проблемы
- [ ] ❌ Email verification flow отсутствует на frontend
- [ ] ❌ Protected routes отсутствуют (можно зайти куда угодно)
- [ ] ❌ API services layer отсутствует
- [ ] ❌ Organizer dashboard использует mock данные
- [ ] ❌ Event Details страница отсутствует (нельзя посмотреть событие)

### Средние проблемы
- [ ] ⚠️ Нет loading states
- [ ] ⚠️ Нет error handling (toasts)
- [ ] ⚠️ Нет confirmation dialogs
- [ ] ⚠️ Нет state management (Auth context)
- [ ] ⚠️ README упоминает Tailwind, но используются CSS Modules

### Низкие проблемы
- [ ] 🟢 Нет TypeScript types для API responses
- [ ] 🟢 Нет retry logic для API
- [ ] 🟢 Нет оптимистичных обновлений
- [ ] 🟢 Нет кеширования данных
- [ ] 🟢 Swagger tags не идеальны

---

## 📅 Рекомендуемая последовательность выполнения

### Sprint 1: Критический функционал (2 недели)
1. ✅ Email Verification страница (День 1-2)
2. ✅ API Services Layer (День 3-4)
3. ✅ Protected Routes (День 5)
4. ✅ Event Details страница (День 6-7)
5. ✅ My Registrations страница (День 8-9)
6. ✅ Organizer Dashboard API интеграция (День 10)

**Цель:** Полноценный MVP с основными функциями

### Sprint 2: Organizer Features (1.5 недели)
1. ✅ Create/Edit Event форма (День 1-4)
2. ✅ Event Participants Management (День 5-7)
3. ✅ User Profile страница (День 8-10)

**Цель:** Организаторы могут создавать и управлять событиями

### Sprint 3: UX Improvements (1 неделя)
1. ✅ Loading states везде
2. ✅ Toast notifications
3. ✅ Confirmation dialogs
4. ✅ Error handling улучшение
5. ✅ Calendar view
6. ✅ Search функционал

**Цель:** Отполированный UX

### Sprint 4: Advanced Features (2 недели)
1. ✅ QR Check-in System (День 1-5)
2. ✅ Analytics Dashboard (День 6-8)
3. ✅ Ratings & Feedback (День 9-10)
4. ✅ CSI Gamification (День 11-14)

**Цель:** Уникальные фичи платформы

### Sprint 5: Admin & Polish (1 неделя)
1. ✅ Admin Panel
2. ✅ Email Notifications
3. ✅ Image Upload
4. ✅ Bug fixes
5. ✅ Performance optimization

**Цель:** Готово к production

---

## 🔄 Процесс обновления этого документа

**ВАЖНО:** После завершения каждой задачи обновляй этот файл!

1. Измени статус задачи с `[ ]` на `[x]`
2. Обнови процент прогресса Phase/Section
3. Добавь дату завершения если нужно
4. Если обнаружены новые проблемы - добавь в Known Issues
5. Закоммить изменения в git

**Пример:**
```bash
# После завершения Email Verification
git add ROADMAP.md
git commit -m "docs: Mark Email Verification as completed"
git push
```

---

## 📊 Tracking Progress

Используй этот чеклист чтобы отслеживать прогресс:

**Phase 1 (Backend):** ✅ 6/6 (100%)
**Phase 2 (Frontend Core):** 🟡 2/7 (30%)
**Phase 3 (MVP Features):** ⏸️ 0/6 (0%)
**Phase 4 (Advanced):** ⏸️ 0/9 (0%)

**Общий прогресс MVP (Phase 1-3):** 8/19 = 42%
**Общий прогресс Full Product (Phase 1-4):** 8/28 = 29%

---

**Конец Roadmap**

_Последнее обновление: 2025-11-08 by Claude_
