# Disaster Management System MVP

A comprehensive disaster management platform for coordinating emergency response and resource allocation. Built with modern web technologies and following industry best practices.

## Features

- **Real-time Incident Reporting**: Report and track incidents with real-time updates
- **Resource Management**: Manage and allocate emergency resources (personnel, vehicles, equipment)
- **Role-based Access Control**: Different user roles (Admin, Coordinator, Responder, Reporter)
- **Authentication & Security**: Secure user authentication with Firebase Auth
- **Real-time Dashboard**: Live monitoring of active incidents and resource availability
- **Mobile-responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Testing**: Full test coverage with Jest and React Testing Library

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.5, Tailwind CSS 4
- **Backend**: Firebase Cloud Functions (Node.js 22), TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Real-time**: Firebase Firestore real-time listeners
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions with Firebase deployment

## Prerequisites

- Node.js 22 or higher
- Firebase CLI
- A Firebase project

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd disaster-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Cloud Functions
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login to Firebase: `firebase login`
5. Initialize Firebase: `firebase init`

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Development settings
NODE_ENV=development
NEXT_PUBLIC_USE_EMULATORS=true
```

### 5. Start Development Servers

```bash
# Start Next.js development server
npm run dev

# In another terminal, start Firebase emulators
npm run serve
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main dashboard page
│   ├── components/            # React components
│   │   ├── __tests__/         # Component tests
│   │   ├── ErrorBoundary.tsx  # Error boundary component
│   │   ├── IncidentForm.tsx   # Incident reporting form
│   │   ├── LoadingSpinner.tsx # Loading component
│   │   ├── LoginForm.tsx      # Authentication form
│   │   ├── ResourceManagement.tsx # Resource management
│   │   └── Toast.tsx          # Toast notifications
│   ├── contexts/              # React contexts
│   │   ├── __tests__/         # Context tests
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/                   # Utility libraries
│       ├── auth.ts            # Authentication service
│       ├── firebase.ts        # Firebase configuration
│       └── firestore.ts       # Firestore service
├── functions/                 # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts          # Cloud Functions entry point
│   └── package.json          # Functions dependencies
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
├── firebase.json             # Firebase configuration
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup file
└── package.json              # Main dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking

## User Roles

- **Admin**: Full system access, can manage all resources and incidents
- **Coordinator**: Can manage resources and coordinate responses
- **Responder**: Can view incidents and update response status
- **Reporter**: Can report new incidents and view basic information

## Security

- Firestore security rules enforce role-based access control
- Authentication required for all operations
- Input validation on both client and server
- Error boundaries prevent application crashes
- Secure Firebase configuration

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Context and service tests
- **E2E Tests**: Full application flow tests (with Playwright)

Run tests with:
```bash
npm test
```

## Deployment

### Firebase Hosting

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment-specific Deployments

- **Production**: Automatic deployment on merge to `main`
- **Preview**: Automatic preview deployments for pull requests
- **Staging**: Deployment from `develop` branch

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the coding standards
4. Write tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Coding Standards

- TypeScript for all new code
- ESLint configuration enforced
- Prettier for code formatting
- Meaningful variable and function names
- Comprehensive error handling
- Full test coverage for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.