#!/bin/bash

echo "🚀 Setting up Cognitive Canvas..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL or ensure it's in your PATH."
else
    echo "✅ PostgreSQL found"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your:"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET (run: openssl rand -base64 32)"
    echo ""
fi

echo "📚 Next steps:"
echo ""
echo "1. Edit .env file with your credentials"
echo "2. Create database: createdb cognitive_canvas"
echo "3. Run migrations: cd backend && npx prisma migrate dev"
echo "4. Start development: npm run dev"
echo ""
echo "🎉 Setup complete! Happy coding!"
