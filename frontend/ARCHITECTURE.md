# eSkore Frontend Architecture

This document outlines the architecture and folder structure of the eSkore frontend application.

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
│   └── [feature-name]/ # Each feature follows standard structure (see FEATURE_TEMPLATE.md)
├── hooks/              # Shared custom React hooks
├── pages/              # Top-level page components
├── routes/             # Routing configuration
├── styles/             # Global styles
│   ├── animations.css  # Animation definitions
│   ├── global.css      # Global styles
│   └── variables.css   # CSS variables
├── theme/              # Theme-related code
│   ├── contexts/       # Theme context providers
│   ├── hooks/          # Theme-related hooks
│   ├── styles/         # Theme CSS files
│   └── utils/          # Theme utility functions
└── utils/              # Shared utility functions
```

## Key Architecture Principles

1. **Feature-Based Organization**: Core functionality is organized into feature modules, each containing its own components, state management, and business logic.

2. **Clean Imports**: Use index.js files in each directory to provide clean exports, allowing for simpler imports.

3. **Component Hierarchy**:
   - **Layout Components**: Define the overall structure of pages
   - **Feature Components**: Implement specific feature functionality
   - **Shared Components**: Reusable UI elements used across features

4. **Theme Management**: Centralized in the theme directory, with CSS variables and React context for consistency.

5. **State Management**: Uses React Context API for global state, with feature-specific state contained within feature modules.

## Naming Conventions

- **Components**: PascalCase (e.g., ButtonGroup.js)
- **Hooks**: camelCase, prefixed with "use" (e.g., useFormValidation.js)
- **CSS/SCSS Files**: kebab-case (e.g., button-group.css)
- **Utilities**: camelCase (e.g., formatCurrency.js)
- **Constants**: UPPER_SNAKE_CASE for values, PascalCase for objects

## Import Best Practices

```javascript
// Good - Using index exports
import { Button, Card } from 'components/ui';
import { useTheme } from 'theme';

// Avoid - Deep imports
import Button from 'components/ui/Button/Button';
import { useTheme } from 'theme/hooks/useTheme';
```

## Feature Template

See [FEATURE_TEMPLATE.md](src/features/FEATURE_TEMPLATE.md) for the standardized structure that each feature module should follow.