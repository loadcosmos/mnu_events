# CLAUDE.md

Quick reference and guidance for Claude Code when working with MNU Events Platform.

## 🎯 Project Overview

**MNU Events Platform** - University events management system
**Status:** 82% Complete | Grade: C+ | Production Ready: ❌

**Tech Stack:**
- Backend: NestJS 10 + Prisma ORM + PostgreSQL
- Frontend: React 19 + Vite 7 + Tailwind CSS + React Router v7
- Auth: JWT with role-based access control (STUDENT, ORGANIZER, ADMIN)
- Design: Liquid glass (glassmorphism) + dark theme

---

## 📚 Documentation Map

This repository has been reorganized with focused documentation:

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** | Quick start & overview | Everyone |
| **SETUP.md** | Installation & configuration | New developers |
| **PROJECT_STATUS.md** | Current status & roadmap | Project leads |
| **DEVELOPMENT.md** | Dev tools & checklists | Developers |
| **WSL_VS_WINDOWS_ANALYSIS.md** | Environment comparison | Windows users |

**⚠️ See specific docs instead of this file for detailed guidance.**

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

---

## ⚠️ Critical Issues & Roadmap

### Security Issues (8 Critical)
- JWT tokens in localStorage (XSS vulnerable)
- No JWT token blacklist
- No CSRF protection
- No input sanitization
- Weak password hashing
- Hardcoded secrets in .env.example
- No error boundaries
- No environment validation

**Full audit:** See PROJECT_STATUS.md

### Production Requirements (8-10 weeks)
1. Fix security vulnerabilities (Week 1-2)
2. Add logging & monitoring (Week 3-4)
3. Comprehensive testing (Week 5-6)
4. Performance optimization (Week 7-8)
5. CI/CD setup (Week 9)
6. Security audit & deployment (Week 10)

**Detailed roadmap:** See PROJECT_STATUS.md

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

**Q: How do I run E2E tests?**
A: See DEVELOPMENT.md → "E2E Testing"

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
5. **WSL_VS_WINDOWS_ANALYSIS.md** - Platform comparison
6. **CLAUDE.md** - This file (quick reference)

---

**Last Updated:** 2025-11-18
**Version:** 3.0 (Simplified Reference Guide)

For detailed guidance, refer to specific documentation above. 👆
