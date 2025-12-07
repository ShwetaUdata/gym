#!/bin/bash

# PowerFit Gym - Next.js Migration Setup Script

echo "🏋️ PowerFit Gym - Next.js Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Create directories
echo "📁 Creating project structure..."
mkdir -p nextjs-app/app/api/{clients,payments,emails/send,admin/{login,logout},scheduled/birthday}
mkdir -p nextjs-app/{lib,components/gym,components/ui,context,hooks,utils,types,styles}
mkdir -p nextjs-app/scripts

echo "✓ Directories created"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd nextjs-app
npm install
cd ..

echo "✓ Dependencies installed"
echo ""

# Create .env.local
echo "🔐 Creating environment file..."
cat > nextjs-app/.env.local << 'EOF'
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Cron Secret
CRON_SECRET=your-secret-key

# Database
DATABASE_URL=./gym.db

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✓ Environment file created (.env.local)"
echo ""

# Summary
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your credentials"
echo "2. Copy components from src/components to nextjs-app/components"
echo "3. Copy context from src/context to nextjs-app/context"
echo "4. Copy utilities from src/utils to nextjs-app/utils"
echo "5. Create pages in nextjs-app/app/"
echo ""
echo "🚀 To start development:"
echo "   cd nextjs-app"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - NEXTJS_MIGRATION_GUIDE.md - Complete migration guide"
echo "   - NEXTJS_PAGES_GUIDE.md - Pages implementation guide"
echo ""
