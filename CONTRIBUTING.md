# Contributing to Disaster Management System

Thank you for your interest in contributing to the Disaster Management System! This document provides guidelines and information for contributors.

## Development Workflow

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/disaster-management-system.git
   cd disaster-management-system
   ```

2. **Setup Development Environment**
   ```bash
   ./scripts/setup.sh
   ```

3. **Start Development Servers**
   ```bash
   npm run dev
   ```

### Branch Strategy

- `main` - Production branch (protected)
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Making Changes

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards below
   - Write tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add incident reporting feature"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Target the `develop` branch
   - Fill out the PR template
   - Wait for review and CI checks

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.1)
- Use semantic HTML elements

### API Development

- Follow RESTful conventions
- Validate all inputs with Zod schemas
- Include proper error handling
- Add comprehensive logging

### Database

- Use Prisma for database operations
- Write migrations for schema changes
- Include proper indexes for performance
- Follow naming conventions

## Testing Guidelines

### Frontend Testing

- Write unit tests for components
- Use React Testing Library
- Test user interactions and accessibility
- Aim for 80%+ code coverage

### Backend Testing

- Write unit tests for API endpoints
- Test validation and error cases
- Mock external dependencies
- Include integration tests

### End-to-End Testing

- Test critical user flows
- Use Playwright or Cypress
- Run tests in CI pipeline
- Test across different browsers

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Keep README files updated

### API Documentation

- Document all endpoints
- Include request/response examples
- Specify error codes and messages
- Use OpenAPI/Swagger when possible

## Performance Guidelines

### Frontend Performance

- Optimize bundle size
- Use lazy loading for routes
- Implement proper caching
- Monitor Core Web Vitals

### Backend Performance

- Optimize database queries
- Implement proper caching
- Use connection pooling
- Monitor response times

## Security Guidelines

### Input Validation

- Validate all user inputs
- Sanitize data before storage
- Use parameterized queries
- Implement rate limiting

### Authentication & Authorization

- Use secure session management
- Implement proper RBAC
- Validate permissions on all endpoints
- Use HTTPS in production

## Deployment

### Preview Deployments

- Every PR gets a preview deployment
- Test features in preview environment
- Share preview URLs for stakeholder review

### Production Deployment

- Only deploy from `main` branch
- Run full test suite before deployment
- Monitor deployment for issues
- Have rollback plan ready

## Issue Reporting

### Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if applicable

### Feature Requests

Include:
- Problem statement
- Proposed solution
- User stories
- Acceptance criteria

## Code Review Process

### For Reviewers

- Check code quality and standards
- Verify tests are included
- Test functionality locally
- Provide constructive feedback

### For Authors

- Respond to feedback promptly
- Make requested changes
- Update tests and documentation
- Ensure CI passes

## Release Process

### Version Numbering

Follow Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Notes

Include:
- New features
- Bug fixes
- Breaking changes
- Migration instructions

## Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Join our community chat
- Contact maintainers directly

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to making disaster response more effective! 🚀