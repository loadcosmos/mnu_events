# MNU Events - Backend API

University Events Management Platform for MNU (Kazakhstan-German University)

## 📋 Overview

MNU Events is a comprehensive platform for managing university events, allowing students to discover and register for events, organizers to create and manage events, and administrators to oversee the entire system.

## 🚀 Features

### For Students
- ✅ Register with @kazguu.kz email
- ✅ Email verification with 6-digit code
- ✅ Browse events with filters (category, date, status)
- ✅ Register for events
- ✅ View registered events
- ✅ Update profile

### For Organizers
- ✅ Create and manage events
- ✅ View event statistics
- ✅ Check-in participants
- ✅ Export participant lists

### For Admins
- ✅ Manage all users and events
- ✅ Assign/remove organizer roles
- ✅ View platform-wide statistics

## 🛠️ Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI
- **Email:** Nodemailer
- **Rate Limiting:** @nestjs/throttler

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication (JWT, email verification)
│   ├── users/             # User management
│   ├── events/            # Event management
│   ├── registrations/     # Event registrations
│   ├── prisma/            # Prisma service
│   ├── common/            # Shared utilities (filters, pipes, interceptors)
│   ├── config/            # Configuration
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Test data
├── .env.example           # Environment variables template
├── Dockerfile             # Docker configuration
└── package.json
```

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mnu_events/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL (using Docker)**
```bash
cd ..
docker-compose up -d
```

5. **Run database migrations**
```bash
npx prisma generate
npx prisma migrate dev
```

6. **Seed database with test data**
```bash
npm run prisma:seed
```

7. **Start development server**
```bash
npm run start:dev
```

The API will be available at:
- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- pgAdmin: http://localhost:5050

## 🧪 Test Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kazguu.kz | Password123! |
| Organizer | organizer@kazguu.kz | Password123! |
| Student | student1@kazguu.kz | Password123! |
| Student | student2@kazguu.kz | Password123! |
| Student | student3@kazguu.kz | Password123! |

## 📚 API Documentation

Once the server is running, visit http://localhost:3001/api/docs for interactive API documentation.

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user (sends verification code)
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

#### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Organizer/Admin)
- `PATCH /api/events/:id` - Update event (Creator/Admin)
- `DELETE /api/events/:id` - Delete event (Creator/Admin)
- `GET /api/events/:id/statistics` - Get event statistics

#### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/my` - Get my registrations
- `DELETE /api/registrations/:id` - Cancel registration
- `PATCH /api/registrations/:id/checkin` - Check-in participant (Organizer/Admin)

#### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `PATCH /api/users/:id/role` - Update role (Admin)

## 🗄️ Database Schema

### User
- Email (must be @kazguu.kz)
- Password (bcrypt hashed)
- Name (first + last)
- Role (STUDENT, ORGANIZER, ADMIN)
- Email verification status

### Event
- Title, description, category
- Location, dates (start + end)
- Capacity
- Status (UPCOMING, ONGOING, COMPLETED, CANCELLED)
- Creator reference

### Registration
- User + Event reference
- Status (REGISTERED, WAITLIST, CANCELLED)
- Check-in status + timestamp

## 🔒 Security

- JWT authentication with access + refresh tokens
- Email verification required
- Password strength validation
- Role-based access control (RBAC)
- Rate limiting (10 requests/minute)
- CORS configuration
- SQL injection protection (Prisma)
- XSS protection

## 📦 Scripts

```bash
# Development
npm run start:dev        # Start dev server with hot reload
npm run build            # Build for production
npm run start:prod       # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Code Quality
npm run lint             # Lint code
npm run format           # Format code
npm run test             # Run tests
npm run test:cov         # Run tests with coverage
```

## 🌍 Environment Variables

See `.env.example` for all required environment variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...
CORS_ORIGIN=http://localhost:5173
```

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 License

MIT

## 👥 Author

MNU Student
