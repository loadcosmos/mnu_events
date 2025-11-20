# Testing Guide

Comprehensive testing guide for MNU Events Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)

---

## Overview

The MNU Events Platform uses a comprehensive testing strategy:

- **Backend**: Jest + Supertest for unit and E2E tests
- **Frontend**: Vitest + React Testing Library (configuration ready)
- **Target Coverage**: 80% for backend, 70% for frontend

### Current Test Coverage

| Module | Unit Tests | E2E Tests | Coverage |
|--------|------------|-----------|----------|
| Auth | ✅ 8 tests | ✅ 12 tests | ~60% |
| Events | ✅ 15 tests | ✅ 18 tests | ~70% |
| Payments | ✅ 12 tests | ❌ Pending | ~55% |
| CheckIn | ❌ Pending | ❌ Pending | <10% |
| Services | ❌ Pending | ❌ Pending | <10% |
| Clubs | ❌ Pending | ❌ Pending | <10% |
| Frontend Utils | ✅ 30 tests | N/A | ~90% |

---

## Backend Testing

### Setup

All testing dependencies are already installed:

```bash
cd backend
npm install  # Installs jest, supertest, etc.
```

### Unit Tests

Unit tests test individual service methods in isolation.

**Location**: `backend/src/**/*.spec.ts`

**Run unit tests**:
```bash
cd backend
npm test                # Run all unit tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
```

**Example**: `auth.service.spec.ts`
```typescript
describe('AuthService', () => {
  it('should successfully login with valid credentials', async () => {
    // Test implementation
  });
});
```

### E2E Tests

E2E tests test complete API flows with real HTTP requests.

**Location**: `backend/test/**/*.e2e-spec.ts`

**Run E2E tests**:
```bash
cd backend
npm run test:e2e
```

**Requirements**:
- PostgreSQL must be running
- Database must be accessible
- Tests use a separate test database (recommended)

**Example**: `auth.e2e-spec.ts`
```typescript
describe('Auth (e2e)', () => {
  it('should register a new user successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);
  });
});
```

### Test Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts      # Unit tests
│   ├── events/
│   │   ├── events.service.ts
│   │   └── events.service.spec.ts    # Unit tests
│   └── payments/
│       ├── payments.service.ts
│       └── payments.service.spec.ts  # Unit tests
└── test/
    ├── jest-e2e.json                 # E2E config
    ├── auth.e2e-spec.ts              # Auth E2E
    └── events.e2e-spec.ts            # Events E2E
```

---

## Frontend Testing

### Setup

Install testing dependencies:

```bash
cd frontend
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  jsdom \
  @vitest/coverage-v8
```

### Component Tests

Test React components in isolation.

**Location**: `frontend/test/**/*.test.jsx`

**Run tests**:
```bash
cd frontend
npm test              # Run all tests
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage
```

**Example**: Testing a utility function
```javascript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../js/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-11-20T14:30:00Z');
    const result = formatDate(date);
    expect(result).toBeTruthy();
  });
});
```

### Test Structure

```
frontend/
├── js/
│   ├── components/
│   │   └── EventCard.jsx
│   ├── pages/
│   │   └── HomePage.jsx
│   └── utils/
│       └── index.js
└── test/
    ├── setup.js                # Test setup
    ├── utils.test.js           # Utils tests
    └── components/
        └── EventCard.test.jsx  # Component tests (to be added)
```

---

## E2E Testing

### Backend E2E Tests

**Implemented Tests**:

#### Authentication Flow (`auth.e2e-spec.ts`)
- ✅ User registration
- ✅ Email validation
- ✅ Password validation
- ✅ Login with verification
- ✅ Duplicate email handling
- ✅ Full auth flow (register → verify → login → logout)

#### Events CRUD (`events.e2e-spec.ts`)
- ✅ Create event (authorized/unauthorized)
- ✅ List events with pagination
- ✅ Filter events by category
- ✅ Get event details
- ✅ Update event (creator/non-creator)
- ✅ Delete event (authorization checks)
- ✅ Date validation (past dates, invalid ranges)

### Running E2E Tests

```bash
cd backend

# Make sure PostgreSQL is running
docker-compose up -d postgres

# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.e2e-spec.ts
```

**Important Notes**:
- E2E tests create real database records
- Tests clean up after themselves
- Use unique timestamps in test data to avoid conflicts
- Tests require database to be running

---

## Running Tests

### Quick Start

```bash
# Backend unit tests
cd backend && npm test

# Backend E2E tests
cd backend && npm run test:e2e

# Frontend tests
cd frontend && npm test

# All tests with coverage
cd backend && npm run test:cov
cd frontend && npm run test:coverage
```

### Continuous Integration

Tests are designed to run in CI/CD pipelines:

```bash
# In CI environment
cd backend
npm ci
npm run test:cov
npm run test:e2e

cd ../frontend
npm ci
npm run test:coverage
```

---

## Writing Tests

### Backend Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '../prisma/prisma.service';

describe('YourService', () => {
  let service: YourService;
  let prisma: PrismaService;

  const mockPrismaService = {
    model: {
      findUnique: jest.fn(),
      create: jest.fn(),
      // ... other methods
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const mockData = { id: '1', name: 'Test' };
    mockPrismaService.model.findUnique.mockResolvedValue(mockData);

    // Act
    const result = await service.doSomething('1');

    // Assert
    expect(result).toEqual(mockData);
    expect(mockPrismaService.model.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
});
```

### Backend E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('YourModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/your-endpoint (POST)', () => {
    return request(app.getHttpServer())
      .post('/your-endpoint')
      .send({ data: 'test' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });
});
```

### Frontend Test Template

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import YourComponent from '../components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockHandler = vi.fn();
    render(
      <BrowserRouter>
        <YourComponent onAction={mockHandler} />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: 'Click Me' });
    fireEvent.click(button);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

---

## Coverage Reports

### Backend Coverage

```bash
cd backend
npm run test:cov
```

**Output**:
- Console summary
- HTML report: `backend/coverage/index.html`
- JSON report: `backend/coverage/coverage-final.json`

### Frontend Coverage

```bash
cd frontend
npm run test:coverage
```

**Output**:
- Console summary
- HTML report: `frontend/coverage/index.html`

### Viewing Coverage

```bash
# Backend
open backend/coverage/index.html

# Frontend
open frontend/coverage/index.html
```

---

## Best Practices

### General

1. **Test Naming**: Use descriptive test names
   ```typescript
   it('should throw BadRequestException when end date is before start date', () => {})
   ```

2. **AAA Pattern**: Arrange, Act, Assert
   ```typescript
   it('should create event', async () => {
     // Arrange
     const createDto = { /* ... */ };

     // Act
     const result = await service.create(createDto);

     // Assert
     expect(result).toHaveProperty('id');
   });
   ```

3. **Isolation**: Each test should be independent
4. **Cleanup**: Clean up test data in `afterEach` or `afterAll`
5. **Mocking**: Mock external dependencies (database, APIs, etc.)

### Backend

1. **Mock Prisma**: Always mock PrismaService in unit tests
2. **Test Edge Cases**: Null values, invalid inputs, authorization
3. **Use Factories**: Create test data factories for complex objects
4. **Database Cleanup**: Clean up E2E test data

### Frontend

1. **User-Centric**: Test from user's perspective
2. **Avoid Implementation Details**: Don't test internal state
3. **Async Handling**: Use `waitFor` for async operations
4. **Accessibility**: Use accessible queries (`getByRole`, `getByLabelText`)

---

## Troubleshooting

### Backend Tests Failing

**Prisma Client not generated or out of date**:
```bash
# Regenerate Prisma Client (IMPORTANT!)
cd backend
npx prisma generate

# If network issues in Docker, try:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

**Known Issues (2025-11-20)**:
- ⚠️ Tests may fail if Prisma Client is not regenerated after schema changes
- ⚠️ Network restrictions in Docker may prevent Prisma binary downloads
- ✅ Solution: Run `npx prisma generate` in local environment before running tests

**Database connection errors**:
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres

# Check connection
docker-compose ps
```

**Module resolution errors**:
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Tests Failing

**JSDOM errors**:
```bash
# Ensure jsdom is installed
npm install --save-dev jsdom
```

**Module not found**:
```bash
# Check alias configuration in vitest.config.js
# Ensure paths match actual file structure
```

---

## Next Steps

### Pending Tests

1. **Backend**:
   - [ ] CheckIn module unit tests
   - [ ] Services module unit tests
   - [ ] Clubs module unit tests
   - [ ] Registrations module unit tests
   - [ ] Analytics module unit tests

2. **Frontend**:
   - [ ] Component tests (EventCard, ClubCard, etc.)
   - [ ] Page tests (HomePage, EventsPage, etc.)
   - [ ] Service tests (API client mocking)
   - [ ] Context tests (AuthContext)

3. **E2E**:
   - [ ] Payment flow E2E tests
   - [ ] Registration flow E2E tests
   - [ ] Check-in flow E2E tests
   - [ ] Admin operations E2E tests

### Target Coverage

- Backend: 80% (currently ~40%)
- Frontend: 70% (currently ~10%)
- E2E: 30+ critical flows covered (currently ~15)

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

---

**Last Updated**: 2025-11-20
**Version**: 1.0
