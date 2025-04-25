<div align="center">
  <img src="./public/images/logos/eskore-logo.png" alt="eSkore Frontend" width="120">
  <h1>eSkore Frontend</h1>
  <p>Modern React application for eSports performance tracking and visualization</p>
  
  <p>
    <img src="https://img.shields.io/badge/react-v18.x-blue.svg" alt="React Version">
    <img src="https://img.shields.io/badge/node-v16.0.0+-green.svg" alt="Node Version">
    <img src="https://img.shields.io/badge/license-ISC-green" alt="License">
  </p>
  
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-components">Components</a> •
    <a href="#-routing">Routing</a> •
    <a href="#-state-management">State Management</a> •
    <a href="#-styling">Styling</a> •
    <a href="#-testing">Testing</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-troubleshooting">Troubleshooting</a>
  </p>
</div>

## 📋 Overview

The eSkore frontend provides a modern, responsive user interface for athletes, coaches, and administrators to track performance metrics, manage teams, and analyze match data. Built with React and modern web technologies, it offers an intuitive experience across devices.

<div align="center">
  <img src="./public/images/mockups/eskore-mockup.png" alt="eSkore Dashboard Preview" width="600">
</div>

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v16.0.0+ ([download](https://nodejs.org/))
- **npm** or **yarn**
- Backend API running (see [backend README](../backend/README.md))

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd eskore/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Access the application:** Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
frontend/
├── public/           # Static files
│   ├── images/       # Application images
│   └── index.html    # HTML template
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── routes/       # Routing configuration
│   ├── services/     # API service layer
│   ├── styles/       # Global styles
│   ├── utils/        # Helper functions
│   ├── App.js        # Main app component
│   └── index.js      # Application entry point
└── package.json      # Project dependencies
```

## ⚙️ Configuration

### Environment Variables

Create an `.env.local` file with these variables:

```properties
# API connection
REACT_APP_API_URL=http://localhost:5000/api

# Feature flags
REACT_APP_ENABLE_MOCK_API=false
REACT_APP_ENABLE_ANALYTICS=false

# Optional integrations
REACT_APP_GOOGLE_ANALYTICS_ID=
```

## 🧩 Components

eSkore uses a component-based architecture with several key component types:

### Core UI Components

Located in `src/components/ui/`, these are the building blocks of the interface:
- Buttons, inputs, cards, modals, etc.
- Form elements with validation
- Data display components

### Layout Components

Located in `src/components/layout/`, these manage the overall structure:
- Sidebar navigation
- Headers and footers
- Content wrappers

### Feature Components

Located in `src/components/features/`, these implement specific functionality:
- Stats displays
- Match history tables
- Performance charts

## 🧭 Routing

Routes are defined in `src/routes/AppRoutes.js` and use React Router v6. Key route types:

- **Public routes**: Accessible to all users
- **Protected routes**: Require authentication
- **Role-based routes**: Restricted by user role (athlete, coach, admin)

## 🧠 State Management

eSkore uses a combination of state management approaches:

- **React Context API**: For global state (auth, theme, etc.)
- **Local state**: For component-specific state
- **Custom hooks**: To encapsulate and share stateful logic

### Main Context Providers

- `AuthContext`: User authentication and permissions
- `ThemeContext`: UI theme preferences
- `ProfileContext`: User profile data and updates

## 🎨 Styling

The application uses a hybrid styling approach:

- **CSS Modules**: For component-specific styles
- **Global CSS**: For application-wide styles and variables
- **CSS-in-JS**: For dynamic, state-dependent styling

### Theme

Color variables, spacing, and typography are defined in `src/styles/variables.css` and follow a design system pattern for consistency.

## 🧪 Testing

The frontend uses Jest and React Testing Library for tests:

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Testing Strategy

- **Unit tests**: For utility functions and hooks
- **Component tests**: For UI components in isolation
- **Integration tests**: For component interactions
- **End-to-end tests**: For complete user flows

## 🌐 Deployment

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run serve
```

### Deployment Options

- **Static hosting**: Deploy the build folder to services like Netlify, Vercel, or GitHub Pages
- **Container deployment**: Use the included Dockerfile for containerized deployments
- **CDN integration**: Assets can be deployed to a CDN for improved performance

### Configuration for Production

Update `.env.production` with production values:

```properties
REACT_APP_API_URL=https://api.eskore.com/api
REACT_APP_ENABLE_ANALYTICS=true
```

## ❓ Troubleshooting

<details>
<summary><b>Common Issues</b></summary>

### Build Errors
- **Error**: "Module not found"
- **Solution**: Check import paths and ensure all dependencies are installed

### API Connection Issues
- **Error**: "Failed to fetch" or CORS errors
- **Solution**: Verify API URL in .env file and ensure backend is running

### Rendering Problems
- **Error**: White screen or component errors
- **Solution**: Check browser console for errors and verify component props
</details>

<details>
<summary><b>Development Tools</b></summary>

Helpful tools for debugging:

- **React Developer Tools**: Browser extension for React debugging
- **Redux DevTools**: If using Redux for state management
- **React Error Boundary**: Wrap components to catch and display errors gracefully
</details>

> 📑 **Need more help?** Check the project's main [troubleshooting guide](../TROUBLESHOOTING.md) or open an issue on GitHub.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Follow the style guidelines: `npm run lint`
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push your branch: `git push origin feature/amazing-feature`
8. Submit a pull request

### Style Guidelines

- Use functional components and hooks
- Follow the project's component structure
- Add appropriate comments for complex logic
- Write tests for new features

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">
  <p>© 2023 eSkore Team. All rights reserved.</p>
  <p>Made with ❤️ for the eSports community</p>
</div>
