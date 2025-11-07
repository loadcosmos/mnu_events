# MNU Events - Frontend

React + TypeScript frontend for Maqsut Narikbayev University Events Platform

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** for API calls
- **Zustand** for state management (Auth)
- **React Hook Form + Zod** for forms
- **Lucide React** for icons
- **date-fns** for date formatting

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Backend API running on http://localhost:3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Auth/              # Login, Register, VerifyEmail
│   │   ├── Events/            # Events list, EventDetails
│   │   ├── Dashboard/         # Profile, MyRegistrations
│   │   ├── Organizer/         # Event management
│   │   └── Admin/             # Admin panel
│   ├── components/
│   │   ├── layout/            # Layout, Navbar
│   │   ├── events/            # Event components
│   │   └── ui/                # Reusable UI components
│   ├── services/
│   │   ├── api.ts             # Axios instance
│   │   ├── auth.service.ts
│   │   ├── events.service.ts
│   │   └── registrations.service.ts
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Main app with routes
│   └── main.tsx               # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🎨 Features

### Authentication
- Register with @kazguu.kz email
- Email verification with 6-digit code
- JWT-based authentication
- Automatic token refresh

### Events
- Browse all events
- Filter by category, status
- View event details
- Register for events
- View my registrations

### User Dashboard
- View profile
- Edit profile
- View registered events

## 🔌 API Integration

All API calls go through the `api.ts` service with:
- Automatic token injection
- Token refresh on 401
- Error handling

```typescript
// Example: Register for event
import { registrationsService } from '@/services/registrations.service';

await registrationsService.register(eventId);
```

## 🎨 Styling

Using Tailwind CSS with custom primary color (red):

```javascript
// tailwind.config.js
colors: {
  primary: {
    600: '#dc2626', // MNU red
    700: '#b91c1c',
  }
}
```

## 📦 Build for Production

```bash
npm run build
```

Build output will be in `dist/` folder.

## 🚀 Deploy

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `VITE_API_URL`: Your backend API URL

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🔗 Links

- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Frontend: http://localhost:5173

## 🎓 University

**Maqsut Narikbayev University (MNU)**
Astana, Kazakhstan
