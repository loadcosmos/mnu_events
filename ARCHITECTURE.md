# MNU Events - Frontend Architecture

## Overview
This document describes the frontend architecture for the MNU Events platform, focusing on the API Services Layer and Protected Routes implementation.

## Technology Stack

- **React 19.2.0** - UI library
- **React Router DOM 7.9.5** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **Vite 7.2.0** - Build tool and dev server

## Project Structure

```
mnu_events/
├── js/
│   ├── services/           # API Services Layer
│   │   ├── apiClient.js    # Centralized Axios instance with interceptors
│   │   └── authService.js  # Authentication service
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication state management
│   ├── components/         # Reusable components
│   │   └── ProtectedRoute.jsx # Route protection wrapper
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── ClubsPage.jsx
│   │   ├── OrganizerPage.jsx (Protected)
│   │   └── AdminLoginPage.jsx
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── css/                    # Stylesheets
├── images/                 # Static assets
└── index.html              # HTML entry point
```

## Core Architecture Components

### 1. API Services Layer

#### apiClient.js
Centralized Axios instance that provides:

- **Base Configuration**: Configurable API URL, timeout, headers
- **Request Interceptor**: Automatically attaches JWT token to requests
- **Response Interceptor**: Handles errors globally, automatic token refresh
- **Error Handling**: Standardized error format, automatic redirect on 401

**Key Features:**
```javascript
- Automatic token injection from localStorage
- Global error handling (401, 403, 404, 422, 500+)
- Auto-redirect to login on authentication failure
- Development mode logging
- Convenient wrapper methods (get, post, put, patch, delete)
```

#### authService.js
Handles all authentication-related API calls:

**Methods:**
- `register(userData)` - User registration
- `login(credentials)` - User login
- `logout()` - User logout
- `getCurrentUser()` - Fetch current user data
- `updateProfile(userData)` - Update user profile
- `changePassword(passwordData)` - Change password
- `forgotPassword(email)` - Request password reset
- `resetPassword(resetData)` - Reset password with token
- `verifyEmail(token)` - Verify email address
- `resendVerificationEmail()` - Resend verification email

**Helper Methods:**
- `saveAuthData(token, user)` - Store auth data in localStorage
- `getToken()` - Retrieve token
- `getUser()` - Retrieve user data
- `isAuthenticated()` - Check if user is logged in
- `hasRole(roles)` - Check user role
- `hasPermission(permissions)` - Check user permissions

### 2. Authentication Context (AuthContext.jsx)

Global state management for authentication using React Context API.

**Provides:**
- `user` - Current user object
- `loading` - Loading state
- `error` - Error message
- `login(credentials)` - Login method
- `register(userData)` - Registration method
- `logout()` - Logout method
- `refreshUser()` - Refresh user data
- `updateProfile(userData)` - Update profile
- `isAuthenticated()` - Check auth status
- `hasRole(roles)` - Role checking
- `hasPermission(permissions)` - Permission checking

**Usage:**
```jsx
import { useAuth } from './context/AuthContext.jsx';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  // Use auth methods and state
}
```

### 3. Protected Routes

#### ProtectedRoute Component

Wrapper component that protects routes requiring authentication.

**Features:**
- Authentication check
- Role-based access control
- Permission-based access control
- Loading state handling
- Access denied page
- Redirect to login with return URL

**Usage:**
```jsx
// Basic protection - requires authentication
<Route path="/organizer" element={
  <ProtectedRoute>
    <OrganizerPage />
  </ProtectedRoute>
} />

// Role-based protection
<Route path="/admin/*" element={
  <ProtectedRoute roles={['admin', 'super_admin']}>
    <AdminRoutes />
  </ProtectedRoute>
} />

// Permission-based protection
<Route path="/events/create" element={
  <ProtectedRoute permissions="create_event">
    <CreateEventPage />
  </ProtectedRoute>
} />
```

## Routing Structure

```
/ - HomePage (public)
/login - LoginPage (public)
/events - EventsPage (public)
/clubs - ClubsPage (public)
/organizer - OrganizerPage (protected - requires auth)
/admin/login - AdminLoginPage (public)
/admin/* - Admin routes (protected - requires admin role)
```

## Authentication Flow

### Login Flow
1. User submits credentials on LoginPage
2. LoginPage calls `useAuth().login(credentials)`
3. AuthContext calls `authService.login(credentials)`
4. authService sends POST to `/api/auth/login`
5. On success, token and user data stored in localStorage
6. apiClient automatically includes token in future requests
7. User redirected to intended page or dashboard

### Protected Route Access
1. User attempts to access protected route
2. ProtectedRoute checks `isAuthenticated()`
3. If not authenticated → redirect to /login with return URL
4. If authenticated → check roles/permissions (if required)
5. If authorized → render protected content
6. If not authorized → show Access Denied page

### Token Expiry Handling
1. Request sent with expired token
2. Server responds with 401 Unauthorized
3. apiClient response interceptor catches error
4. Token and user data cleared from localStorage
5. User redirected to /login
6. User must login again

## State Management

### Local Storage
- `authToken` - JWT authentication token
- `user` - Serialized user object

### React Context
- AuthContext - Global authentication state
- Accessible via `useAuth()` hook throughout the app

## API Integration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
```

### Expected Backend Endpoints

**Authentication:**
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile
- POST `/api/auth/change-password` - Change password
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- POST `/api/auth/verify-email` - Verify email
- POST `/api/auth/resend-verification` - Resend verification

**Expected Response Format:**
```javascript
// Success
{
  token: "jwt_token_here",
  user: {
    id: 1,
    email: "user@kazguu.kz",
    name: "User Name",
    role: "user|organizer|admin|super_admin",
    permissions: ["create_event", "edit_event"]
  }
}

// Error
{
  message: "Error message",
  errors: {
    email: ["Email is invalid"],
    password: ["Password is too short"]
  }
}
```

## Security Features

1. **Token-based Authentication**: JWT tokens stored in localStorage
2. **Automatic Token Injection**: All API requests include auth token
3. **Request/Response Interceptors**: Centralized auth handling
4. **Protected Routes**: Client-side route protection
5. **Role-based Access Control**: Fine-grained permissions
6. **Secure Logout**: Clears all auth data
7. **Auto-redirect on Auth Failure**: Prevents unauthorized access

## Development

### Running the Application
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure `VITE_API_URL` to point to your backend API
3. Start the development server

## Next Steps

1. **Implement Event Services**: Create eventService.js for event operations
2. **Add Club Services**: Create clubService.js for club management
3. **User Profile Page**: Complete user profile editing
4. **Admin Dashboard**: Implement full admin functionality
5. **Error Boundaries**: Add React error boundaries for better error handling
6. **Loading States**: Improve loading indicators
7. **Toast Notifications**: Add global notification system
8. **Form Validation**: Add comprehensive form validation
9. **Testing**: Add unit and integration tests

## Best Practices

1. **Always use authService** for authentication operations
2. **Use AuthContext** for accessing auth state in components
3. **Wrap protected routes** with ProtectedRoute component
4. **Handle errors gracefully** in components
5. **Show loading states** during async operations
6. **Clear auth data** on logout or auth failures
7. **Use environment variables** for configuration
8. **Follow React Router best practices** for navigation

## Troubleshooting

### Token not being sent with requests
- Check that token exists in localStorage
- Verify apiClient is being used for requests
- Check request interceptor in apiClient.js

### Infinite redirect loop on login
- Verify login response contains valid token and user
- Check that authService.saveAuthData is being called
- Verify AuthContext is updating state correctly

### Protected route showing login page when authenticated
- Check AuthContext initialization in useEffect
- Verify getCurrentUser endpoint is working
- Check localStorage for authToken

### CORS errors
- Configure backend to allow requests from frontend origin
- Check that credentials are being sent correctly
- Verify API URL in environment variables
