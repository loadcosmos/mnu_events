# CLAUDE.md

Quick reference and guidance for Claude Code when working with MNU Events Platform.

## 🎯 Project Overview

**MNU Events Platform** - University events management system
**Status:** 95% Complete | Grade: B+ | Production Ready: ⚠️ (Conditional - requires security hardening)
**Last Updated:** 2025-11-21

**Tech Stack:**
- Backend: NestJS 10 + Prisma ORM + PostgreSQL
- Frontend: React 19 + Vite 7 + Tailwind CSS + React Router v7
- Auth: JWT with role-based access control (STUDENT, ORGANIZER, ADMIN, **MODERATOR**)
- Design: Liquid glass (glassmorphism) + dark theme
- **New:** Monetization, Gamification, Moderation systems

### 🆕 Recent Updates (2025-11-21)
- ✅ **Enhanced HomePage**: Services marketplace integrated into main homepage
- ✅ **Graceful Degradation**: Advertisement UI ready, backend endpoints pending
- ✅ **Improved UX**: HomePageNew.jsx with trending events, user registrations, and recommendations
- ⚠️ **Backend TODO**: Advertisement module endpoints need implementation (Phase 4)

---

## 📚 Documentation Map

This repository has been reorganized with focused documentation:

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** | Quick start & overview | Everyone |
| **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** | 🆕 MVP roadmap (6 weeks) | Project leads, Developers |
| **SETUP.md** | Installation & configuration | New developers |
| **PROJECT_STATUS.md** | Current status & roadmap | Project leads |
| **DEVELOPMENT.md** | Dev tools & checklists | Developers |
| **TESTING.md** | Testing guide & best practices | Developers |
| **WSL_VS_WINDOWS_ANALYSIS.md** | Environment comparison | Windows users |

**⚠️ See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for new features and implementation details.**

---

## ⚡ Quick Start

```bash
chmod +x start.sh
./start.sh
```

Or see **SETUP.md** for detailed installation steps.

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs

### Test Accounts (after seed)
- Admin: `admin@kazguu.kz` / `Password123!`
- Organizer: `organizer@kazguu.kz` / `Password123!`
- Student: `student1@kazguu.kz` / `Password123!`

---

## 🆕 New Features in Development

**See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for complete roadmap**

### Phase 1-3: Moderation System (7 days)
- **MODERATOR role** - New permission level between ORGANIZER and ADMIN
- Moderation queue API endpoints
- Technical filters (100 char minimum, repetition detection)
- Content safety checks

**Key files to create:**
- `backend/src/moderation/` - New module
- `backend/prisma/schema.prisma` - Add ModerationQueue model
- `frontend/js/pages/ModeratorDashboard.jsx` - New page

### Phase 4: Monetization (12 days)
- ✅ Flexible pricing for external venues (5,000-20,000 тг) - **DONE**
- ⚠️ Advertisement system (TOP_BANNER, NATIVE_FEED, STORY_BANNER) - **Frontend ready, Backend TODO**
- ✅ Paid events with Kaspi transfer verification - **DONE**
- ✅ Premium subscription (500 тг/month) - **DONE**

**Key files completed:**
- ✅ `backend/src/pricing/` - Pricing module
- ⚠️ `backend/src/advertisements/` - Ads module **NEEDS IMPLEMENTATION**
- ✅ `backend/prisma/schema.prisma` - PricingTier, Advertisement, PremiumSubscription models added
- ✅ `frontend/js/pages/PaymentVerificationPage.jsx` - Organizer payment checks
- ✅ `frontend/js/components/AdBanner.jsx` - Advertisement UI components
- ✅ `frontend/js/services/adsService.js` - Advertisement service (graceful error handling)

### Phase 5: Gamification (8 days)
- Points system (earn for attendance, participation)
- User levels: Новичок, Активист, Лидер, Легенда
- Achievements system
- Profile badges

**Key files to create:**
- `backend/src/gamification/` - New module
- `backend/prisma/schema.prisma` - Add UserPoints, Achievement models
- `frontend/js/components/GamificationProfile.jsx` - Progress display

### Quick Reference for New Developers:
```typescript
// Example: MODERATOR role check
import { ROLES } from '../common/constants';

@Roles(ROLES.MODERATOR, ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async getModerationQueue() { ... }
```

```javascript
// Example: Premium subscription check (frontend)
import { ROLES } from '@/utils';

const isPremium = user.subscription?.status === 'ACTIVE';
const listingLimit = isPremium ? 10 : 3;
```

---

## 🗂️ Project Structure

```
backend/src/
├── auth/          # Authentication & JWT
├── users/         # User management
├── events/        # Event management
├── registrations/ # Event registrations
├── clubs/         # Clubs & memberships
├── payments/      # Payment processing (mock)
├── checkin/       # QR validation
├── services/      # Marketplace
├── analytics/     # Statistics
├── moderation/    # 🆕 Content moderation (MODERATOR role)
├── pricing/       # 🆕 Flexible pricing for external venues
├── advertisements/# 🆕 Advertisement system
├── gamification/  # 🆕 Points, levels, achievements
├── common/        # 🌟 Shared utilities & constants
├── prisma/        # Database service
└── config/        # Configuration

frontend/js/
├── components/    # Reusable UI components
├── pages/        # Route components
├── services/     # API client & services
├── context/      # React Context (auth)
├── utils/        # 🌟 Shared utilities & constants
└── App.jsx       # Routes
```

---

## 🔄 Code Reuse Pattern

**Backend:** Use utilities from `common/utils/`:
```typescript
import { validatePagination, createPaginatedResponse, requireCreatorOrAdmin } from '../common/utils';
```

**Frontend:** Use utilities from `@/utils`:
```javascript
import { ROLES, formatDate, getCategoryColor, extractErrorMessage } from '@/utils';
```

⚡ Check if utility exists before writing duplicate code.

---

## 🔒 Architecture & Best Practices

### Backend Best Practices
- ✅ Prisma ORM (no SQL injection)
- ✅ TypeScript strict mode
- ✅ DTOs with validation
- ✅ Cryptographic security (crypto.randomBytes)
- ✅ Proper error handling
- ✅ Swagger API documentation

**See DEVELOPMENT.md** for pre-commit checklist and feature implementation guide.

### Frontend Best Practices
- ✅ React 19 + hooks
- ✅ Tailwind CSS (no inline styles)
- ✅ Shared constants (no hardcoded strings)
- ✅ Error handling with utilities
- ✅ Responsive design
- ✅ Dark theme support

---

## 🚀 Common Development Tasks

### Adding Backend Endpoint
1. Generate module/service/controller
2. Create DTOs with validation
3. Implement service method
4. Add Swagger decorators
5. Use shared utilities from `common/utils`
6. Add authorization checks
7. Test with `npm test`

**See DEVELOPMENT.md** for step-by-step guide.

### Adding Frontend Page
1. Create component in `pages/`
2. Create service in `services/` if needed
3. Add route in `App.jsx`
4. Use shared utilities from `@/utils`
5. Add navigation link
6. Test responsive design

**See DEVELOPMENT.md** for step-by-step guide.

### Database Changes
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Generate client: `npx prisma generate`
4. Update seed if needed
5. Test migrations

**See SETUP.md** for database operations.

### Running Tests
```bash
# Backend unit tests
cd backend && npm test

# Backend E2E tests
cd backend && npm run test:e2e

# Frontend tests
cd frontend && npm test

# With coverage
npm run test:cov  # backend
npm run test:coverage  # frontend
```

**See TESTING.md** for comprehensive testing guide.

---

## ⚠️ Status & Roadmap

### MVP Launch: 6 Weeks (240-304 hours)

**Current Status:**
- 🟢 3/8 critical security fixes done (Helmet, secrets, validation)
- 🟡 3 more security fixes for MVP (webhook, IDOR, race conditions)
- 🔴 5 security fixes deferred (JWT cookies, CSRF, XSS, etc.)

**MVP Priorities (see [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)):**
1. **Week 1:** Critical security (webhook verification, IDOR, race conditions)
2. **Week 2:** Moderation system (MODERATOR role, queue, filters)
3. **Week 3-4:** Monetization (pricing, ads, paid events, premium)
4. **Week 5:** Gamification (points, levels, achievements)
5. **Week 6:** Testing & production (E2E, load, security)

**Expected Results:**
- ✅ Full monetization system operational
- ✅ MODERATOR role with moderation workflow
- ✅ Basic gamification live
- ✅ 200+ students, 30-50k тг/month revenue target

**Deferred Features:**
- Full security hardening (5 critical issues)
- Personalized recommendations
- Kaspi API integration (manual verification instead)

**Full roadmap:** See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)

---

## 📊 Useful Commands

### Backend
```bash
cd backend
npm run start:dev       # Dev server with hot reload
npm run build          # Production build
npm test               # Unit tests
npm run lint           # ESLint check
npx prisma migrate dev # Create & apply migration
npx prisma studio     # Database GUI
```

### Frontend
```bash
npm run dev            # Dev server (port 5173)
npm run build          # Production build
npm run preview        # Preview built version
```

### Docker
```bash
docker-compose up -d postgres              # Database only
docker-compose up -d                       # All services
docker-compose logs -f                     # Live logs
docker-compose down -v                     # Stop & remove data
```

---

## 🚀 Implementing New Features

### Adding MODERATOR Role
```typescript
// 1. Update schema (backend/prisma/schema.prisma)
enum Role {
  STUDENT
  ORGANIZER
  ADMIN
  MODERATOR  // Add this
}

// 2. Create migration
npx prisma migrate dev --name add-moderator-role

// 3. Update constants (backend/src/common/constants/roles.ts)
export const ROLES = {
  STUDENT: 'STUDENT',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',  // Add this
};

// 4. Use in guards
@Roles(ROLES.MODERATOR, ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
```

### Adding Gamification
```typescript
// 1. Create models (backend/prisma/schema.prisma)
model UserPoints {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  points    Int      @default(0)
  level     String   @default("NOVICE") // NOVICE, ACTIVIST, LEADER, LEGEND
  updatedAt DateTime @updatedAt
}

model Achievement {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // FIRST_EVENT, CULTURAL_10, SPORTS_10, etc.
  earnedAt    DateTime @default(now())
}

// 2. Create service (backend/src/gamification/gamification.service.ts)
async awardPoints(userId: string, points: number, reason: string) {
  const userPoints = await this.prisma.userPoints.upsert({
    where: { userId },
    create: { userId, points },
    update: { points: { increment: points } },
  });
  
  // Check level up
  const newLevel = this.calculateLevel(userPoints.points);
  if (newLevel !== userPoints.level) {
    await this.levelUp(userId, newLevel);
  }
}
```

### Adding Monetization
```typescript
// 1. Pricing tiers (backend/src/pricing/pricing.service.ts)
const PRICING_TIERS = {
  BASIC: { price: 5000, name: 'Базовое размещение' },
  PREMIUM: { price: 10000, name: 'Премиум размещение' },
  PACKAGE_5: { price: 20000, name: 'Пакет (5 мероприятий)' },
};

// 2. Advertisement positions
const AD_POSITIONS = {
  TOP_BANNER: { price: 10000, size: '300x100', placement: 'hero' },
  NATIVE_FEED: { price: 8000, size: 'card', placement: 'feed' },
  STORY_BANNER: { price: 15000, size: 'vertical', placement: 'stories' },
};
```

**See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for complete implementation guide.**

---

## 🔍 Key Files Reference

**Configuration:**
- `backend/.env` - Backend environment variables
- `backend/tsconfig.json` - TypeScript config (strict mode enabled)
- `frontend/.env` - Frontend config (optional)
- `docker-compose.yml` - Docker services

**Database:**
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/seed.ts` - Seed data
- `backend/prisma/migrations/` - Migration history

**Utilities:**
- `backend/src/common/utils/` - Backend utilities
- `backend/src/common/constants/` - Backend constants
- `frontend/js/utils/` - Frontend utilities

**Entry Points:**
- `backend/src/main.ts` - Backend entry
- `frontend/js/App.jsx` - Frontend routes
- `backend/src/app.module.ts` - Global setup

---

## 🎓 Learning Resources

**See documentation:**
- **SETUP.md** - Installation & configuration
- **DEVELOPMENT.md** - Dev tools & checklists
- **PROJECT_STATUS.md** - Status & roadmap

**External:**
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## ❓ FAQ

**Q: How do I add a new API endpoint?**
A: See DEVELOPMENT.md → "Adding a New Backend Feature"

**Q: Where are the shared utilities?**
A: Backend: `backend/src/common/utils/` | Frontend: `frontend/js/utils/`

**Q: How do I run tests?**
A: See TESTING.md for complete testing guide

**Q: What's not production-ready?**
A: See PROJECT_STATUS.md → "Critical Issues"

**Q: How do I set up my environment (Windows/WSL)?**
A: See WSL_VS_WINDOWS_ANALYSIS.md or SETUP.md

**Q: When can this go to production?**
A: After 8-10 weeks of fixes. See PROJECT_STATUS.md for roadmap.

---

## 🔗 Documentation Index

1. **README.md** - Project overview & quick start
2. **SETUP.md** - Installation, Docker, environment config
3. **PROJECT_STATUS.md** - Status, issues, roadmap, timeline
4. **DEVELOPMENT.md** - Dev checklists, tools, UI guidelines
5. **TESTING.md** - Testing guide & best practices *(NEW)*
6. **WSL_VS_WINDOWS_ANALYSIS.md** - Platform comparison
7. **CLAUDE.md** - This file (quick reference)

---

**Last Updated:** 2025-11-20
**Version:** 3.1 (Phase 5-6 Complete)

For detailed roadmap and new features, refer to [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) 👆
