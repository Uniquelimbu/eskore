# Contributing to eSkore Backend

Thank you for your interest in contributing to the eSkore API! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to the Contributor Covenant code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR-USERNAME/eskore.git
   cd eskore/backend
   ```
3. **Add the upstream repository**
   ```bash
   git remote add upstream https://github.com/original-owner/eskore.git
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Create a branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Set up your development environment**:
   - Copy `.env.example` to `.env` and configure it for your local setup
   - Set up the database: `npm run db:migrate && npm run db:seed`
   - Start the development server: `npm run dev`

2. **Make your changes**:
   - Write code that follows the project's coding standards
   - Add or update tests for your changes
   - Add or update documentation as needed

3. **Test your changes**:
   - Run tests: `npm test`
   - Run linting: `npm run lint`
   - Ensure your code works with the frontend (if applicable)

4. **Commit your changes**:
   - Use clear and meaningful commit messages
   - Reference issue numbers in commit messages when applicable
   - Example: `git commit -m "Fix authentication timeout issue #42"`

5. **Stay updated with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Pull Request Process

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a pull request** from your branch to the main repository

3. **Describe your changes** in the PR:
   - Explain what changes you've made and why
   - Reference any related issues
   - Include screenshots or logs if relevant

4. **Address review feedback** if requested by maintainers

5. **Wait for approval** before merging

## Coding Standards

The project uses ESLint to enforce coding standards. Please ensure your code:

- Passes the linting checks: `npm run lint`
- Follows the established patterns in the codebase
- Uses meaningful variable and function names
- Includes comments for complex logic

### Commit Message Format

```
type(scope): Brief description

Longer description if needed
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding or refactoring tests
- `chore`: Updating build tasks, etc.

## Testing

- All new features should include tests
- Changes to existing features should update relevant tests
- Run the test suite before submitting a PR: `npm test`
- Aim for high test coverage

## Documentation

- Update API documentation for any endpoint changes
- If adding new endpoints, include them in the API docs
- Document complex logic or algorithms
- Update the README.md if necessary

---

Thank you for contributing to eSkore!
