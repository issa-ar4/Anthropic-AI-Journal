# Cognitive Canvas 🧠✨

> An AI-powered journaling platform that transforms your daily reflections into an interactive visual model of your mind, helping you understand emotional patterns and build more intentional habits.

## Overview

Cognitive Canvas is a production-ready full-stack application that combines journaling with AI-powered cognitive analysis and interactive visualization. Using Claude API, it analyzes journal entries to identify emotions, cognitive patterns, and distortions, then visualizes them in an interactive D3.js force-directed graph. The platform includes guided root cause analysis sessions that use Socratic questioning to help users discover the underlying drivers of their emotions.

**Status**: ✅ Production Ready | **Version**: 1.0.0

## Core Features

**AI-Powered Analysis**: Claude 3.5 Sonnet identifies emotions, cognitive distortions (catastrophizing, black-and-white thinking), recurring themes, and causal chains between triggers, thoughts, and actions.

**Interactive Visualization**: D3.js force-directed graph lets you explore your mental landscape through draggable nodes, zoom/pan controls, and interactive filtering by type, date, or search query.

**Guided Root Cause Analysis**: Conversational AI sessions using the "5 Whys" technique and Socratic questioning to trace surface emotions back to their fundamental causes.

**Emotional Weather Map**: Volatility analysis showing which emotions swing most unpredictably, transition patterns revealing how emotions cascade, and baseline comparisons tracking improvement over time.

**Privacy-First**: Your data stays yours with local storage options, no third-party tracking, and optional self-hosted deployment.

## Technology Stack

**Frontend**: React 18 + TypeScript, D3.js v7, Tailwind CSS, Zustand, Vite  
**Backend**: Node.js + Express, PostgreSQL + Prisma ORM, JWT authentication, Claude API  
**DevOps**: Docker, Nginx, Docker Compose, deployment-ready for Railway/Vercel/AWS/DigitalOcean

## Quick Start

### Prerequisites
- Node.js 18+, PostgreSQL 14+, Anthropic API key ([get one here](https://console.anthropic.com/))

### Local Development
```bash
# 1. Clone and navigate
git clone https://github.com/yourusername/cognitive-canvas.git
cd cognitive-canvas

# 2. Backend setup
cd backend
npm install
# Create .env with DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npx prisma migrate deploy
npx prisma generate
npm run dev

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000
npm run dev

# Access at http://localhost:3000 (frontend) and http://localhost:5000 (API)
```

### Docker Deployment
```bash
# 1. Configure environment
cp .env.docker.example .env
# Edit .env with your Anthropic API key

# 2. Start services
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy

# Access at http://localhost
```

## Project Structure

```
cognitive-canvas/
├── frontend/          # React + TypeScript UI
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route pages
│   └── services/     # API clients
├── backend/          # Express API
│   ├── api/          # Routes and controllers
│   ├── services/     # Claude integration, canvas logic
│   └── prisma/       # Database schema
└── docs/             # Extended documentation
```

## How It Works

1. **Journal**: Write reflections in a distraction-free interface
2. **Analyze**: Claude identifies emotions, patterns, and cognitive distortions
3. **Visualize**: Interactive graph updates with nodes and connections
4. **Explore**: Navigate your mental landscape through visual relationships
5. **Discover**: Use guided sessions to trace emotions to root causes
6. **Grow**: Apply insights to build intentional thought patterns

## Key Innovation

Unlike typical journaling apps or chatbots, Cognitive Canvas creates a persistent, evolving visualization of your cognitive model. Each entry adds context to your mental landscape, revealing patterns invisible in isolated entries. The Emotional Weather Map shows volatility and transitions—not just what you felt, but how chaotically and in what sequences.

## Testing

A comprehensive test suite covering all features is available in the `tests/` directory.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

See [tests/README.md](./tests/README.md) for detailed testing documentation.

## Documentation

For detailed technical documentation, architecture diagrams, deployment guides, API references, and development workflows, see [EXTENDED_SUMMARY.md](./EXTENDED_SUMMARY.md).

## License

MIT License - See LICENSE file for details.

## Contributing

We welcome contributions! This is a personal project open to community improvements. Check EXTENDED_SUMMARY.md for architecture details before contributing.
