<div align="center">
  <img src="./public/images/logos/eskore-logo.png" alt="eSkore Frontend" width="120">
  <h1>eSkore Frontend</h1>
  <p>Modern React application for esports performance analytics and team management</p>
  
  <p>
    <img src="https://img.shields.io/badge/react-v18.2.0-61DAFB.svg" alt="React Version">
    <img src="https://img.shields.io/badge/node-v16.0.0+-339933.svg" alt="Node Version">
    <img src="https://img.shields.io/badge/coverage-85%25-brightgreen.svg" alt="Test Coverage">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </p>
  
  <p>
    <a href="#-quick-setup">Quick Setup</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-core-components">Core Components</a> •
    <a href="#-routing">Routing</a> •
    <a href="#-state-management">State Management</a> •
    <a href="#-styling">Styling</a> •
    <a href="#-testing">Testing</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-troubleshooting">Troubleshooting</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

## 📋 Overview

The eSkore frontend delivers a responsive, intuitive user interface built with React 18 and modern web development practices. It provides athletes, coaches, and administrators with powerful tools to track performance metrics, manage teams, and analyze match data.

<div align="center">
  <img src="./public/images/mockups/eskore-mockup.png" alt="eSkore Dashboard Preview" width="700">
</div>

## 🚀 Quick Setup

### Prerequisites

- **Node.js**: v16.0.0 or later ([download](https://nodejs.org/))
- **npm** or **yarn**
- Backend API running (see [backend README](../backend/README.md))

### Installation

```bash
# Navigate to the frontend directory
cd eskore/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📚 Key Technologies

- **React 18**: Functional components with hooks
- **React Router 6**: For declarative routing
- **Axios**: For API requests with interceptors
- **Context API**: For global state management
- **CSS Modules**: For component-scoped styling
- **Jest/RTL**: For comprehensive testing

## 🏗️ Project Structure

```
frontend/
├── public/               # Static assets
│   ├── images/           # Application images
│   └── index.html        # HTML template
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Shared UI elements
│   │   ├── layout/       # Layout components
│   │   └── features/     # Feature-specific components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin pages
│   │   ├── auth/         # Authentication pages
│   │   └── user/         # User-facing pages
│   ├── routes/           # Routing configuration
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── utils/            # Helper functions
│   ├── App.js            # Main app component
│   └── index.js          # Application entry point
├── tests/                # Test files
├── .env.example          # Environment variable template
├── package.json          # Project dependencies
└── README.md             # This file
```

## ⚙️ Configuration

### Environment Variables

The frontend uses environment variables for configuration. Create an `.env.local` file with:

```properties
# API configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000

# Feature flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CHAT=false

# Optional integrations
REACT_APP_GOOGLE_ANALYTICS_ID=
```

Available environment configurations:
- `.env.development` - Development defaults
- `.env.test` - Testing environment
- `.env.production` - Production settings

### Feature Flags

The application uses feature flags to control feature availability:

```javascript
// Example feature flag usage
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function Component() {
  const chatEnabled = useFeatureFlag('ENABLE_CHAT');
  
  return (
    <div>
      {chatEnabled && <ChatComponent />}
    </div>
  );
}
```

## 🧩 Core Components

### Component Patterns

eSkore follows consistent component patterns:

1. **Functional components** with hooks
2. **Prop validation** with PropTypes
3. **Error boundaries** for robust error handling
4. **Lazy loading** for optimized performance

### Key Component Categories

- **UI Components**: Buttons, forms, cards, modals, etc.
- **Layout Components**: Page layouts, navigation, headers
- **Feature Components**: Team roster, match history, performance charts
- **Page Components**: Full pages composed of smaller components

### Example Component

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.css';

function StatCard({ title, value, icon, trend, onClick }) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
        {trend && (
          <span className={`stat-card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  trend: PropTypes.number,
  onClick: PropTypes.func
};

export default StatCard;
```

## 🧭 Routing

Routes are defined in `src/routes/AppRoutes.js` using React Router v6:

### Route Types

- **Public Routes**: Accessible without authentication
- **Protected Routes**: Require user authentication
- **Role-Based Routes**: Restricted by user role

### Example Route Configuration

```jsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected routes - User */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/teams/*" element={<TeamRoutes />} />
  </Route>
  
  {/* Protected routes - Admin */}
  <Route element={<AdminRoute />}>
    <Route path="/admin/*" element={<AdminRoutes />} />
  </Route>
  
  {/* Fallback */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

## 🧠 State Management

eSkore uses multiple state management approaches:

### React Context API

For global application state:

- `AuthContext`: User authentication state
- `TeamContext`: Current team information
- `NotificationContext`: User notifications
- `ThemeContext`: UI theme preferences

### Local Component State

For component-specific state using React's built-in `useState` and `useReducer` hooks.

### Custom Hooks

Reusable stateful logic extracted into custom hooks:

```jsx
// src/hooks/useMatchData.js
export function useMatchData(matchId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        const data = await apiClient.get(`/matches/${matchId}`);
        setMatch(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);
  
  return { match, loading, error };
}
```

## 🎨 Styling

The application uses a hybrid styling approach:

### CSS Modules

Component-specific styling with local scope:

```jsx
// Component.js
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>...</div>;
}
```

### Global Styles

Global variables and utilities in `src/styles/`:

- `variables.css`: Design tokens (colors, spacing, etc.)
- `typography.css`: Font styles
- `animations.css`: Shared animations
- `utilities.css`: Utility classes

### Responsive Design

All components are built with a mobile-first approach and responsive breakpoints:

```css
.container {
  padding: 1rem;
  
  /* Tablet and above */
  @media (min-width: 768px) {
    padding: 2rem;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    padding: 3rem;
  }
}
```

## 🔌 API Integration

### API Client

The application uses a centralized `apiClient` for all API requests:

```javascript
// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
  withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add any request manipulation here
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Modules

API calls are organized into service modules:

```javascript
// src/services/teamService.js
import apiClient from './apiClient';

export const teamService = {
  getTeams: () => apiClient.get('/teams'),
  getTeam: (id) => apiClient.get(`/teams/${id}`),
  createTeam: (data) => apiClient.post('/teams', data),
  updateTeam: (id, data) => apiClient.patch(`/teams/${id}`, data),
  deleteTeam: (id) => apiClient.delete(`/teams/${id}`),
  getTeamMembers: (id) => apiClient.get(`/teams/${id}/members`)
};
```

## 🧪 Testing

### Test Structure

Tests are organized in a structure that mirrors the source code:

```
tests/
├── components/        # Component tests
├── hooks/             # Custom hook tests
├── contexts/          # Context provider tests
├── utils/             # Utility function tests
└── integration/       # Integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Example

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
  });
  
  test('executes onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText(/click me/i));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('applies disabled styling when disabled', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText(/click me/i)).toHaveClass('disabled');
    expect(screen.getByText(/click me/i)).toBeDisabled();
  });
});
```

## 🏭 Building for Production

### Production Build

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npx serve -s build
```

The build output will be in the `build/` directory.

### Deployment-Ready Features

- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Minifies JS, CSS, and optimizes images
- **Service Worker**: Optional PWA support

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>API Connection Issues</strong></summary>

**Problem**: Cannot connect to the backend API
**Solutions**:
- Ensure the backend server is running
- Check that `REACT_APP_API_URL` is set correctly in `.env.local`
- Verify network connectivity and CORS settings
- Check browser console for specific error messages
</details>

<details>
<summary><strong>Build or Start Failures</strong></summary>

**Problem**: npm start or npm build fails
**Solutions**:
- Clear node_modules and reinstall dependencies:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Clear npm cache: `npm cache clean --force`
- Check for Node.js version compatibility
</details>

<details>
<summary><strong>Authentication Issues</strong></summary>

**Problem**: Sessions expire unexpectedly or login doesn't work
**Solutions**:
- Check that cookies are being set correctly (HttpOnly, Secure, SameSite)
- Verify that `withCredentials: true` is set in API requests
- Check for JWT expiration times in backend settings
</details>

### Developer Tools

Helpful browser extensions for debugging:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) (if using Redux)
- [Axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) (for accessibility testing)

### Getting Help

If you're still stuck:
1. Check the [project issues](https://github.com/your-org/eskore/issues) for similar problems
2. Review the [backend documentation](../backend/README.md) for API requirements
3. Reach out to the team on Discord or create a new issue

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../backend/CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Add tests for your changes
5. Run the test suite to ensure everything passes
6. Submit a PR with a clear description of your changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">
  <p>© 2025 eSkore Team. All rights reserved.</p>
  <p>Made with ❤️ for the global esports community</p>
</div>
