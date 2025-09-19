# Deployment Guide

## Overview

This project uses a modern CI/CD pipeline with preview deployments for pull requests and automatic deployments to staging and production environments.

## Architecture

- **Frontend**: Next.js deployed on Vercel
- **Backend**: Node.js/Express deployed on Railway or Render
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions

## Deployment Environments

### 1. Preview Deployments
- Triggered on every pull request
- Automatic deployment to Vercel preview URL
- Comment added to PR with preview link
- Perfect for testing features before merge

### 2. Staging Environment
- Deployed from `develop` branch
- URL: `staging-disaster-mgmt.vercel.app`
- Used for integration testing and stakeholder review

### 3. Production Environment
- Deployed from `main` branch
- Production URL configured in Vercel
- Automatic deployment on merge to main

## Setup Instructions

### 1. Create GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/disaster-management-system.git
git branch -M main
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

### 2. Set up Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Configure GitHub Secrets

Add these secrets in your GitHub repository settings:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

To get these values:
- **VERCEL_TOKEN**: Generate in Vercel Dashboard → Settings → Tokens
- **VERCEL_ORG_ID**: Found in Vercel project settings
- **VERCEL_PROJECT_ID**: Found in Vercel project settings

### 4. Backend Deployment (Railway)

1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend service:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=your_vercel_url
   ```

### 5. Database Setup

Railway provides PostgreSQL addon:
1. Add PostgreSQL service to your Railway project
2. Copy the DATABASE_URL to your backend environment variables

## Workflow

### Feature Development
1. Create feature branch from `develop`
2. Make changes and push
3. Create pull request to `develop`
4. Preview deployment automatically created
5. Review and test using preview URL
6. Merge to `develop` for staging deployment

### Production Release
1. Create pull request from `develop` to `main`
2. Review staging environment
3. Merge to `main` for production deployment

## Branch Strategy

```
main (production)
├── develop (staging)
    ├── feature/incident-reporting
    ├── feature/resource-management
    └── hotfix/critical-bug-fix
```

## Monitoring

- **Frontend**: Vercel Analytics and Web Vitals
- **Backend**: Winston logging with file and console outputs
- **Database**: Railway metrics dashboard
- **Uptime**: Consider adding UptimeRobot or similar

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_MAPS_API_KEY=your_maps_api_key
```

### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_super_secure_secret
FRONTEND_URL=https://your-app.vercel.app
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Deployment Issues**
   - Verify environment variables are set
   - Check build logs in Vercel/Railway dashboard
   - Ensure database connection is working

3. **Preview Deployments Not Working**
   - Verify GitHub secrets are set correctly
   - Check GitHub Actions logs
   - Ensure Vercel integration is properly configured

### Getting Help

- Check GitHub Actions logs for CI/CD issues
- Review Vercel deployment logs
- Check Railway service logs for backend issues
- Verify environment variables in all platforms