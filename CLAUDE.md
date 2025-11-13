# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MNU Events Platform is a university events management system with:
- **Backend**: NestJS 10 + Prisma ORM + PostgreSQL
- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router v7
- **Authentication**: JWT-based auth with role-based access control (STUDENT, ORGANIZER, ADMIN)
- **Database**: PostgreSQL 15 (containerized)
- **Design**: Liquid glass (glassmorphism) UI with dark/light theme support
- **Internationalization**: English, Russian, Kazakh

### Current Project Status ⚠️

**Development Stage:** Feature-complete for MVP, NOT production-ready
**Overall Quality Grade:** C+ (70/100)
**Production Ready:** ❌ NO (requires 8-10 weeks of hardening)

**What Works Well:**
- ✅ Core functionality implemented (events, clubs, registrations, auth)
- ✅ Clean architecture with proper separation of concerns
- ✅ Comprehensive database indexes for performance
- ✅ Modern tech stack (NestJS, React 19, Prisma)
- ✅ Beautiful liquid glass UI with theme support
- ✅ Role-based access control implemented

**Critical Issues Requiring Attention:**
- 🔴 **8 Critical Security Vulnerabilities** (localStorage tokens, hardcoded secrets, no CSRF, etc.)
- 🔴 **No Production Infrastructure** (logging, monitoring, health checks, error tracking)
- 🔴 **Minimal Test Coverage** (<10% backend, <5% frontend)
- ⚠️ **Performance Issues** (DB lookup on every request, no caching, no code splitting)
- ⚠️ **Missing Production Features** (CI/CD, secrets management, database backups)

**👉 See sections below for:**
- "Security & Critical Issues" - Detailed security audit
- "Production Readiness Assessment" - Infrastructure gaps
- "Deployment Timeline & Roadmap" - Path to production (10 weeks)
- "Recommended Immediate Actions" - Prioritized next steps

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
- `common/` - Shared utilities and constants (⭐ NEW)
  - `common/utils/` - Pagination, authorization, and helper functions
  - `common/constants/` - Application-wide constants (pagination, time, etc.)

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
  - `LanguageSelector.jsx` - Reusable language selector component (⭐ NEW)
  - `ui/` - shadcn/ui-style components (button, card, input, etc.)
- `frontend/js/pages/` - Route components (HomePage, EventsPage, AdminDashboardPage, etc.)
- `frontend/js/services/` - API client and service layers:
  - `apiClient.js` - Axios instance with auth interceptors and auto-retry logic
  - `authService.js`, `eventsService.js`, `registrationsService.js`, etc. - Domain services
- `frontend/js/context/` - React Context providers:
  - `AuthContext.jsx` - Global auth state, user info, login/logout methods
- `frontend/js/utils/` - Shared utilities and constants (⭐ NEW)
  - `constants.js` - Application-wide constants (roles, categories, colors, etc.)
  - `categoryMappers.js` - Category and status display name mappers
  - `dateFormatters.js` - Date formatting utilities
  - `errorHandlers.js` - Error handling and extraction utilities
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
'@utils' → 'frontend/js/utils'  // ⭐ NEW
'@css' → 'frontend/css'
```

**Importing utilities:**
```javascript
import { ROLES, formatDate, extractErrorMessage } from '@/utils';
import { getCategoryColor, getStatusDisplayName } from '@/utils';
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
7. **⭐ Use Shared Utilities**: Import from `common/utils` to avoid code duplication
8. **⭐ Pagination**: Use `validatePagination()` and `createPaginatedResponse()` from `common/utils`
9. **⭐ Authorization**: Use `requireCreatorOrAdmin()`, `requireAdmin()` from `common/utils`
10. **⭐ TypeScript**: Project uses strict mode - ensure all types are explicit
11. **⭐ Performance**: Avoid N+1 queries - use Prisma's `include` or `relationLoadStrategy: "join"`
12. **⭐ Security**: Verification codes use `crypto.randomBytes()` (cryptographically secure)

### Frontend

1. **Auth Flow**: AuthContext initializes on mount, checks token validity with backend
2. **Protected Routes**: Always wrap role-restricted routes with `<ProtectedRoute roles={[...]}>`
3. **API Base URL**: Configurable via `VITE_API_URL` env var (defaults to http://localhost:3001/api)
4. **Layout Selection**: Regular users use `Layout`, organizers use `OrganizerLayout`, admins use `AdminLayout`
5. **Error Handling**: apiClient handles 401 (logout), 5xx (retry), others (toast notification)
6. **⭐ Use Shared Utilities**: Import from `@/utils` for constants, formatters, error handlers
7. **⭐ Date Formatting**: Use `formatDate()`, `formatDateShort()`, `formatTime()` from `@/utils`
8. **⭐ Category Display**: Use `getCategoryDisplayName()`, `getCategoryColor()` from `@/utils`
9. **⭐ Error Messages**: Use `extractErrorMessage()` from `@/utils` for consistent error handling
10. **⭐ Constants**: Use `ROLES`, `EVENT_CATEGORIES`, `ASSETS` from `@/utils` instead of hardcoded strings
11. **⚠️ Error Boundaries**: Currently MISSING - should be added for production
12. **⚠️ Performance**: Consider using `React.memo()` and `useMemo()` for heavy components

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

## Best Practices & Code Examples

### Backend Best Practices

#### ⭐ Using Pagination Utilities

```typescript
import { validatePagination, createPaginatedResponse } from '../common/utils';

async findAll(page?: number, limit?: number) {
  // Automatically validates and normalizes pagination (max 100 limit)
  const { skip, take, page: validatedPage } = validatePagination({ page, limit });

  const [items, total] = await Promise.all([
    this.prisma.event.findMany({ skip, take }),
    this.prisma.event.count()
  ]);

  // Returns standardized paginated response
  return createPaginatedResponse(items, total, validatedPage, take);
}
```

#### ⭐ Using Authorization Utilities

```typescript
import { requireCreatorOrAdmin, requireAdmin } from '../common/utils';

async update(id: string, dto: UpdateDto, userId: string, userRole: Role) {
  const item = await this.prisma.event.findUnique({ where: { id } });

  // Throws ForbiddenException if user is not creator or admin
  requireCreatorOrAdmin(userId, item.creatorId, userRole, 'event');

  return this.prisma.event.update({ where: { id }, data: dto });
}
```

#### ⭐ NestJS Guards: Public Routes with Reflector (Official Pattern)

Based on official NestJS documentation, use `Reflector` to check for public routes:

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector, // Inject Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow public routes
    }

    // Standard JWT validation for protected routes
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// Usage in controllers
@Controller('auth')
export class AuthController {
  @Public() // This route bypasses JWT guard
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile') // Protected by default
  getProfile(@Request() req) {
    return req.user;
  }
}
```

#### ⭐ Avoiding N+1 Queries (Prisma Best Practice)

```typescript
// ❌ BAD: N+1 query problem
const users = await prisma.user.findMany();
users.forEach(async (user) => {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
});

// ✅ GOOD: Use include (Prisma optimizes this with JOIN)
const users = await prisma.user.findMany({
  include: { posts: true }
});

// ✅ BETTER: Explicit JOIN with relationLoadStrategy
const users = await prisma.user.findMany({
  relationLoadStrategy: "join", // Forces database JOIN
  include: { posts: true }
});

// ⚡ BEST: For large datasets, use separate query with 'in' filter
const users = await prisma.user.findMany();
const userIds = users.map(u => u.id);
const posts = await prisma.post.findMany({
  where: { authorId: { in: userIds } },
  relationLoadStrategy: "join", // Single query for all posts
});
```

**Official Prisma Performance Guidelines:**
- Always use `relationLoadStrategy: "join"` for nested relations when possible
- Avoid creating multiple `PrismaClient` instances (use singleton pattern)
- Use `typeof client` instead of `PrismaClient` type for better TypeScript performance

#### ⭐ Single PrismaClient Instance (Critical Performance)

```typescript
// ❌ BAD: Multiple instances (causes connection pool exhaustion)
async function getUsers() {
  const prisma = new PrismaClient(); // NEW INSTANCE ON EVERY CALL!
  await prisma.user.findMany();
}

async function getPosts() {
  const prisma = new PrismaClient(); // ANOTHER INSTANCE!
  await prisma.post.findMany();
}

// ✅ GOOD: Singleton pattern (already implemented in prisma.service.ts)
// backend/src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// Usage across entire app
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} // Single instance injected

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

#### ⭐ TypeScript Performance with Prisma (Official Optimization)

```typescript
// ❌ BAD: Direct type reference (slow compilation with large schemas)
import { PrismaClient } from '@prisma/client';

const saveFn = async (prismaClient: PrismaClient) => {
  // High type instantiations, slow compilation
};

const client = new PrismaClient();
await saveFn(client);

// ✅ GOOD: Use 'typeof' operator (massive performance improvement)
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const saveFn = async (prismaClient: typeof client) => {
  // Fast type resolution, minimal memory usage
};

await saveFn(client);
```
**Impact:** 10x faster TypeScript compilation for large schemas

#### ⭐ Prisma Query Optimization Patterns

```typescript
// 1. Use indexes for frequently filtered fields
model Event {
  title       String
  category    String
  status      String

  @@index([category, status]) // Composite index for common filters
  @@index([title]) // For search queries
}

// 2. Avoid overfetching - use 'select' for large objects
// ❌ BAD: Fetches all fields
const events = await prisma.event.findMany({
  include: { registrations: true }
});

// ✅ GOOD: Select only needed fields
const events = await prisma.event.findMany({
  select: {
    id: true,
    title: true,
    registrations: {
      select: { id: true, userId: true }
    }
  }
});

// 3. Use middleware conditionally to avoid overhead
prisma.$use(async (params, next) => {
  // Only run for specific models/actions
  if (params.model === 'Post' && params.action === 'delete') {
    // Soft delete logic
  }
  return next(params);
});
```

### Frontend Best Practices

#### ⭐ Using Shared Constants

```javascript
// ❌ BAD: Hardcoded strings
if (user.role === 'ADMIN') { ... }
const categoryColor = event.category === 'TECH' ? 'bg-gray-100' : 'bg-blue-100';

// ✅ GOOD: Use constants
import { ROLES } from '@/utils';
if (user.role === ROLES.ADMIN) { ... }

import { getCategoryColor } from '@/utils';
const categoryColor = getCategoryColor(event.category);
```

#### ⭐ Using Date Formatters

```javascript
// ❌ BAD: Duplicate formatting logic
const formatted = new Date(event.startDate).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

// ✅ GOOD: Use utility
import { formatDate, formatDateRange } from '@/utils';
const formatted = formatDate(event.startDate);
const range = formatDateRange(event.startDate, event.endDate);
```

#### ⭐ Using Error Handlers

```javascript
// ❌ BAD: Inconsistent error extraction
const message = error.response?.data?.message || error.message || 'Error';

// ✅ GOOD: Use utility
import { extractErrorMessage } from '@/utils';
const message = extractErrorMessage(error, 'Failed to load events');
```

#### ⚠️ Error Boundaries (TODO - Not Yet Implemented)

```javascript
// TODO: Add Error Boundary
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Routes>
        {/* routes */}
      </Routes>
    </ErrorBoundary>
  );
}
```

#### ⭐ Performance Optimization with React.memo

```javascript
// ⚠️ Heavy component re-renders unnecessarily
export default function EventCard({ event, onClick }) {
  return <div onClick={() => onClick(event.id)}>{event.title}</div>;
}

// ✅ Wrap with memo to prevent re-renders
import { memo } from 'react';
export default memo(function EventCard({ event, onClick }) {
  return <div onClick={() => onClick(event.id)}>{event.title}</div>;
});
```

## Database Indexes

The schema includes performance-optimized indexes:

```prisma
// User model
@@index([email])
@@index([verificationCode])  // ⭐ NEW: For verification lookups

// Event model
@@index([creatorId])
@@index([category])
@@index([status])
@@index([startDate])
@@index([endDate])  // ⭐ NEW: For past event filtering
@@index([category, status])  // ⭐ NEW: Composite for common filters

// Registration model
@@index([userId])
@@index([eventId])
@@index([status])  // ⭐ NEW: For statistics
@@index([checkedIn])  // ⭐ NEW: For check-in stats
@@index([eventId, status])  // ⭐ NEW: Composite

// ClubMembership model
@@index([role])  // ⭐ NEW: For role filtering
```

**After adding new indexes:**
```bash
cd backend
npx prisma migrate dev --name add-performance-indexes
npx prisma generate
```

## Security Notes ⚠️

**⚠️ WARNING: This section describes current implementation. See "Security & Critical Issues" section below for detailed security audit and required fixes.**

### Backend Security

1. **Cryptographically Secure Random**: Verification codes use `crypto.randomBytes()` instead of `Math.random()` ✅
2. **SSL Validation**: Certificate validation only disabled in development (`process.env.NODE_ENV !== 'development'`) ⚠️
3. **TypeScript Strict Mode**: Enabled to catch type errors at compile-time ✅
4. **Password Hashing**: bcrypt with 10 rounds ⚠️ **(Should be 12+ for production - see Security Issues)**
5. **Rate Limiting**: Global throttling configured in `app.module.ts` (100 req/60s) ⚠️ **(No per-user limits)**
6. **Input Validation**: All DTOs validated with `class-validator` ✅
7. **JWT Authentication**: All routes protected by default via global guard ✅
8. **Role-Based Access Control**: Implemented with `@Roles()` decorator ✅

**🔴 Critical Security Gaps:**
- JWT tokens stored in localStorage (XSS vulnerable)
- No JWT token blacklist (logout doesn't invalidate tokens)
- Hardcoded secrets in `.env.example`
- Database lookup on every authenticated request
- No CSRF protection
- No input sanitization for XSS

**👉 See "Security & Critical Issues" section for complete security audit**

### Frontend Security

1. **Token Storage**: ⚠️ **Currently in localStorage (CRITICAL VULNERABILITY - move to httpOnly cookies)**
2. **XSS Prevention**: ⚠️ **User input NOT sanitized (add DOMPurify)**
3. **CSRF Protection**: ❌ **Not implemented (required for production)**
4. **Content Security Policy**: ❌ **Not configured**
5. **API Base URL**: Configurable via environment variable ✅

**🔴 Critical Frontend Gaps:**
- No error boundaries (app crashes on component errors)
- No request cancellation (memory leaks possible)
- No input sanitization
- localStorage tokens vulnerable to XSS

**👉 See "Security & Critical Issues" section for complete assessment and fixes**

## Security & Critical Issues 🚨

**Current Security Grade: C (Multiple Critical Issues)**

### 🔴 CRITICAL Security Issues (Must Fix Before Production)

#### 1. Hardcoded JWT Secrets in Example File
- **File:** `backend/.env.example`
- **Lines:** 18, 22, 26
- **Issue:** Example file contains actual Base64-encoded secrets instead of placeholders
- **Risk:** If users copy `.env.example` to `.env` without changing secrets, all JWT tokens can be compromised
- **Fix:** Replace with placeholders like `"CHANGE_THIS_TO_RANDOM_STRING_32_CHARS"`

#### 2. JWT Tokens Stored in localStorage (XSS Vulnerability)
- **Files:**
  - `frontend/js/services/apiClient.js` (line 26)
  - `frontend/js/services/authService.js`
- **Issue:** Tokens accessible via JavaScript, vulnerable to XSS attacks
- **Risk:** Token theft via XSS attack, complete account takeover
- **Fix:**
  - Move to httpOnly cookies (inaccessible to JavaScript)
  - Implement CSRF token protection
  - Or use session-based authentication

#### 3. No JWT Token Blacklist
- **File:** `backend/src/auth/auth.service.ts` (lines 403-407)
- **Issue:** Logout doesn't invalidate tokens - they remain valid until expiration
- **Risk:** Stolen tokens can be used even after user logs out
- **Fix:** Implement Redis-based token blacklist

#### 4. Database Lookup on Every Authenticated Request
- **File:** `backend/src/auth/strategies/jwt.strategy.ts` (lines 27-46)
- **Issue:** JWT strategy queries database on EVERY request to check user existence and email verification
- **Risk:** Performance bottleneck, potential DoS vector, unnecessary database load
- **Fix:**
  - Cache verification status in JWT payload
  - Only verify critical operations server-side
  - Use Redis for caching user status

#### 5. No CSRF Protection
- **Risk:** Cross-Site Request Forgery attacks possible
- **Impact:** Attackers can perform actions on behalf of authenticated users
- **Fix:** Implement CSRF token validation (especially important if using cookies)

#### 6. No Error Boundaries in React App
- **File:** `frontend/js/App.jsx`
- **Issue:** Any component error crashes entire application
- **Risk:** Poor user experience, potential information disclosure
- **Fix:** Add React Error Boundaries around route components

#### 7. Weak Password Hashing
- **File:** `backend/src/auth/auth.service.ts` (line 120)
- **Issue:** `bcrypt.hash(password, 10)` - modern recommendation is 12+ rounds
- **Risk:** Faster brute-force attacks on compromised database
- **Fix:** Increase to 12 rounds: `bcrypt.hash(password, 12)`

#### 8. No Input Sanitization for XSS
- **Files:** All DTO files, frontend form handling
- **Issue:** No explicit HTML sanitization in event/club descriptions
- **Risk:** Stored XSS attacks via user-generated content
- **Fix:** Add DOMPurify library for sanitization

### ⚠️ MEDIUM Security Issues

#### 9. SSL Certificate Validation Disabled in Development
- **File:** `backend/src/auth/auth.service.ts` (line 69)
- **Issue:** `rejectUnauthorized: process.env.NODE_ENV !== 'development'`
- **Risk:** Could be deployed to production without changing NODE_ENV
- **Fix:** Use separate email configuration for development/production

#### 10. No Rate Limiting on Email Verification Resend
- **File:** `backend/src/auth/auth.service.ts` (lines 303-319)
- **Issue:** 5-minute cooldown is good, but no global rate limit per IP
- **Risk:** Email flooding attack possible
- **Fix:** Add IP-based rate limiting with ThrottlerGuard

#### 11. Verification Codes Stored in Plain Text
- **File:** Prisma schema - User model
- **Issue:** Verification codes stored as plain strings in database
- **Risk:** Database compromise exposes verification codes
- **Fix:** Hash verification codes before storage (though they expire in 24h)

#### 12. CORS Configuration Allows Any Origin in Development
- **File:** `backend/src/main.ts` (lines 16-19)
- **Issue:** `credentials: true` but origin is configurable - could allow any origin
- **Risk:** CSRF attacks if misconfigured
- **Fix:** Validate CORS_ORIGIN is not "*" in production environment

### OWASP Top 10 Assessment

| Vulnerability | Status | Notes |
|--------------|--------|-------|
| **A01: Broken Access Control** | ⚠️ MEDIUM | Role guards implemented, but no fine-grained permissions |
| **A02: Cryptographic Failures** | 🔴 CRITICAL | localStorage tokens, weak bcrypt rounds (10 vs 12+) |
| **A03: Injection** | ✅ GOOD | Prisma ORM prevents SQL injection effectively |
| **A04: Insecure Design** | ⚠️ MEDIUM | No security logging, missing audit trail |
| **A05: Security Misconfiguration** | 🔴 CRITICAL | Hardcoded secrets, no CSP headers, SSL disabled in dev |
| **A06: Vulnerable Components** | ✅ GOOD | Dependencies are up to date |
| **A07: Authentication Failures** | ⚠️ MEDIUM | Strong password policy, but no MFA support |
| **A08: Data Integrity Failures** | ⚠️ MEDIUM | No request signing, no CSRF protection |
| **A09: Logging Failures** | 🔴 CRITICAL | Insufficient logging and monitoring |
| **A10: SSRF** | ✅ GOOD | No external requests from user input |

---

## Production Readiness Assessment 🚨

**Current Status: NOT PRODUCTION READY**
**Overall Grade: C+ (70/100)**

- Architecture: B+ (Good separation of concerns)
- Security: C (Critical issues present)
- Performance: B (Good indexes, some optimization needed)
- Production Infrastructure: D (Missing critical features)
- Code Quality: B+ (Good structure, proper TypeScript)
- Testing Coverage: D (<10% backend, <5% frontend)

### Missing Critical Production Features

#### 🔴 CRITICAL (Blocks Production Deployment)

1. **No Health Check Endpoints**
   - **Impact:** Cannot monitor service health in production
   - **Fix:** Add `/health` and `/ready` endpoints
   - **Implementation:**
     ```typescript
     // backend/src/health/health.controller.ts
     @Controller('health')
     export class HealthController {
       @Get()
       check() {
         return { status: 'ok', timestamp: new Date().toISOString() };
       }

       @Get('ready')
       ready() {
         // Check database, Redis connections
         return { ready: true };
       }
     }
     ```

2. **No Logging Service**
   - **Current:** Only `console.log()` statements
   - **Impact:** Cannot debug production issues, no audit trail
   - **Fix:** Implement Winston or Pino with log aggregation
   - **Recommendation:** Send logs to ELK stack, Datadog, or CloudWatch

3. **No Error Tracking**
   - **Impact:** Unaware of production errors, poor debugging
   - **Fix:** Integrate Sentry or Rollbar
   - **Estimated Setup Time:** 2-4 hours

4. **No Monitoring/Metrics**
   - **Impact:** Cannot detect performance degradation or outages
   - **Fix:** Add Prometheus metrics or integrate APM (New Relic, Datadog)
   - **Minimum Metrics:** Request rate, error rate, response time, database query time

5. **No Environment Variable Validation**
   - **File:** `backend/src/config/configuration.ts`
   - **Issue:** Server starts without checking required env vars
   - **Risk:** Runtime failures instead of startup failures
   - **Fix:** Add Joi validation schema:
     ```typescript
     import * as Joi from 'joi';

     const configSchema = Joi.object({
       DATABASE_URL: Joi.string().required(),
       JWT_SECRET: Joi.string().min(32).required(),
       // ... other required vars
     });
     ```

6. **No Request Correlation IDs**
   - **Impact:** Cannot trace requests across microservices/logs
   - **Fix:** Add correlation ID middleware
   - **Usage:** Include in all log statements and error responses

#### ⚠️ HIGH Priority (Should Fix Before Production)

7. **No Rate Limiting Per User**
   - **Current:** Only global rate limiting (100 req/60s)
   - **Fix:** Add per-user rate limits in addition to global
   - **Recommendation:** 1000 req/hour per user, 10,000 req/day

8. **No Database Backup Strategy**
   - **Current:** No documented backup/restore procedures
   - **Fix:**
     - Implement automated PostgreSQL backups
     - Test restore procedures monthly
     - Document backup retention policy

9. **No CI/CD Pipeline**
   - **Current:** Manual deployments
   - **Fix:** Add GitHub Actions or GitLab CI
   - **Minimum Pipeline:**
     - Lint → Test → Build → Deploy to staging → Manual approval → Deploy to production

10. **Missing Secrets Management**
    - **Current:** All secrets in `.env` files
    - **Fix:** Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
    - **Priority:** HIGH for production

### Docker Production Issues

#### docker-compose.prod.yml Missing:

1. **Health Checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

2. **Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
       reservations:
         cpus: '0.5'
         memory: 512M
   ```

3. **Restart Policies**
   - Add `restart: always` for production services

4. **Network Isolation**
   - Separate frontend, backend, and database networks

### Environment Management Issues

1. **No Staging Environment Configuration**
   - Only dev and prod configs exist
   - **Fix:** Add `docker-compose.staging.yml`

2. **Secrets Committed to Repository**
   - `.env.example` contains real secrets (even as examples)
   - **Fix:** Remove all real secrets immediately

3. **No Environment Variable Documentation**
   - **Fix:** Document all required and optional env vars in README

---

## Testing Coverage Assessment 🧪

**Current Coverage: CRITICAL GAP**

### Backend Testing

**Current State:**
- Jest framework configured ✅
- Only 2 spec files exist:
  - `backend/src/auth/auth.controller.spec.ts`
  - `backend/src/auth/auth.service.spec.ts`
- **Estimated Coverage:** <10%

**Missing Tests:**
- ❌ Unit tests for services (users, events, registrations, clubs)
- ❌ Integration tests for controllers
- ❌ E2E tests for critical user flows
- ❌ Database transaction tests
- ❌ Error handling tests
- ❌ Guards and decorators tests

**Target:** 80% coverage before production

**Priority Test Areas:**
1. Authentication flow (login, register, verify, refresh)
2. Authorization (role checks, ownership validation)
3. Event registration (capacity limits, waitlist logic)
4. Database constraints (unique violations, cascades)

### Frontend Testing

**Current State:**
- Vitest not configured
- Only 1 test file: `frontend/js/services/authService.test.js`
- **Estimated Coverage:** <5%

**Missing Tests:**
- ❌ Component tests (React Testing Library)
- ❌ Hook tests (useAuth, useTheme)
- ❌ Service/API client tests
- ❌ Utility function tests
- ❌ Integration tests

**Recommendation:**
- Add Vitest + React Testing Library
- Focus on critical user flows first
- Add visual regression testing (Percy/Chromatic)

### E2E Testing

**Current State:**
- Playwright configured ✅
- 4 test files exist:
  - `e2e/admin-login-logout.spec.js`
  - `e2e/club-details-page.spec.js`
  - `e2e/logout-endpoint.spec.js`
  - `e2e/profile-page.spec.js`

**Coverage:** Basic scenarios only

**Missing E2E Tests:**
- ❌ Event creation and registration flow
- ❌ Role-based access control verification
- ❌ Email verification flow
- ❌ Form validation and error handling
- ❌ Search and filter functionality
- ❌ Multi-language switching

**Target:** 30+ E2E tests covering critical user journeys

### Testing Timeline Recommendation

**Week 1-2: Backend Unit Tests**
- Auth module: 90% coverage
- Events service: 80% coverage
- Users service: 80% coverage
- Registrations service: 85% coverage

**Week 3-4: Frontend Component Tests**
- Critical pages: 70% coverage
- Shared components: 80% coverage
- Services: 90% coverage

**Week 5-6: E2E Tests**
- Happy path flows: 100% coverage
- Error scenarios: 80% coverage
- Edge cases: 60% coverage

---

## Performance Optimization Opportunities 🚀

### Backend Optimization

#### 1. Remove Database Lookup from JWT Validation ⚡ HIGH IMPACT
**Current Issue:**
- **File:** `backend/src/auth/strategies/jwt.strategy.ts` (lines 27-46)
- Every authenticated request queries database
- Adds 10-50ms latency per request

**Fix:**
```typescript
// Cache user verification status in JWT payload
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified, // Add this
};

// In JWT strategy, check payload instead of database
async validate(payload: any) {
  if (!payload.emailVerified) {
    throw new UnauthorizedException('Email not verified');
  }
  return payload; // No database call needed
}
```
**Impact:** 40-60% faster response times for authenticated requests

#### 2. Implement Redis Caching
**Target Data:**
- Event listings (cache for 5 minutes)
- Club listings (cache for 10 minutes)
- User profiles (cache for 15 minutes)

**Implementation:**
```typescript
@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(filters) {
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const events = await this.prisma.event.findMany(...);
    await this.cacheManager.set(cacheKey, events, { ttl: 300 });

    return events;
  }
}
```
**Impact:** 70-90% reduction in database load for read operations

#### 3. Database Connection Pooling Configuration
**Current:** Using Prisma defaults
**Optimization:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10&pool_timeout=20"
```
**Recommended Settings:**
- Development: 5-10 connections
- Production: 20-50 connections (based on load testing)

#### 4. Add Response Compression
```typescript
// main.ts
import * as compression from 'compression';

app.use(compression());
```
**Impact:** 60-80% reduction in response payload size

#### 5. Optimize Prisma Queries
**Current Issues:**
- `users/users.service.ts` doesn't use pagination utilities
- Clubs service returns all clubs without pagination (line 242-275)

**Fix:**
- Apply `validatePagination()` to all list endpoints
- Add `relationLoadStrategy: "join"` for nested queries

### Frontend Optimization

#### 1. Implement Code Splitting ⚡ HIGH IMPACT
**Current:** Single bundle (~7,872 lines of JSX)
**Fix:** Route-based lazy loading

```javascript
import { lazy, Suspense } from 'react';

const EventsPage = lazy(() => import('./pages/EventsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboardPage'));

// In routes
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/events" element={<EventsPage />} />
</Suspense>
```
**Impact:** 60% reduction in initial bundle size

#### 2. Image Optimization
**Current:** Full-resolution images loaded
**Fix:**
- Use CDN with automatic resizing (Cloudinary, imgix)
- WebP format with PNG/JPG fallbacks
- Lazy loading with IntersectionObserver

**Impact:** 50-70% faster page load times

#### 3. Implement API Response Caching
**Recommendation:** React Query or SWR

```javascript
import { useQuery } from '@tanstack/react-query';

function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```
**Impact:** 70% reduction in API calls, instant navigation

#### 4. Add Request Cancellation
```javascript
// apiClient.js
const controller = new AbortController();

axios.get('/api/events', { signal: controller.signal });

// Cancel on component unmount
useEffect(() => {
  return () => controller.abort();
}, []);
```

### Database Optimization

#### Missing Indexes (Add These)
```prisma
model User {
  // ... existing fields
  @@index([role]) // For admin dashboard filtering
}

model Event {
  // ... existing fields
  @@index([title]) // For search optimization
}
```

#### Recommended: Full-Text Search
```prisma
// For PostgreSQL full-text search
model Event {
  title       String
  description String @db.Text
  searchVector Unsupported("tsvector")? @default(dbgenerated("to_tsvector('english', title || ' ' || description)"))

  @@index([searchVector], type: Gin)
}
```

---

## Known Issues & Technical Debt 📝

### Backend Technical Debt

1. **Console.log Instead of Logger**
   - Multiple files use `console.log()` for debugging
   - **Impact:** No structured logging in production
   - **Effort:** 4-8 hours to replace with Winston

2. **Magic Numbers**
   - Verification code length hardcoded (line 96 in auth.service.ts)
   - Expiration times not in constants
   - **Fix:** Move to `common/constants/`

3. **No JSDoc Comments**
   - Public API methods lack documentation
   - **Impact:** Difficult onboarding for new developers

4. **Seed Data Not Idempotent**
   - Running `npm run prisma:seed` twice causes errors
   - **Fix:** Use `upsert` instead of `create`

5. **Missing DTO Max Length Validators**
   - Event/Club titles and descriptions have no max length
   - **Risk:** Database overflow, storage abuse

### Frontend Technical Debt

1. **No TypeScript**
   - Entire frontend is JavaScript
   - **Impact:** Type safety issues, harder refactoring
   - **Effort:** 2-3 weeks to migrate

2. **No PropTypes**
   - Components don't validate props
   - **Impact:** Runtime errors, poor DX

3. **Inline Styles**
   - Some components (NotFoundPage) use inline styles
   - **Fix:** Move to Tailwind classes

4. **Race Condition in Auth Init**
   - **File:** `frontend/js/context/AuthContext.jsx` (lines 34-55)
   - Multiple components could call `getCurrentUser()` simultaneously
   - **Fix:** Add request deduplication

5. **No Request Cancellation**
   - Component unmount doesn't cancel pending API requests
   - **Impact:** Memory leaks, unnecessary processing

6. **No Optimistic UI Updates**
   - All mutations wait for server response
   - **Impact:** Slower perceived performance

### Database Technical Debt

1. **No Soft Deletes**
   - Events, clubs, users are hard deleted
   - **Impact:** No audit trail, cannot recover deleted data
   - **Fix:** Add `deletedAt DateTime?` field

2. **No Created/Updated By Tracking**
   - Only timestamps, not which user made changes
   - **Fix:** Add `createdBy String?` and `updatedBy String?`

3. **Verification Codes in Plain Text**
   - Stored as plain strings (though they expire in 24h)
   - **Best Practice:** Hash before storage

### Infrastructure Technical Debt

1. **No Graceful Shutdown**
   - Server doesn't handle SIGTERM properly
   - **Impact:** In-flight requests fail during deployment

2. **No Circuit Breaker Pattern**
   - No protection against cascading failures
   - **Recommendation:** Use Opossum or similar library

---

## Deployment Timeline & Roadmap 🗓️

### Phase 1: Critical Security Fixes (Week 1-2) 🔴

**Goal:** Fix security vulnerabilities that block production

- [ ] Remove hardcoded secrets from `.env.example`
- [ ] Move JWT tokens from localStorage to httpOnly cookies
- [ ] Implement CSRF protection
- [ ] Implement JWT token blacklist (Redis)
- [ ] Add React Error Boundaries
- [ ] Increase bcrypt rounds to 12
- [ ] Add input sanitization (DOMPurify)
- [ ] Add Content Security Policy headers

**Estimated Effort:** 60-80 hours (1.5-2 weeks, 1 developer)

### Phase 2: Production Infrastructure (Week 3-4) ⚠️

**Goal:** Add monitoring, logging, and observability

- [ ] Implement logging service (Winston/Pino)
- [ ] Add health check endpoints (`/health`, `/ready`)
- [ ] Integrate error tracking (Sentry)
- [ ] Add request correlation IDs
- [ ] Implement environment variable validation
- [ ] Configure database backups
- [ ] Add Prometheus metrics/APM
- [ ] Set up Docker health checks

**Estimated Effort:** 60-80 hours

### Phase 3: Testing & Quality (Week 5-6) 🧪

**Goal:** Achieve 80% test coverage

- [ ] Backend unit tests (auth, events, users, registrations)
- [ ] Frontend component tests (React Testing Library)
- [ ] E2E tests for critical flows (30+ scenarios)
- [ ] Load testing (identify bottlenecks)
- [ ] Security testing (OWASP ZAP, manual penetration testing)

**Estimated Effort:** 80-100 hours

### Phase 4: Performance Optimization (Week 7-8) 🚀

**Goal:** Optimize for production load

- [ ] Implement Redis caching
- [ ] Remove database lookup from JWT validation
- [ ] Add response compression
- [ ] Implement frontend code splitting
- [ ] Optimize images (CDN + WebP)
- [ ] Add API response caching (React Query)
- [ ] Database query optimization
- [ ] Add missing database indexes

**Estimated Effort:** 40-60 hours

### Phase 5: CI/CD & DevOps (Week 9) 🛠️

**Goal:** Automate deployment pipeline

- [ ] Set up GitHub Actions / GitLab CI
- [ ] Configure staging environment
- [ ] Implement blue-green deployment
- [ ] Add automated smoke tests
- [ ] Configure secrets management (AWS Secrets Manager / Vault)
- [ ] Set up monitoring dashboards
- [ ] Document runbooks for common issues

**Estimated Effort:** 40-60 hours

### Phase 6: Security Audit & Production Deployment (Week 10) 🎯

**Goal:** Final validation and go-live

- [ ] Third-party security audit
- [ ] Penetration testing
- [ ] Load testing in staging (simulate production traffic)
- [ ] Disaster recovery testing
- [ ] Final code review
- [ ] Production deployment
- [ ] Post-deployment monitoring (24/7 for first week)

**Estimated Effort:** 40-60 hours

### Total Estimated Timeline

- **Total Time:** 8-10 weeks (1 full-time developer)
- **Budget Estimate:** $20,000 - $30,000 (contractor rates)
- **Team Recommendation:** 2 developers to complete in 5-6 weeks

### Production Readiness Checklist

Before production deployment, ensure:

- [x] Architecture is sound
- [ ] All 🔴 CRITICAL security issues resolved
- [ ] 80%+ test coverage achieved
- [ ] Logging and monitoring in place
- [ ] CI/CD pipeline operational
- [ ] Secrets in secure vault (not .env files)
- [ ] Database backups tested
- [ ] Load testing completed (handle 1000+ concurrent users)
- [ ] Disaster recovery plan documented
- [ ] On-call rotation established
- [ ] Security audit passed

**Current Status:** 1/10 items complete (10% production-ready)

---

## Recommended Immediate Actions 🎯

### Critical Priority (Week 1-2)

1. **🔴 Remove Hardcoded Secrets**
   - File: `backend/.env.example` lines 18, 22, 26
   - Replace with placeholders immediately
   - **Risk Level:** CRITICAL

2. **🔴 Move Tokens to httpOnly Cookies**
   - Refactor `frontend/js/services/apiClient.js` and `authService.js`
   - Implement CSRF protection
   - **Estimated Time:** 16-24 hours

3. **🔴 Add Error Boundaries**
   - Wrap React app in `frontend/js/App.jsx`
   - **Estimated Time:** 2-4 hours

4. **🔴 Increase bcrypt Rounds**
   - Change `backend/src/auth/auth.service.ts` line 120 from 10 to 12
   - **Estimated Time:** 5 minutes

### High Priority (Week 3-4)

5. **⚠️ Implement Logging**
   - Add Winston or Pino
   - Configure log aggregation
   - **Estimated Time:** 8-16 hours

6. **⚠️ Add Health Checks**
   - Create `/health` and `/ready` endpoints
   - **Estimated Time:** 2-4 hours

7. **⚠️ JWT Token Blacklist**
   - Implement Redis-based blacklist
   - **Estimated Time:** 8-12 hours

### Medium Priority (Week 5-6)

8. **Add Testing** (Target: 80% coverage)
9. **Implement Redis Caching**
10. **Code Splitting for Frontend**

---

## Document Change Log 📝

**Version:** 2.0 (Major Update)
**Date:** 2025-11-13
**Changes:**

### New Sections Added:
- ✅ **Security & Critical Issues** - Comprehensive OWASP Top 10 assessment
- ✅ **Production Readiness Assessment** - Grade: C+ (70/100), NOT PRODUCTION READY
- ✅ **Testing Coverage Assessment** - Current: <10% backend, <5% frontend
- ✅ **Performance Optimization Opportunities** - Backend, Frontend, Database optimizations
- ✅ **Known Issues & Technical Debt** - Categorized by subsystem
- ✅ **Deployment Timeline & Roadmap** - 10-week production timeline
- ✅ **Recommended Immediate Actions** - Prioritized action items

### Updated Sections:
- ✅ **Best Practices** - Added official NestJS/Prisma patterns from Context7 docs
- ✅ **Security Notes** - Enhanced with critical vulnerability warnings
- ✅ **Backend Implementation Notes** - Added references to new security section

### Key Findings:
- 🔴 **8 Critical Security Issues** identified (must fix before production)
- ⚠️ **4 Medium Security Issues** identified
- ⚠️ **No logging, monitoring, or health checks** (production blockers)
- 🧪 **Test coverage critically low** (<10%)
- 📊 **Performance optimization opportunities** (40-90% improvements possible)

### Production Readiness Status:
- **Overall Grade:** C+ (70/100)
- **Security Grade:** C (Multiple critical issues)
- **Production Ready:** ❌ NO (8-10 weeks of work required)
- **Estimated Cost:** $20,000 - $30,000 (contractor rates)

### Next Steps:
1. Review "Recommended Immediate Actions" section
2. Address critical security issues (Week 1-2)
3. Implement production infrastructure (Week 3-4)
4. Add comprehensive testing (Week 5-6)
5. Performance optimization (Week 7-8)
6. CI/CD setup (Week 9)
7. Security audit and deployment (Week 10)

---

## Debugging Tips

- **Backend not starting**: Check if port 3001 is in use, verify DATABASE_URL in `.env`
- **Frontend API errors**: Verify backend is running, check browser console for CORS issues
- **Database connection failed**: Ensure Docker container is running: `docker-compose ps`
- **Prisma errors**: Try regenerating client: `npx prisma generate`
- **bcrypt errors on WSL**: Run `npm rebuild bcrypt` in backend directory
- **Email verification not working**: SMTP configuration is optional in development; check backend logs for email transporter status
- **TypeScript errors after updates**: Run `npm run build` in backend to check for type issues
- **🔴 Security Issues**: See "Security & Critical Issues" section above
- **🚨 Production Deployment**: See "Production Readiness Assessment" section - NOT READY
- **📊 Performance Problems**: See "Performance Optimization Opportunities" section
- **🧪 Testing Failures**: See "Testing Coverage Assessment" section
