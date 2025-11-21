# Cognitive Canvas - Comprehensive Test Suite

This directory contains a complete test suite that validates all features and functionality described in the EXTENDED_SUMMARY.md.

## 📋 Test Coverage

The test suite covers **10 major areas**:

1. **Authentication System** - User registration, login, JWT tokens, bcrypt hashing
2. **Journal Entry Management** - CRUD operations, search, filtering, pagination
3. **AI-Powered Analysis** - Claude integration, emotion detection, cognitive distortions, themes
4. **Canvas Visualization** - Graph generation, nodes, edges, filtering
5. **Emotional Weather Map** - Volatility calculation, transitions, baselines
6. **Guided Root Cause Analysis** - Socratic questioning, conversation flow, completion detection
7. **Security Features** - Helmet, CORS, rate limiting, input sanitization
8. **Performance & Caching** - Connection pooling, response times, database indexes
9. **Error Handling** - 404s, validation errors, graceful failures
10. **Integration Tests** - End-to-end workflows, data consistency

## 🚀 Quick Start

### Prerequisites

1. **Backend server must be running** on `http://localhost:5000`
2. **Database must be accessible** (PostgreSQL)
3. **Environment variables configured** in `backend/.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`

### Running Tests

```bash
# From the tests directory
cd tests

# Install dependencies
npm install

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Running from Root Directory

```bash
# From project root
npm run test
```

## 📊 Test Results

Each test suite will output results showing:
- ✅ Passed tests
- ❌ Failed tests
- ⏱️ Execution time
- 📈 Coverage metrics (if using coverage mode)

## 🧪 Test Structure

```
comprehensive-test-suite.test.ts (main test file)
├── Setup & Teardown (authentication, cleanup)
├── 1. Authentication System (8 tests)
├── 2. Journal Entry Management (10 tests)
├── 3. AI-Powered Analysis (10 tests)
├── 4. Canvas Visualization (10 tests)
├── 5. Emotional Weather Map (5 tests)
├── 6. Guided Root Cause Analysis (10 tests)
├── 7. Security Features (6 tests)
├── 8. Performance & Caching (3 tests)
├── 9. Error Handling (5 tests)
└── 10. Integration Tests (3 tests)

Total: ~70 tests
```

## 🔧 Configuration

### vitest.config.ts
- Test timeout: 30 seconds
- Environment: Node
- Uses setup file for environment configuration

### setup.ts
- Loads environment variables
- Verifies required configuration
- Sets test environment mode

## 📝 Important Notes

1. **Tests are NOT fully isolated** - They run sequentially and share authentication state
2. **Real API calls** - Tests hit actual Claude API (consumes API credits)
3. **Database modifications** - Creates and deletes test data in your database
4. **Rate limiting** - Some tests intentionally trigger rate limits
5. **Cleanup** - All test data is cleaned up after suite completion

## 🐛 Troubleshooting

### Backend not running
```
Error: connect ECONNREFUSED 127.0.0.1:5000
Solution: Start backend with `cd backend && npm run dev`
```

### Database connection error
```
Error: Can't reach database server
Solution: Check DATABASE_URL in backend/.env
```

### Claude API errors
```
Error: 401 Unauthorized
Solution: Verify ANTHROPIC_API_KEY in backend/.env
```

### Rate limit exceeded
```
Error: 429 Too Many Requests
Solution: Wait 15 minutes or increase rate limit in backend
```

## 📈 Expected Results

With a fully functional application, you should see:
- **~70 tests passing**
- **0 tests failing**
- **Execution time: 30-60 seconds** (depends on Claude API response times)

## 🎯 CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd backend && npm run dev &
    sleep 5
    cd tests && npm install && npm test
```

## 🔐 Security Considerations

- Test user credentials are hardcoded (only for testing)
- Tests create real database entries (cleaned up after)
- Claude API key is used (tracks to your account)
- Consider using a separate test database

## 📚 Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Last Updated**: November 21, 2025  
**Test Suite Version**: 1.0.0
