# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MNU Events Platform is a university events management system with:
- **Backend**: NestJS 10 + Prisma ORM + PostgreSQL
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7
- **Authentication**: JWT-based auth with role-based access control (STUDENT, ORGANIZER, ADMIN)
- **Database**: PostgreSQL 15 (containerized)

## Quick Start

### Full Application Startup
```bash
chmod +x start.sh
./start.sh
```
This script handles: database startup, backend dependencies, Prisma migrations, database seeding, and starts both servers.

### Manual Startup (Individual Components)

**1. Database Only:**
```bash
docker-compose up -d postgres
```

**2. Backend Setup & Start:**
```bash
cd backend
npm install
npm rebuild bcrypt          # Required for WSL compatibility
npx prisma migrate dev      # Apply migrations
npx prisma generate         # Generate Prisma client
npx prisma db seed          # Seed test data
npm run start:dev           # Start in watch mode
```

**3. Frontend:**
```bash
npm install                 # In root directory
npm run dev
```

### Environment Setup

Backend requires `.env` file (copy from `backend/.env.example`). Key variables:
- `DATABASE_URL`: Connection string for PostgreSQL
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `EMAIL_VERIFICATION_SECRET`: Must be unique random strings (32+ chars)
- `SMTP_*` variables: Optional, only needed for email verification functionality

## Development Commands

### Backend (from `backend/` directory)

**Running & Building:**
- `npm run start:dev` - Development with hot reload
- `npm run start:debug` - Development with debugging
- `npm run build` - Production build
- `npm run start:prod` - Run production build

**Testing:**
- `npm test` - Run all unit tests (Jest)
- `npm run test:watch` - Watch mode
- `npm run test:cov` - With coverage
- `npm run test:e2e` - End-to-end tests

**Database (Prisma):**
- `npm run prisma:generate` - Regenerate Prisma client after schema changes
- `npm run prisma:migrate` - Create and apply new migration
- `npx prisma migrate dev --name <name>` - Create named migration
- `npm run prisma:studio` - Open Prisma Studio GUI (database viewer)
- `npm run prisma:seed` - Reseed database with test data

**Code Quality:**
- `npm run lint` - ESLint check and fix
- `npm run format` - Prettier formatting

### Frontend (from root directory)

- `npm run dev` - Development server (port 5173)
- `npm run build` - Production build (outputs to `dist/`)
- `npm run preview` - Preview production build

### E2E Tests

E2E tests use Playwright and are located in `e2e/` directory. Tests assume both frontend (localhost:5173) and backend (localhost:3001) are running.

## Architecture

### Backend Structure

**Core Modules:**
- `auth/` - Authentication, JWT tokens, email verification
- `users/` - User management (CRUD operations)
- `events/` - Event management with filtering by category/status
- `registrations/` - Event registrations and check-ins
- `clubs/` - Club management and memberships
- `prisma/` - Database service (singleton pattern)
- `config/` - Configuration loader

**Global Infrastructure (configured in `app.module.ts`):**
- **Guards**: JWT authentication (all routes protected by default), role-based authorization, rate limiting (ThrottlerGuard)
- **Pipes**: Global validation pipe for DTOs
- **Filters**: HTTP exception filter for error formatting
- **Decorators**:
  - `@Public()` - Exempt route from JWT guard (e.g., login, register)
  - `@Roles('ADMIN', 'ORGANIZER')` - Restrict to specific roles
  - `@CurrentUser()` - Extract user from JWT in controllers

**Authentication Flow:**
1. Registration creates user with `emailVerified: false` and generates verification code
2. Verification code sent via SMTP (if configured; development can bypass)
3. Email verification endpoint validates code and sets `emailVerified: true`
4. Login returns access token (1h) and refresh token (7d)
5. All protected routes require valid JWT in `Authorization: Bearer <token>` header

**Database Schema (Prisma):**
- `User` - Has role (STUDENT/ORGANIZER/ADMIN), email verification fields, relations to events/registrations/clubs
- `Event` - Created by user (creatorId), has category, status (UPCOMING/ONGOING/COMPLETED/CANCELLED), capacity
- `Registration` - Junction table between User and Event with status (REGISTERED/WAITLIST/CANCELLED), check-in tracking
- `Club` - Has organizer (User), category, members via ClubMembership
- `ClubMembership` - Junction table with role (MEMBER/ADMIN)

### Frontend Structure

**Entry Point:** `frontend/index.html` → `frontend/js/main.jsx` → `frontend/js/App.jsx`

**Key Directories:**
- `frontend/js/components/` - Reusable UI components including:
  - `Layout.jsx`, `OrganizerLayout.jsx`, `AdminLayout.jsx` - Page wrappers with navigation
  - `ProtectedRoute.jsx` - Route wrapper for role-based access control
  - `ui/` - shadcn/ui-style components (button, card, input, etc.)
- `frontend/js/pages/` - Route components (HomePage, EventsPage, AdminDashboardPage, etc.)
- `frontend/js/services/` - API client and service layers:
  - `apiClient.js` - Axios instance with auth interceptors and auto-retry logic
  - `authService.js`, `eventsService.js`, `registrationsService.js`, etc. - Domain services
- `frontend/js/context/` - React Context providers:
  - `AuthContext.jsx` - Global auth state, user info, login/logout methods
- `frontend/css/` - Tailwind CSS styles

**Routing (React Router v7):**
- Public routes: `/`, `/events`, `/clubs`
- Student routes: `/registrations`, `/profile` (requires STUDENT role)
- Organizer routes: `/organizer/*` (requires ORGANIZER role)
- Admin routes: `/admin/*` (requires ADMIN role)
- All protected routes wrapped with `<ProtectedRoute roles={[...]}>`

**State Management:**
- Auth state: React Context (`AuthContext`)
- Component state: React hooks (useState, useEffect)
- No Redux/MobX - intentionally simple

**API Communication:**
- All requests go through `apiClient.js` (configured axios instance)
- Token automatically added to headers via request interceptor
- 401 responses trigger logout and redirect to login
- Network errors show retry logic with exponential backoff
- Toast notifications via `sonner` library

### Path Aliases (Vite)

```javascript
'@' → 'frontend/js'
'@components' → 'frontend/js/components'
'@services' → 'frontend/js/services'
'@context' → 'frontend/js/context'
'@pages' → 'frontend/js/pages'
'@css' → 'frontend/css'
```

## Access URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Swagger API Docs: http://localhost:3001/api/docs
- PgAdmin: http://localhost:5050 (credentials: admin@mnuevents.kz / admin)
- Prisma Studio: `npm run prisma:studio` (from backend/)

## Test Accounts (after seeding)

- Admin: admin@kazguu.kz / Password123!
- Organizer: organizer@kazguu.kz / Password123!
- Student: student1@kazguu.kz / Password123!

## Important Implementation Notes

### Backend

1. **Prisma Client Generation**: Always run `npx prisma generate` after schema changes
2. **bcrypt Compatibility**: Run `npm rebuild bcrypt` in WSL environments after install
3. **Guard Order**: JWT guard runs before Roles guard (defined in app.module.ts)
4. **Public Routes**: Use `@Public()` decorator to bypass JWT authentication
5. **Database Cascades**: User/Event deletions cascade to related records
6. **Swagger Tags**: Use appropriate tags for API organization (Authentication, Users, Events, etc.)

### Frontend

1. **Auth Flow**: AuthContext initializes on mount, checks token validity with backend
2. **Protected Routes**: Always wrap role-restricted routes with `<ProtectedRoute roles={[...]}>`
3. **API Base URL**: Configurable via `VITE_API_URL` env var (defaults to http://localhost:3001/api)
4. **Layout Selection**: Regular users use `Layout`, organizers use `OrganizerLayout`, admins use `AdminLayout`
5. **Error Handling**: apiClient handles 401 (logout), 5xx (retry), others (toast notification)

### Testing

1. **E2E Tests**: Require both servers running before execution
2. **Backend Unit Tests**: Located alongside source files (`*.spec.ts`)
3. **Frontend Tests**: Minimal coverage currently (only authService.test.js exists)

## Common Workflows

### Adding a New Backend Feature

1. Generate Prisma model in `backend/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name <feature-name>`
3. Generate client: `npx prisma generate`
4. Create NestJS module: `nest generate module <feature>`
5. Create service: `nest generate service <feature>`
6. Create controller: `nest generate controller <feature>`
7. Create DTOs in `<feature>/dto/`
8. Add Swagger decorators to controller
9. Import module in `app.module.ts`

### Adding a New Frontend Page

1. Create page component in `frontend/js/pages/<PageName>.jsx`
2. Create corresponding service in `frontend/js/services/` if needed
3. Add route in `frontend/js/App.jsx`
4. Wrap with appropriate layout and `<ProtectedRoute>` if needed
5. Update navigation in relevant Layout component

### Modifying Database Schema

1. Edit `backend/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <change-description>`
3. Regenerate client: `npx prisma generate`
4. Update seed file if needed: `backend/prisma/seed.ts`
5. Restart backend server to pick up changes

## Debugging Tips

- **Backend not starting**: Check if port 3001 is in use, verify DATABASE_URL in `.env`
- **Frontend API errors**: Verify backend is running, check browser console for CORS issues
- **Database connection failed**: Ensure Docker container is running: `docker-compose ps`
- **Prisma errors**: Try regenerating client: `npx prisma generate`
- **bcrypt errors on WSL**: Run `npm rebuild bcrypt` in backend directory
- **Email verification not working**: SMTP configuration is optional in development; check backend logs for email transporter status
