<div align="center">
  <img src="../frontend/public/images/logos/eskore-logo.png" alt="eSkore Logo" width="120">
  <h1>Contributing to eSkore</h1>
  <p>Guidelines for contributing to the eSkore platform</p>
</div>

## 📋 Overview

Thank you for your interest in contributing to eSkore! We're excited to welcome you to our community. This document provides guidelines and workflows to make the contribution process smooth and effective for everyone involved.

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Environment](#-development-environment)
- [Development Workflow](#-development-workflow)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Testing Requirements](#-testing-requirements)
- [Documentation Guidelines](#-documentation-guidelines)
- [Community](#-community)

## 🤝 Code of Conduct

Our project adheres to a Code of Conduct that establishes expected behavior in our community. We expect all contributors to uphold this code. Please read [the full text](../CODE_OF_CONDUCT.md) to understand what actions will and will not be tolerated.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js (v16.0.0 or later)
- PostgreSQL (v14.0 or later)
- Git

### Fork and Clone

1. **Fork the repository** by clicking the Fork button on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/YOUR-USERNAME/eskore.git
   cd eskore/backend
   ```
3. **Add the upstream repository** to keep your fork synchronized
   ```bash
   git remote add upstream https://github.com/eskore-team/eskore.git
   ```
4. **Sync your fork** regularly
   ```bash
   git fetch upstream
   git merge upstream/main main
   ```

## 💻 Development Environment

### Setting Up

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Verify your setup**
   ```bash
   npm run verify
   # This ensures your environment is properly configured
   ```

### Running the Development Server

```bash
# Start the server with hot reloading
npm run dev

# Alternative: Start with additional debugging
DEBUG=eskore:* npm run dev
```

## 🔄 Development Workflow

1. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. **Make your changes**
   - Write code that follows our [coding standards](#-coding-standards)
   - Add or update tests for your changes
   - Ensure all tests pass locally

3. **Commit your changes** with clear, descriptive commit messages
   ```bash
   git add .
   git commit -m "feat(component): Add new feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** from your branch to the main repository's `main` branch

## 📥 Pull Request Process

1. **Use our pull request template** to provide all necessary information
2. **Link related issues** using GitHub keywords (e.g., "Closes #123")
3. **Ensure CI passes** - all tests, linting, and build processes must succeed
4. **Request a review** from one or more maintainers
5. **Address review feedback** promptly and thoroughly
6. **Wait for approval** before merging (maintainers will merge approved PRs)

### Pull Request Checklist

- [ ] Code follows established patterns and style guidelines
- [ ] Unit tests added/updated for new or modified functionality
- [ ] Documentation updated to reflect changes
- [ ] CI pipeline passes all checks
- [ ] No merge conflicts with the base branch
- [ ] Commit messages follow [conventional format](#commit-message-format)

## 📝 Coding Standards

We use ESLint and Prettier to enforce coding standards. Before submitting a PR, ensure:

```bash
# Run linting
npm run lint

# Run linting with automatic fixing
npm run lint:fix
```

### JavaScript Style Guidelines

- Use ES6+ features appropriately
- Prefer `const` over `let` where variables aren't reassigned
- Use async/await for asynchronous operations
- Use descriptive variable and function names
- Keep functions small and focused on a single responsibility
- Add JSDoc comments for functions and complex code blocks

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): Brief description

Longer description if needed
[optional body]

[optional footer(s)]
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc.
- `perf`: Performance improvements

Example:
```
feat(auth): Add password reset functionality

Implement password reset flow including:
- Reset request with email verification
- Token generation and validation
- Password update with new validation rules

Closes #45
```

## 🧪 Testing Requirements

We strive for high test coverage and quality. All contributions should:

- **Maintain or improve** the current test coverage
- **Include unit tests** for new functionality
- **Update existing tests** when modifying functionality

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific tests
npm test -- tests/unit/auth.test.js
```

### Testing Best Practices

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test API endpoints and database operations
- **Mock external services**: Use Jest mocks for external APIs
- **Test edge cases**: Include tests for error conditions and edge cases
- **Aim for >80% coverage**: New code should achieve at least 80% test coverage

## 📚 Documentation Guidelines

Clear documentation is crucial for our project. Please follow these guidelines:

- **Update API docs** for any endpoint changes
- **Add JSDoc comments** for public functions and classes
- **Keep README files updated** with new features or changes
- **Include examples** for API endpoints and complex functionality

### API Documentation Standards

- Include request/response examples
- Document all parameters and their types
- Specify authentication requirements
- Note any rate limiting or special considerations

## 👥 Community

- **Join our Discord server** for real-time discussion
- **Participate in discussions** on GitHub issues
- **Help review pull requests** from other contributors
- **Answer questions** from new contributors and users

## ✨ Recognition

All contributors will be recognized in our [CONTRIBUTORS.md](../CONTRIBUTORS.md) file. We appreciate your efforts to improve eSkore!

---

<div align="center">
  <p>Thank you for contributing to eSkore!</p>
  <p>© 2025 eSkore Team. All rights reserved.</p>
</div>
