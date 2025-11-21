#!/bin/bash

# Cognitive Canvas - Test Runner Script
# This script ensures the backend is running before executing tests

set -e

echo "🧪 Cognitive Canvas - Comprehensive Test Suite"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
echo "🔍 Checking if backend server is running..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server is not running${NC}"
    echo ""
    echo "Please start the backend server first:"
    echo "  cd backend && npm run dev"
    echo ""
    exit 1
fi

# Check environment variables
echo ""
echo "🔍 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env file not found${NC}"
    echo "Tests may fail without proper configuration"
else
    echo -e "${GREEN}✅ Environment file found${NC}"
fi

# Install test dependencies if needed
echo ""
echo "📦 Checking test dependencies..."
cd tests

if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Run tests
echo ""
echo "🚀 Running comprehensive test suite..."
echo "=============================================="
echo ""

npm test

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "=============================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
fi
echo "=============================================="

exit $TEST_EXIT_CODE
