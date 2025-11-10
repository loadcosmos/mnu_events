# MNU Events - University Events Management Platform

Платформа для управления университетскими мероприятиями **Maqsut Narikbayev University (MNU)**, Astana, Kazakhstan.

## О проекте

MNU Events - это комплексная платформа для управления событиями университета, которая позволяет:
- **Студентам** находить и регистрироваться на мероприятия
- **Организаторам** создавать и управлять событиями
- **Администраторам** контролировать всю систему

## ✨ Основные возможности

### Для студентов
- ✅ Регистрация с email @kazguu.kz
- ✅ Подтверждение email с кодом верификации
- ✅ Просмотр событий с фильтрами (категория, дата, статус)
- ✅ Регистрация на мероприятия
- ✅ Просмотр зарегистрированных событий
- ✅ Управление профилем

### Для организаторов
- ✅ Создание и редактирование событий
- ✅ Просмотр статистики по событиям
- ✅ Check-in участников
- ✅ Экспорт списков участников

### Для администраторов
- ✅ Управление пользователями и событиями
- ✅ Назначение/снятие ролей организаторов
- ✅ Просмотр общей статистики платформы

## 🛠 Технологический стек

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Email:** Nodemailer
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator

### Frontend
- **Framework:** React 19 + JavaScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **State:** React Context API
- **HTTP:** Axios with interceptors
- **Styling:** Original CSS (glassmorphism + MNU branding)

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Management:** pgAdmin

## 📁 Структура проекта

```
mnu_events/
├── backend/                    # Backend API (NestJS)
│   ├── src/
│   │   ├── auth/              # Аутентификация
│   │   ├── users/             # Управление пользователями
│   │   ├── events/            # Управление событиями
│   │   ├── registrations/     # Регистрации на события
│   │   ├── prisma/            # Prisma сервис
│   │   ├── common/            # Общие утилиты
│   │   └── config/            # Конфигурация
│   ├── prisma/
│   │   ├── schema.prisma      # Схема БД
│   │   └── seed.ts            # Тестовые данные
│   └── README.md
│
├── frontend/                  # Frontend (React + Vite)
│   ├── js/                    # JavaScript/JSX файлы
│   │   ├── services/          # API Services Layer
│   │   │   ├── apiClient.js   # Centralized Axios instance
│   │   │   └── authService.js # Authentication service
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── components/        # Компоненты
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/             # Страницы
│   │   ├── App.jsx            # Main app with routing
│   │   └── main.jsx           # Entry point
│   ├── css/                   # Оригинальные стили
│   ├── images/                # Статические изображения
│   ├── svg/                   # SVG иконки
│   └── index.html             # HTML entry point
├── vite.config.js             # Vite конфигурация (root: './frontend')
├── package.json               # Frontend зависимости
├── docker-compose.yml         # Docker для разработки
├── start-all.sh              # Скрипт запуска всего стека
└── README.md                  # Этот файл
```

## 🚀 Быстрый старт

### Windows (PowerShell)
```powershell
.\start-clean.ps1
```

### WSL/Linux (Bash)
```bash
chmod +x start-clean.sh clean-start.sh
./start-clean.sh
```

## 🚀 Быстрый старт (детали)

### Требования
- Node.js 20+
- Docker и Docker Compose
- npm или yarn

### 🧹 Очистка перед запуском

**Windows PowerShell:**
```powershell
# Остановить все процессы и контейнеры
.\clean-start.ps1
```

**Linux/Mac:**
```bash
# Остановить Node.js процессы
pkill -f "node.*backend" || true
pkill -f "node.*vite" || true
docker-compose down
```

### Автоматический запуск

**Windows PowerShell:**
```powershell
# Чистый запуск всего стека
.\start-clean.ps1
```

**Linux/Mac:**
```bash
# Один скрипт запустит всё: БД + Бэкенд + Фронтенд
./start-all.sh
```

Это запустит:
- PostgreSQL на порту 5432
- pgAdmin на http://localhost:5050
- Backend API на http://localhost:3001
- Frontend на http://localhost:5173

### Ручной запуск

#### 1. Запуск PostgreSQL через Docker

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- pgAdmin на http://localhost:5050

#### 2. Настройка Backend

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

#### 3. Настройка Frontend

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

## 🔑 Тестовые аккаунты

После запуска seed скрипта доступны следующие аккаунты:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@kazguu.kz | Password123! |
| Организатор | organizer@kazguu.kz | Password123! |
| Студент 1 | student1@kazguu.kz | Password123! |
| Студент 2 | student2@kazguu.kz | Password123! |
| Студент 3 | student3@kazguu.kz | Password123! |

## 📚 Документация

- **AI Developer Workflow:** [UPDATE_PLAN.md](UPDATE_PLAN.md) (рабочий протокол с MCP инструментами) ⭐
- **Quick Start & Reference:** [QUICKSTART.md](QUICKSTART.md) (объединенный гайд)
- **Backend API:** [backend/README.md](backend/README.md)
- **Frontend Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md) (план задач и прогресс)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Environment Setup:** [backend/ENV_SETUP.md](backend/ENV_SETUP.md) (настройка .env)
- **API Docs:** http://localhost:3001/api/docs (после запуска)

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

## 🔐 Безопасность

- JWT аутентификация (access + refresh tokens)
- Обязательная верификация email
- Валидация силы пароля
- Role-based access control (RBAC)
- Rate limiting (10 запросов/минуту)
- CORS настройка
- Защита от SQL injection (Prisma)
- Защита от XSS

## 🌐 API Endpoints

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
GET     /api/events                 - Все события
GET     /api/events/:id             - Детали события
POST    /api/events                 - Создать событие
PATCH   /api/events/:id             - Обновить событие
DELETE  /api/events/:id             - Удалить событие
GET     /api/events/my              - Мои события
```

### Registrations
```
POST    /api/registrations          - Регистрация на событие
GET     /api/registrations/my       - Мои регистрации
DELETE  /api/registrations/:id      - Отмена регистрации
PATCH   /api/registrations/:id/checkin  - Check-in
```

### Users
```
GET     /api/users                  - Все пользователи (Admin)
GET     /api/users/:id              - Профиль пользователя
PATCH   /api/users/:id              - Обновить профиль
PATCH   /api/users/:id/role         - Изменить роль (Admin)
```

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

## 🗺 Roadmap

### ✅ MVP (Готово)
- [x] Backend API
- [x] Аутентификация с email verification
- [x] Управление событиями
- [x] Регистрация на события
- [x] Check-in функционал
- [x] Frontend (React + API Services Layer)
- [x] Protected Routes с RBAC
- [x] Swagger документация
- [x] Docker Compose
- [x] Seed данные

### v1.1 (В планах)
- [ ] Email уведомления
- [ ] QR коды для check-in
- [ ] Экспорт данных в Excel
- [ ] Расширенные фильтры и поиск
- [ ] Загрузка изображений
- [ ] Органайзер Dashboard

### v2.0 (Будущее)
- [ ] Интеграция с Platonus (SSO)
- [ ] Mobile app (React Native)
- [ ] Push уведомления
- [ ] Аналитика и отчеты
- [ ] Multi-language support
- [ ] Calendar integration

## 🏛 Для университета

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

## 📚 Дополнительная документация

- **[QUICKSTART.md](./QUICKSTART.md)** - Быстрый старт, основные команды и решение проблем
- **[UPDATE_PLAN.md](./UPDATE_PLAN.md)** - План обновлений и следующие шаги
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Архитектура проекта
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Руководство по развертыванию
- **[ROADMAP.md](./ROADMAP.md)** - Roadmap проекта и прогресс

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Студент Maqsut Narikbayev University - Разработчик платформы MNU Events

---

**MNU Events - Connecting University Community Through Events! 🎓**

**Maqsut Narikbayev University, Astana, Kazakhstan**
