#!/bin/bash

echo "🚀 Setting up Disaster Management System with Firebase..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install Firebase CLI globally if not installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI $(firebase --version) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions && npm install && cd ..

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local file with your Firebase configuration"
fi

# Initialize Firebase project
echo "🔥 Initializing Firebase project..."
echo "Please run 'firebase login' and 'firebase init' to set up your Firebase project"
echo "Select the following features:"
echo "- Firestore"
echo "- Functions"
echo "- Hosting"
echo "- Emulators"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'firebase login' to authenticate"
echo "2. Run 'firebase init' to initialize your Firebase project"
echo "3. Update .env.local with your Firebase configuration"
echo "4. Start development: npm run dev"
echo "5. Start Firebase emulators: npm run firebase:emulators"
echo "6. Configure GitHub secrets for CI/CD"
echo ""
echo "GitHub Secrets needed:"
echo "- FIREBASE_TOKEN (get with 'firebase login:ci')"
echo "- NEXT_PUBLIC_FIREBASE_API_KEY"
echo "- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "- NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "- NEXT_PUBLIC_FIREBASE_APP_ID"