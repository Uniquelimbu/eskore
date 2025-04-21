# eSkore Feature Module Structure

This document outlines the standardized structure for feature modules in the eSkore application. Following this structure ensures consistency across the application and makes it easier for team members to navigate and contribute to different features.

## Standard Directory Structure

Each feature module should have the following structure:

```
src/features/feature-name/
├── api/                # Feature-specific API calls
│   └── index.js        # Exports all API functions
├── components/         # UI components for this feature
│   └── index.js        # Exports all components
├── context/            # Feature-specific context providers
│   └── index.js        # Exports all context providers
├── hooks/              # Feature-specific custom hooks
│   └── index.js        # Exports all hooks
├── pages/              # Page components for this feature
│   └── index.js        # Exports all pages
├── services/           # Feature-specific business logic services
│   └── index.js        # Exports all services
├── utils/              # Feature-specific utility functions
│   └── index.js        # Exports all utilities
└── index.js            # Main feature export file
```

## Feature Module Guidelines

1. **Feature Boundaries**: Each feature should be self-contained with minimal dependencies on other features.

2. **Naming Convention**:
   - React Components: PascalCase (e.g., `ProfileCard.js`)
   - Utility Functions: camelCase (e.g., `formatData.js`)
   - CSS/SCSS Files: kebab-case (e.g., `profile-card.css`)
   - Test Files: Same as the file they test with .test suffix (e.g., `ProfileCard.test.js`)

3. **Index Files**: Each subdirectory should have an index.js file that exports all relevant functionality. This makes imports cleaner from outside the feature.

4. **Main Feature Export**: The root index.js should export all public API of the feature in a clean, organized way.

## Example Usage

```javascript
// Good - Using named imports from the feature's main export
import { ProfilePage, useUserProfile, ProfileContext } from '../features/profile';

// Avoid - Direct imports from deep within the feature
import ProfilePage from '../features/profile/pages/ProfilePage';
import useUserProfile from '../features/profile/hooks/useUserProfile';
import { ProfileContext } from '../features/profile/context/ProfileContext';
```

## Component Organization

Components within a feature should be organized into logical folders:

```
src/features/feature-name/components/
├── forms/           # Form-related components
├── layout/          # Layout components specific to this feature
├── ui/              # Basic UI elements specific to this feature
└── data/            # Data display components
```

This structure ensures maintainability and scalability of each feature as the application grows.