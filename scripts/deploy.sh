#!/bin/bash

# 🚀 Rise for Texas Deployment Script
# This script helps prepare your app for production deployment

echo "🚀 Preparing Rise for Texas for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Make sure to set environment variables in your hosting platform:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
    echo "✅ .env.local found"
fi

# Install dependencies with legacy peer deps to handle React 19 conflicts
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Run type check
echo "🔍 Running type check..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Your app is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Deploy to your chosen platform (Vercel, Netlify, etc.)"
    echo "2. Set environment variables in your hosting platform"
    echo "3. Run the Supabase schema in your dashboard"
    echo "4. Test your live application"
    echo ""
    echo "📚 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed! Please fix the errors above before deploying."
    exit 1
fi
