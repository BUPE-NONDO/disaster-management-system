# Disaster Management System MVP

A comprehensive disaster management platform for coordinating emergency response and resource allocation.

## Features

- Real-time incident reporting and tracking
- Resource management and allocation
- Emergency response coordination
- Dashboard for monitoring active disasters
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)
- **CI/CD**: GitHub Actions

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development servers: `npm run dev`

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/           # Express.js API server
├── docs/             # Documentation
├── .github/          # GitHub Actions workflows
└── docker-compose.yml # Local development setup
```

## Deployment

- **Production**: Automatic deployment on merge to `main`
- **Preview**: Automatic preview deployments for pull requests
- **Staging**: Deployment from `develop` branch

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Create a pull request to `develop`
4. Preview deployment will be automatically created