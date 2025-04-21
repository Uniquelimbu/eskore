# eSkore Frontend

Welcome to the eSkore frontend application! This React-based web application provides a user interface for the eSkore sports scoring and management platform.

## Project Overview

eSkore is a comprehensive platform for managing sports leagues, teams, and athletes. The frontend application includes:

- Authentication and role-based access control
- Athlete dashboard for performance tracking
- Manager dashboard for team management
- Team profile pages
- League standings and match results
- Profile management

## Project Structure

```
src/
├── api/                # Global API services and utilities
├── assets/             # Static assets (images, fonts, etc.)
├── components/         # Shared UI components
│   ├── data/           # Data display components (tables, lists)
│   ├── feedback/       # Feedback components (alerts, loaders)
│   ├── form/           # Form-related components (inputs, selects)
│   ├── layout/         # Layout components (header, footer)
│   └── ui/             # Basic UI elements (buttons, cards)
├── constants/          # Application constants
├── context/            # Global application context providers
├── features/           # Feature-based modules
│   └── [feature-name]/ # Each feature follows standard structure
│       ├── api/        # Feature-specific API calls
│       ├── components/ # UI components for this feature
│       ├── context/    # Feature-specific context providers
│       ├── hooks/      # Feature-specific custom hooks
│       ├── pages/      # Page components for this feature
│       ├── utils/      # Feature-specific utility functions
│       └── index.js    # Main feature export file
├── hooks/              # Shared custom React hooks
├── pages/              # Top-level page components
├── routes/             # Routing configuration
├── styles/             # Global styles
├── theme/              # Theme-related code
│   ├── contexts/       # Theme context providers
│   ├── hooks/          # Theme-related hooks
│   ├── styles/         # Theme CSS files
│   └── utils/          # Theme utility functions
└── utils/              # Shared utility functions
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the project architecture and [FEATURE_TEMPLATE.md](./src/features/FEATURE_TEMPLATE.md) for guidelines on creating new features.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Features

### Authentication

The application includes a comprehensive authentication system with:
- Login with email/password
- Role-based access control (athlete, manager, team) 
- Protected routes

### Athlete Dashboard

Athletes can:
- View performance metrics
- Track match history
- Manage team affiliations
- Update profile information

### Manager Dashboard

Team managers can:
- Manage team rosters
- Schedule matches
- View team performance

## Contributing

Please read our [contribution guidelines](./CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
