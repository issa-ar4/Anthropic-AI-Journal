@echo off
REM Cognitive Canvas - Test Runner Script (Windows)
REM This script ensures the backend is running before executing tests

echo.
echo 🧪 Cognitive Canvas - Comprehensive Test Suite
echo ==============================================
echo.

REM Check if backend is running
echo 🔍 Checking if backend server is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running
) else (
    echo ❌ Backend server is not running
    echo.
    echo Please start the backend server first:
    echo   cd backend ^&^& npm run dev
    echo.
    exit /b 1
)

REM Check environment variables
echo.
echo 🔍 Checking environment configuration...
if not exist "backend\.env" (
    echo ⚠️  Warning: backend\.env file not found
    echo Tests may fail without proper configuration
) else (
    echo ✅ Environment file found
)

REM Install test dependencies if needed
echo.
echo 📦 Checking test dependencies...
cd tests

if not exist "node_modules" (
    echo Installing test dependencies...
    call npm install
) else (
    echo ✅ Dependencies already installed
)

REM Run tests
echo.
echo 🚀 Running comprehensive test suite...
echo ==============================================
echo.

call npm test

REM Capture exit code
set TEST_EXIT_CODE=%errorlevel%

echo.
echo ==============================================
if %TEST_EXIT_CODE% equ 0 (
    echo ✅ All tests passed!
) else (
    echo ❌ Some tests failed
)
echo ==============================================

exit /b %TEST_EXIT_CODE%
