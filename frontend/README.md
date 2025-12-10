# TRIDENT Match Portal - Frontend

**Last Updated**: December 10, 2025  
**Version**: 0.2.0  
**Tech Stack**: React 18.2, Vite 7.1, React Router 7.9, Bootstrap 5.3

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Set up environment variables:**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access application:**
- Frontend: `http://localhost:3000`
- Make sure backend is running on `http://localhost:5000`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── auth/
│   │   └── AuthContext.jsx       # Global auth state management
│   ├── components/
│   │   ├── ui/
│   │   │   ├── LoginForm.jsx     # Login modal form
│   │   │   ├── SignUpForm.jsx    # Signup modal form
│   │   │   └── Modal.jsx         # Reusable modal wrapper
│   │   ├── TopBar.jsx            # Responsive navigation bar
│   │   ├── Footer.jsx            # Site footer
│   │   ├── ProtectedRoute.jsx    # Route authentication wrapper
│   │   └── FloatingChatBox.jsx   # Homepage chat widget
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Dashboard.jsx         # Role-based dashboard router
│   │   ├── AdminDashboard.jsx    # Admin control panel
│   │   ├── Browse.jsx            # Project browsing
│   │   ├── Settings.jsx          # User settings
│   │   ├── Messages.jsx          # Messaging interface
│   │   ├── MessagesPage.jsx      # Full messages page
│   │   ├── OrgForm.jsx           # Organization form
│   │   └── NonprofitSignup.jsx   # Nonprofit signup flow
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # React entry point
│   └── styles.css                # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🎨 Key Components

### Authentication System

**AuthContext** (`src/auth/AuthContext.jsx`)
- Global authentication state management
- Provides user data and JWT token
- Handles login, logout, and session persistence
- Role-based navigation helpers

```jsx
const { user, token, isAuthenticated, login, logout, loginAndRedirect } = useAuth()
```

**LoginForm** (`src/components/ui/LoginForm.jsx`)
- Modal-based login interface
- Email and password validation
- Error handling and loading states
- Auto-redirect on success

**SignUpForm** (`src/components/ui/SignUpForm.jsx`)
- Multi-step signup process
- Role selection (nonprofit/researcher)
- Profile creation on registration
- Form validation

### Navigation

**TopBar** (`src/components/TopBar.jsx`)
- Fully responsive navigation
- Mobile hamburger menu
- Conditional rendering based on auth state
- Role-specific dashboard links

Features:
- Desktop: Horizontal navigation with dropdowns
- Tablet: Progressive collapse
- Mobile: Hamburger menu with vertical links

### Dashboards

**Dashboard** (`src/pages/Dashboard.jsx`)
- Role-based routing component
- Switches between nonprofit, researcher, admin views
- Fallback to localStorage if context unavailable

**Nonprofit Dashboard**
- Organization profile overview
- Posted projects management
- Researcher matches
- Application tracking

**Researcher Dashboard**
- Personal profile
- Project matches
- Available opportunities
- Preferences and criteria settings

**Admin Dashboard** (`src/pages/AdminDashboard.jsx`)
- Platform statistics
- User management
- Organization oversight
- Project moderation
- System analytics

### Pages

**Home** (`src/pages/Home.jsx`)
- Landing page with hero section
- Feature highlights
- Call-to-action buttons
- Floating chat widget for authenticated users

**Browse** (`src/pages/Browse.jsx`)
- Project listing with filters
- Search functionality
- Pagination support
- Quick view and details

**Settings** (`src/pages/Settings.jsx`)
- Profile editing
- Password change
- Notification preferences
- Account management

**Messages** (`src/pages/Messages.jsx`)
- Conversation list
- Real-time messaging interface
- Message history
- Notification indicators

---
- Vite auto-proxies `/api` requests to `http://localhost:4000`

---

## 📁 Project Structure

```
frontend/src/
├── main.jsx                 # Application entry point
├── App.jsx                  # Root component with routing
├── styles.css               # Global styles
├── auth/
│   └── AuthContext.jsx      # Authentication context provider
├── components/
│   ├── TopBar.jsx           # Navigation header
│   ├── Footer.jsx           # Page footer
│   ├── Hero.jsx             # Landing page hero
│   ├── HowItWorks.jsx       # Feature explanation
│   ├── Metrics.jsx          # Platform statistics
│   ├── Trust.jsx            # Trust indicators
│   ├── SearchPreview.jsx    # Project search preview
│   ├── FeaturedProjects.jsx # Featured projects carousel
│   ├── Newsletter.jsx       # Newsletter signup
│   ├── ProtectedRoute.jsx   # Route protection HOC
│   ├── browse/
│   │   ├── Browse.jsx       # Public project browsing
│   │   └── ProjectCard.jsx  # Project display card
│   ├── nonprofitDash/
│   │   ├── NonprofitDashboard.jsx
│   │   ├── ProfileSection.jsx
---

## 🎨 Styling & UI

### Bootstrap 5 Integration
- Responsive grid system
- Pre-built components (cards, modals, buttons)
- Utility classes for spacing, colors, typography
- Mobile-first design approach

### Custom Styles
- Global styles in `styles.css`
- Component-specific styling
- Consistent color scheme
- Accessible design patterns

### Responsive Breakpoints
```css
/* Mobile: < 768px */
/* Tablet: 768px - 991px */
/* Desktop: ≥ 992px */
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start Vite dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (if configured)
```

---

## 🔌 API Integration

### API Base URL
Configured via environment variable:
```env
VITE_API_URL=http://localhost:5000
```

### Making API Calls

```javascript
// Example: Authenticated request
const { token } = useAuth()

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

const result = await response.json()
```

### Error Handling Pattern

```javascript
try {
  const res = await fetch('/api/endpoint')
  const data = await res.json()
  
  if (res.ok) {
    // Handle success
  } else {
    // Handle API error
    setError(data.error || 'Request failed')
  }
} catch (err) {
  // Handle network error
  setError('Network error. Please try again.')
}
```

---

## 🚦 Routing

### Route Structure

| Path | Component | Protection | Description |
|------|-----------|------------|-------------|
| `/` | Home | Public | Landing page |
| `/browse` | Browse | Public | Browse projects |
| `/dashboard/:role` | Dashboard | Protected | Role-based dashboard |
| `/admin` | AdminDashboard | Admin only | Admin panel |
| `/settings` | Settings | Protected | User settings |
| `/messages` | Messages | Protected | Messaging system |

### Protected Routes

```jsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### Role-Based Navigation

```jsx
// After login, redirect based on role
const role = user?.role || 'researcher'
navigate(`/dashboard/${role}`, { replace: true })
```

---

## 🔐 Authentication Flow

### Login Process
1. User submits credentials via `LoginForm`
2. API validates and returns `{ user, token }`
3. `AuthContext` stores in state and localStorage
4. `loginAndRedirect()` navigates to role-based dashboard
5. Token included in subsequent API requests

### Session Persistence
```javascript
// On app load, restore session from localStorage
useEffect(() => {
  const rawUser = localStorage.getItem('trident_user')
  const rawToken = localStorage.getItem('trident_token')
  if (rawUser && rawToken) {
    setUser(JSON.parse(rawUser))
    setToken(rawToken)
  }
}, [])
```

### Logout Process
```javascript
function logout() {
  setUser(null)
  setToken(null)
  localStorage.removeItem('trident_user')
  localStorage.removeItem('trident_token')
  navigate('/', { replace: true })
  window.location.reload()
}
```

---

## 🎯 Key Features

### Implemented ✅
- Responsive design (mobile, tablet, desktop)
- Role-based authentication
- Dynamic dashboard rendering
- Real-time form validation
- Error handling and user feedback
- Loading states for async operations
- Modal-based forms
- Pagination support
- Search and filter functionality

### In Progress 🚧
- File upload for profile pictures
- Real-time messaging
- Notification system
- Advanced project filters
- Calendar integration

---

## 🐛 Troubleshooting

### Common Issues

**Error: `Cannot find module 'react-router-dom'`**
```bash
npm install react-router-dom
```

**Error: `CORS policy blocked`**
- Ensure backend CORS is configured for `http://localhost:3000`
- Check backend `CORS_ORIGIN` environment variable

**Error: `Network request failed`**
- Verify backend is running on correct port (5000)
- Check `VITE_API_URL` in `.env`
- Inspect browser console for details

**Blank page after build**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Additional Documentation

- [Component Library](../docs/guides/frontend.md) - Component patterns
- [API Integration](../docs/api/) - Backend endpoints
- [State Management](../docs/architecture/state-management.md) - Context usage
- [Styling Guide](../docs/guides/styling.md) - CSS conventions

---

## 🤝 Contributing

When adding new components:
1. Follow existing file structure
2. Use functional components with hooks
3. Include PropTypes or TypeScript types
4. Add error boundaries for critical components
5. Ensure mobile responsiveness
6. Test across browsers

---

**Last Updated:** December 10, 2025  
**Maintainer:** TRIDENT Development Team
  - Completed projects archive
  - Organization details with tags
  - Budget and agreement information
  - Dynamic tab counts
  - Loading states and error handling
- Availability status management

#### Account Settings ✅
- Profile editing for all user roles
- Password change functionality
- Account deletion (with confirmation)
- Notification preferences
- Privacy settings
- Theme preferences

#### Admin Dashboard ✅
- System statistics overview
- User management (view, suspend, activate, delete)
- Organization oversight
- Project moderation
- Bulk actions support
- Search and filtering

### Components Implemented (15+)

#### Layout Components
- `TopBar.jsx` - Navigation with role-based menu items
- `Footer.jsx` - Site footer with links
- `ProtectedRoute.jsx` - Route protection HOC

#### Landing Page Components
- `Hero.jsx` - Hero section
- `HowItWorks.jsx` - Feature showcase
- `Metrics.jsx` - Platform statistics
- `Trust.jsx` - Trust indicators
- `SearchPreview.jsx` - Search component
- `FeaturedProjects.jsx` - Project carousel
- `Newsletter.jsx` - Newsletter signup

#### Feature Components
- `Browse.jsx` - Project browsing page
- `ProjectCard.jsx` - Reusable project display
- `ProfileSection.jsx` (Nonprofit & Researcher versions)
- `ProjectsCreated.jsx` - Nonprofit project management
- `ProjectsInvolved.jsx` - Researcher collaborations (with API integration)
- `Milestones.jsx` - Milestone tracking
- `AccountSettings.jsx` - Settings management
- `AdminDashboard.jsx` - Admin control panel

### API Integration ✅

**Authentication:**
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

**User Management:**
- GET `/api/users/me` - Get current user
- PUT `/api/users/me` - Update profile
- PUT `/api/users/me/password` - Change password
- DELETE `/api/users/me` - Delete account

**Organization:**
- GET `/api/organizations` - List organizations
- GET `/api/organizations/me` - Get org profile
- PUT `/api/organizations/me` - Update org

**Researcher:**
- GET `/api/researchers/me` - Get profile
- PUT `/api/researchers/me` - Update profile
- GET `/api/researchers/me/projects` - Get collaborations (NEW)
- Academic history CRUD endpoints
- Certifications CRUD endpoints

**Projects:**
- GET `/api/projects` - Browse projects
- GET `/api/projects/:id` - Get project details
- POST `/api/projects` - Create project
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

**Milestones:**
- Full CRUD operations
- Analytics endpoint integration

**Admin:**
- User management endpoints
- Organization management
- Project moderation
- System statistics

### State Management ✅

- **AuthContext** - Global authentication state with hooks:
  - `useAuth()` - Access user, token, role
  - Login/logout functionality
  - Automatic token refresh
  - Protected route integration

### Styling ✅

- Bootstrap 5.3.2 integration
- Custom CSS in `styles.css`
- Responsive design for mobile/tablet/desktop
- Consistent color scheme and typography
- Loading states and error messages
- Form validation styling

---

## 📋 Pending Features

### High Priority
- ⏳ Real-time messaging interface
- ⏳ Matching system UI
- ⏳ Application submission flow
- ⏳ File upload components
- ⏳ Email verification flow

### Medium Priority
- ⏳ Advanced project filters
- ⏳ Saved searches
- ⏳ Notification center
- ⏳ In-app messaging
- ⏳ Agreement signing interface

### Low Priority
- ⏳ Dark mode toggle
- ⏳ Accessibility improvements (WCAG AA)
- ⏳ Progressive Web App (PWA) features
- ⏳ Offline support
- ⏳ Analytics dashboard visualizations

---

## 🎨 Recent Enhancements

### December 2, 2025
- ✅ **Researcher Projects Integration**: Updated `ProjectsInvolved.jsx` to fetch real collaboration data
  - Replaced hardcoded placeholder content
  - Integrated with `/api/researchers/me/projects` endpoint
  - Added loading states and error handling
  - Dynamic tab counts based on actual data
  - Organization details display with tags
  - Budget and agreement information
  - Status badges for current vs completed projects

---

## 🧪 Development

### Available Scripts

```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Tips

1. **Hot Reload**: Vite provides instant hot module replacement
2. **API Proxy**: All `/api` requests automatically proxy to `http://localhost:4000`
3. **Component Testing**: Import and test components in isolation
4. **Auth Testing**: Use AuthContext in components for authentication state

### Environment Setup

Vite uses environment variables prefixed with `VITE_`:

```bash
# .env.local (optional)
VITE_API_URL=http://localhost:4000
```

---

## 📚 Additional Documentation

- **[../Documentation/ProjectStatus/IMPLEMENTATION_PROGRESS.md](../Documentation/ProjectStatus/IMPLEMENTATION_PROGRESS.md)** - Overall progress tracker
- **[../Documentation/FRONTEND_PROFILE_CREATION.md](../Documentation/FRONTEND_PROFILE_CREATION.md)** - Profile creation implementation
- **[../Documentation/PROFILE_CREATION_QUICK_START.md](../Documentation/PROFILE_CREATION_QUICK_START.md)** - User guide

---

## 🚀 Deployment

Recommended: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

See **[../Documentation/VERCEL_DEPLOYMENT_GUIDE.md](../Documentation/VERCEL_DEPLOYMENT_GUIDE.md)** for complete deployment instructions.
