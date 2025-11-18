# Development Guide & Checklists

Development tools, checklists, and guidelines for MNU Events Platform developers.

## 📋 Table of Contents

- [Pre-commit Checklist](#pre-commit-checklist)
- [Feature Implementation Guide](#feature-implementation-guide)
- [Testing Checklist](#testing-checklist)
- [UI/UX Guidelines](#uiux-guidelines)
- [Dark Theme Implementation](#dark-theme-implementation)
- [Code Analysis Quick Reference](#code-analysis-quick-reference)
- [Development Environment](#development-environment)

---

## ✅ Pre-commit Checklist

Before committing code, ensure:

### Backend Changes

- [ ] **Code Quality**
  - [ ] Run `npm run lint` - ESLint check passes
  - [ ] Run `npm run build` - TypeScript compilation succeeds
  - [ ] All types are explicit (no `any` types unless justified)

- [ ] **Testing**
  - [ ] New features have unit tests
  - [ ] All tests pass: `npm test`
  - [ ] Coverage didn't decrease

- [ ] **Database**
  - [ ] Schema changes have corresponding migrations
  - [ ] Migration can run forward and backward
  - [ ] Run `npx prisma generate` after schema changes

- [ ] **Security**
  - [ ] No hardcoded secrets in code
  - [ ] Input validation added to DTOs
  - [ ] Authorization checks on protected routes
  - [ ] No SQL injection vectors (using Prisma ORM)

- [ ] **Performance**
  - [ ] No N+1 queries (use `include` or `relationLoadStrategy`)
  - [ ] Database indexes exist for frequently queried fields
  - [ ] Pagination implemented for large result sets

- [ ] **Documentation**
  - [ ] JSDoc comments added to public methods
  - [ ] Swagger decorators added to API endpoints
  - [ ] README updated if new dependencies added

### Frontend Changes

- [ ] **Code Quality**
  - [ ] Run `npm run build` - Production build succeeds
  - [ ] No console errors or warnings
  - [ ] ESLint passes (if configured)

- [ ] **React Best Practices**
  - [ ] Props are properly validated
  - [ ] No unnecessary re-renders (use `React.memo` for expensive components)
  - [ ] useEffect has proper dependencies array
  - [ ] No memory leaks (cleanup functions on unmount)

- [ ] **Styling**
  - [ ] Using Tailwind CSS (no inline styles)
  - [ ] Responsive design tested on mobile/tablet/desktop
  - [ ] Dark theme support (if applicable)
  - [ ] Consistent spacing and typography

- [ ] **Testing**
  - [ ] Manual testing completed
  - [ ] Component tests pass (if applicable)
  - [ ] E2E tests pass (if applicable)

- [ ] **Performance**
  - [ ] No large bundle size increases
  - [ ] Images optimized (use CDN or compression)
  - [ ] API calls debounced where appropriate

- [ ] **Accessibility**
  - [ ] Alt text on images
  - [ ] Proper heading hierarchy
  - [ ] Keyboard navigation works
  - [ ] Color contrast meets WCAG standards

- [ ] **Documentation**
  - [ ] Comments added for complex logic
  - [ ] Component props documented
  - [ ] README/SETUP updated if new features

### Git Commit

- [ ] Commit message is clear and descriptive
  - Use format: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `perf`, `security`
  - Example: `feat(payments): add QR code generation for tickets`

- [ ] Changes are logically grouped (atomic commits)
- [ ] No debug code left (console.log, debugger)
- [ ] No commented-out code blocks

---

## 🚀 Feature Implementation Guide

### Adding a New Backend Feature

**Example: Adding a new API endpoint**

```bash
# 1. Create the feature module
nest generate module features/my-feature
nest generate service features/my-feature
nest generate controller features/my-feature

# 2. Define DTOs
mkdir backend/src/my-feature/dto
touch backend/src/my-feature/dto/create-my-feature.dto.ts
touch backend/src/my-feature/dto/update-my-feature.dto.ts

# 3. Implement service methods
# Edit: backend/src/my-feature/my-feature.service.ts

# 4. Implement controller endpoints
# Edit: backend/src/my-feature/my-feature.controller.ts
# Add Swagger decorators: @ApiOperation, @ApiResponse

# 5. Database changes (if needed)
npx prisma migrate dev --name add-my-feature
npx prisma generate

# 6. Add tests
touch backend/src/my-feature/my-feature.service.spec.ts
touch backend/src/my-feature/my-feature.controller.spec.ts

# 7. Run verification
npm run build
npm run lint
npm test
npm run start:dev
```

**Best Practices:**
- Use shared utilities from `common/utils`
- Add proper DTOs with validation
- Document endpoints with Swagger
- Implement authorization checks
- Add database indexes for query performance
- Write unit tests

### Adding a New Frontend Page

**Example: Creating a new page**

```bash
# 1. Create page component
touch frontend/js/pages/MyNewPage.jsx

# 2. Create page structure
# ├── Page component
# ├── Import services
# ├── Use auth context
# └── Apply layout wrapper

# 3. Create corresponding service (if needed)
touch frontend/js/services/myNewService.js

# 4. Add route in App.jsx
# Import page and add route:
# <Route path="/my-new-page" element={<ProtectedRoute roles={['ADMIN']}><MyNewPage /></ProtectedRoute>} />

# 5. Test the page
npm run dev
# Visit http://localhost:5173/my-new-page

# 6. Add to navigation (if user-facing)
# Edit: frontend/js/components/Layout.jsx or relevant layout

# 7. Run production build test
npm run build
npm run preview
```

**Best Practices:**
- Use shared utilities from `@/utils`
- Implement proper error handling
- Add loading states for API calls
- Use React hooks properly
- Test on multiple screen sizes
- Add documentation in component

### Adding a New Component

```bash
# 1. Create component
touch frontend/js/components/MyComponent.jsx

# 2. Component structure
function MyComponent({ prop1, prop2 }) {
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}

export default MyComponent;

# 3. Add to appropriate page or layout
import MyComponent from '@/components/MyComponent';

# 4. Optimize if heavy
import { memo } from 'react';
export default memo(MyComponent);

# 5. Test in story or directly in page
npm run dev
```

**Best Practices:**
- Keep components focused and reusable
- Use Tailwind for styling
- Pass props clearly
- Memoize expensive components
- Add JSDoc comments
- Test with various prop combinations

### Database Migration

```bash
cd backend

# 1. Edit schema
# Edit: backend/prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name describe-change

# 3. Generate Prisma client
npx prisma generate

# 4. Update seed if needed
# Edit: backend/prisma/seed.ts

# 5. Test the migration
npx prisma db push
npx prisma db seed

# 6. Verify schema
npx prisma studio
```

**Best Practices:**
- Write descriptive migration names
- Test migrations work forward and backward
- Create indexes for frequently queried fields
- Add cascading deletes if appropriate
- Document complex relations in comments

---

## 🧪 Testing Checklist

### Manual Testing Workflow

**Before Running E2E Tests:**

1. **Clear State**
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

2. **Start Services**
   - Terminal 1: `cd backend && npm run start:dev`
   - Terminal 2: `npm run dev` (frontend)

3. **Test User Flows**
   - [ ] Login/Logout works
   - [ ] Navigation works on all pages
   - [ ] Forms validate properly
   - [ ] API errors are handled gracefully
   - [ ] No console errors

4. **Feature Testing**
   - [ ] Create event
   - [ ] Register for event
   - [ ] View profile
   - [ ] Admin features
   - [ ] Payment flow (mock)

### E2E Testing

**Run Playwright Tests**
```bash
# Start servers first
npm run dev  # frontend
npm run start:dev  # backend (from backend dir)

# Run E2E tests
npx playwright test

# Run specific test
npx playwright test e2e/paid-events.spec.js

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

**Critical Test Scenarios:**
- [ ] User registration and login
- [ ] Event creation and filtering
- [ ] Event registration and waitlist
- [ ] Payment processing (mock)
- [ ] QR code generation and validation
- [ ] Admin dashboard access
- [ ] Role-based access control

### Unit Testing

**Backend Tests**
```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:cov

# Specific test file
npm test auth.service.spec.ts
```

**Frontend Tests** (if configured with Vitest)
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

---

## 🎨 UI/UX Guidelines

### Liquid Glass Design System

The MNU Events Platform uses a **liquid glass (glassmorphism)** design with:
- Dark theme as default
- Semi-transparent backgrounds with backdrop blur
- Neon accent color (#d62e1f - Red)
- Smooth gradients
- Hover animations

### Color Palette

**Primary Colors:**
```css
Background Dark:     #0a0a0a (main background)
Background Medium:   #1a1a1a (cards, containers)
Background Light:    #2a2a2a (borders, accents)
Text Primary:        #ffffff (main text)
Text Secondary:      #a0a0a0 (secondary text)
Accent Red:          #d62e1f (buttons, highlights)
Accent Red Hover:    #b91c1c (button hover state)
```

### Typography

**Font Stack:** `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;`

**Sizes:**
- Heading H1: 48px-72px (bold)
- Heading H2: 36px (bold)
- Heading H3: 24px (bold)
- Body: 14-16px
- Caption: 12px

**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Component Patterns

**Buttons:**
```jsx
// Primary Button
<button className="bg-[#d62e1f] hover:bg-[#b91c1c] text-white font-bold py-2 px-4 rounded-lg transition-colors">
  Action
</button>

// Secondary Button
<button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a] font-bold py-2 px-4 rounded-lg transition-colors">
  Secondary
</button>

// Ghost Button
<button className="text-white hover:text-[#d62e1f] transition-colors">
  Ghost
</button>
```

**Cards:**
```jsx
// Glass Card
<div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-lg p-6">
  <h3 className="text-white font-bold">Card Title</h3>
  <p className="text-[#a0a0a0] mt-2">Card content</p>
</div>
```

**Inputs:**
```jsx
<input
  type="text"
  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg px-3 py-2 placeholder-[#666] focus:outline-none focus:border-[#d62e1f] transition-colors"
  placeholder="Enter text..."
/>
```

### Responsive Design Breakpoints

```css
Mobile:    < 640px   (sm)
Tablet:    640px+    (md)
Desktop:   1024px+   (lg)
Wide:      1280px+   (xl)
```

**Mobile-First Approach:**
- Design for mobile first
- Add features for larger screens
- Test on actual devices
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

---

## 🎨 Dark Theme Implementation

### Current Status

**Completed:**
- ✅ Color palette defined in `constants.js`
- ✅ Global styles in `globals.css`
- ✅ BottomNavigation component
- ✅ FilterSheet component
- ✅ Most pages updated to dark theme

**TODO:**
- [ ] Hero Section: Apply gradient background
- [ ] HomePage → Dashboard: Refactor as landing page
- [ ] Layout: Update header colors
- [ ] All Components: Verify dark theme colors

### Implementing Dark Theme for New Components

**Step 1: Use Color Constants**
```jsx
import { COLORS } from '@/utils';

<div style={{ backgroundColor: COLORS.darkBg }}>
  <h1 style={{ color: COLORS.textPrimary }}>Title</h1>
  <p style={{ color: COLORS.textSecondary }}>Secondary text</p>
</div>
```

**Step 2: Apply Tailwind Classes**
```jsx
<div className="bg-[#0a0a0a] text-white">
  <h1 className="text-white font-bold">Title</h1>
  <p className="text-[#a0a0a0]">Secondary text</p>
  <button className="bg-[#d62e1f] hover:bg-[#b91c1c] text-white">
    Action
  </button>
</div>
```

**Step 3: Add Liquid Glass Effect**
```jsx
<div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-xl">
  {/* Glass card content */}
</div>
```

### Layout Update Example

**Before (Light Theme):**
```jsx
<header className="bg-white text-gray-900 border-b">
  {/* Light header */}
</header>
```

**After (Dark Theme):**
```jsx
<header className="bg-[#1a1a1a] text-white border-b border-[#2a2a2a]">
  {/* Dark header */}
</header>
```

### Testing Dark Theme

- [ ] Verify colors on different backgrounds
- [ ] Check text contrast (WCAG AA minimum)
- [ ] Test on mobile (Bottom Navigation visible)
- [ ] Test on desktop (Full header visible)
- [ ] Verify accent colors pop against dark bg
- [ ] Test hover/active states

---

## 📊 Code Analysis Quick Reference

### File Structure Overview

```
backend/src/
├── auth/              # Authentication, JWT, email
├── users/             # User management (CRUD)
├── events/            # Event management, filtering
├── registrations/     # Event registrations, check-ins
├── clubs/             # Clubs and memberships
├── payments/          # Payment processing (mock)
├── checkin/           # QR validation
├── services/          # Marketplace services
├── analytics/         # Statistics and dashboards
├── common/            # ⭐ Shared utilities & constants
├── prisma/            # Database service (singleton)
├── config/            # Configuration loader
└── app.module.ts      # Main app module

frontend/js/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn-style components
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   └── ...
├── pages/            # Route components
├── services/         # API client & domain services
├── context/          # React Context (auth)
├── utils/            # ⭐ Shared utilities & constants
└── App.jsx           # Route definitions
```

### Key Files by Role

**Backend Developer:**
- `app.module.ts` - Global setup
- `common/utils/` - Reusable utilities
- `<feature>/<feature>.service.ts` - Business logic
- `<feature>/<feature>.controller.ts` - API endpoints
- `prisma/schema.prisma` - Database schema

**Frontend Developer:**
- `App.jsx` - Route definitions
- `components/Layout.jsx` - Page wrapper
- `services/apiClient.js` - API configuration
- `context/AuthContext.jsx` - Global auth state
- `utils/constants.js` - Shared constants

**Full Stack Developer:**
- All of the above + DevOps considerations

### Navigation by Task

**I need to add a new API endpoint:**
1. Generate module/service/controller
2. Create DTOs in `<feature>/dto/`
3. Implement service method
4. Add controller endpoint with Swagger
5. Add authorization check
6. Test with Swagger UI

**I need to create a new page:**
1. Create component in `pages/`
2. Create service in `services/` if needed
3. Add route in `App.jsx`
4. Add navigation link
5. Test the page

**I need to fix a bug:**
1. Reproduce in development
2. Identify affected file(s)
3. Create test case
4. Fix code
5. Verify all tests pass

**I need to optimize performance:**
1. Check for N+1 queries (backend)
2. Add missing indexes (database)
3. Use pagination utilities
4. Add Redis caching
5. Implement code splitting (frontend)

---

## 💻 Development Environment

### Required Tools

```bash
# Check versions
node --version          # 20+
npm --version          # 10+
docker --version       # 24+
docker-compose --version # v2.20+
git --version          # 2.40+
```

### Useful Commands Reference

**Backend**
```bash
cd backend

# Development
npm run start:dev       # Start with hot reload
npm run start:debug    # Start with debugger
npm run build          # Production build

# Testing
npm test               # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage

# Code Quality
npm run lint           # ESLint check
npm run format         # Prettier formatting

# Database
npx prisma migrate dev        # Create & apply migration
npx prisma migrate deploy     # Apply migrations
npx prisma db seed           # Seed database
npx prisma studio           # GUI for database
```

**Frontend**
```bash
# Development
npm run dev             # Start dev server (port 5173)
npm run build          # Production build
npm run preview        # Preview built version

# Code Quality
npm run lint           # ESLint (if configured)

# Testing
npm run test           # Unit tests (if configured)
npm run test:e2e       # E2E tests
npm run test:ui        # Playwright UI
```

**Docker**
```bash
# Services
docker-compose up -d postgres          # Start database only
docker-compose up -d               # Start all services
docker-compose down                # Stop all services
docker-compose down -v             # Stop and remove data

# Logs
docker-compose logs -f             # Follow logs
docker-compose logs backend        # Backend logs only

# Database Operations
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
docker-compose exec backend npx prisma studio
```

### Debugging Tips

**Backend:**
```bash
# Add debugger statement
debugger;

# Start with debugger
npm run start:debug

# VS Code debug: Use launch.json
# Attach debugger at port 9229
```

**Frontend:**
```bash
# Browser DevTools (F12)
# - Console for errors
# - Network tab for API calls
# - Performance for optimization

# React DevTools
# Chrome extension for React component inspection

# Add debug logging
console.log('Debug:', value);
```

**Database:**
```bash
# Open GUI
npx prisma studio

# Check schema
npx prisma db execute --stdin < query.sql

# Inspect data
docker-compose exec postgres psql -U postgres -d mnu_events
```

---

## 📚 Related Documentation

- **SETUP.md** - Installation and configuration
- **PROJECT_STATUS.md** - Project status and roadmap
- **CLAUDE.md** - Detailed development guidelines
- **README.md** - Quick overview

---

**Last Updated:** 2025-11-18
**Version:** 2.0 (Consolidated Development Guide)
