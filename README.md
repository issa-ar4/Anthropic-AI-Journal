# Cognitive Canvas 🧠✨

> An AI-powered journaling tool that transforms your daily reflections into an interactive, visual model of your mind, helping you reason about your emotional patterns and build a more intentional life.

## 🎯 Overview

**Cognitive Canvas** is a production-ready full-stack application that combines journaling with AI-powered cognitive analysis and interactive visualization. By leveraging the Claude API, it analyzes your journal entries to identify emotions, cognitive patterns, and distortions, then visualizes them in an interactive D3.js force-directed graph. This helps you navigate your internal world with clarity and intention.

**Status**: ✅ Production Ready | **Version**: 1.0.0

## 🌟 Key Features

- **Cognitive Pattern Recognition**: Identifies cognitive distortions and recurring thought patterns
- **Causal Chain Inference**: Maps connections between triggers, thoughts, emotions, and actions
- **Interactive Visual Model**: Dynamic graph visualization of your mental landscape
- **Private & Ethical**: Your data, your control—AI as a supportive guide, not a judge
- **Actionable Insights**: Empowers you to understand and change behavioral patterns

## ✨ Key Features

### 🔐 Phase 1: Foundation (Complete)
- User authentication with JWT
- Journal entry CRUD operations
- PostgreSQL database with Prisma ORM
- Clean, responsive UI with Tailwind CSS

### 🤖 Phase 2: AI Analysis Engine (Complete)
- Claude 3.5 Sonnet integration
- Emotion detection and tracking
- Cognitive pattern recognition
- Distortion identification (catastrophizing, black-and-white thinking, etc.)
- Theme extraction across entries
- Analysis caching (1-hour TTL)
- Insights dashboard

### 🎨 Phase 3: Interactive Canvas (Complete)
- D3.js force-directed graph visualization
- Node types: entries, emotions, themes, patterns
- Interactive features: drag, zoom, pan, click
- Timeline view for chronological exploration
- Filtering by type, date range, search
- Custom layouts with database persistence
- Node detail panels

### 🚀 Phase 4: Production Polish (Complete)
- Error boundaries and toast notifications
- Loading skeletons and empty states
- Performance optimization hooks (debounce, throttle)
- Mobile responsive with hamburger menu
- Security hardening (rate limiting, CORS, Helmet, sanitization)
- Docker support with multi-stage builds
- Production configs for 5 platforms
- Form validation and input sanitization

*For detailed phase information, see [docs/PHASES.md](docs/PHASES.md)*

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Visualization**: D3.js v7 for force-directed graphs
- **UI Library**: Tailwind CSS + custom components
- **State Management**: Zustand
- **Build Tool**: Vite
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **AI Integration**: Anthropic Claude API (3.5 Sonnet)
- **Security**: Helmet, express-rate-limit, CORS

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Web Server**: Nginx (for frontend)
- **Orchestration**: Docker Compose
- **Deployment**: Railway, Vercel, AWS, DigitalOcean
- **Version Control**: Git + GitHub

## 📁 Project Structure

```
cognitive-canvas/
├── docs/                       # Documentation and planning
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-specific modules
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and helpers
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   └── types/             # TypeScript definitions
│   └── public/                # Static assets
├── backend/                    # Server application
│   ├── src/
│   │   ├── api/               # API routes
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Express middleware
│   │   └── utils/             # Helper functions
│   └── prisma/                # Database schema and migrations
├── shared/                     # Shared code between frontend/backend
├── tests/                      # End-to-end tests
└── scripts/                    # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Docker (optional, for containerized deployment)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/cognitive-canvas.git
cd cognitive-canvas

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key

# 3. Install dependencies and set up database
cd backend
npm install
npx prisma migrate dev
npx prisma generate

cd ../frontend
npm install

# 4. Start the development servers
# Terminal 1 - Backend (from backend/)
npm run dev

# Terminal 2 - Frontend (from frontend/)
npm run dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cognitive_canvas"
JWT_SECRET="your-super-secret-jwt-key-change-this"
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:3000
```

### Docker Deployment (Easiest)

```bash
# 1. Configure environment
cp .env.docker.example .env
# Edit .env with your Anthropic API key

# 2. Start all services
docker-compose up -d

# 3. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 4. Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:3000
```

### Production Deployment

For production deployment guides (Railway, Vercel, AWS, DigitalOcean), see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🎨 How It Works

1. **Journal**: Write your daily reflections in a clean, distraction-free interface
2. **Analyze**: Claude processes your entry, identifying emotions, patterns, and cognitive distortions
3. **Visualize**: Your "Cognitive Canvas" updates with new nodes and connections in an interactive D3.js graph
4. **Explore**: Navigate your mental landscape, discovering insights about yourself through visual connections
5. **Grow**: Use these insights to build more intentional habits and thought patterns

## 🏆 Innovation Highlights

### Beyond a Chatbot
- Transforms unstructured text into structured cognitive models
- Persistent, evolving visualization of mental patterns
- Not just recording thoughts—actively mapping them

### Creative Claude API Usage
- **Pattern Recognition**: Identifies cognitive distortions (catastrophizing, black-and-white thinking)
- **Causal Inference**: Proposes connections between triggers, emotions, and actions
- **Visual Model Generation**: Analysis drives interactive graph visualization

### Human-Centered Design
- Addresses the universal struggle of self-understanding
- Provides actionable clarity for emotional regulation
- Private, non-judgmental, user-controlled experience

## 📊 Success Metrics

- User engagement: Average entries per Day
- Pattern discovery: Number of insights generated
- User satisfaction: Self-reported improvements in self-awareness
- Technical performance: Response time, accuracy of pattern detection

## 📚 Documentation

- **[README.md](README.md)** - This file (overview and setup)
- **[docs/PHASES.md](docs/PHASES.md)** - Detailed phase breakdown and implementation
- **[docs/ROADMAP.md](docs/ROADMAP.md)** - Current status and next steps
- **[docs/FUTURE.md](docs/FUTURE.md)** - Future enhancements and ideas
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guides

## 🤝 Contributing

This project was developed for the Anthropic Claude API Hackathon. See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.

## 📜 License

MIT License - See LICENSE file for details

## 🔒 Privacy & Ethics

- All data is encrypted at rest and in transit
- Users have complete control over their data
- AI serves as a supportive guide, not a diagnostic tool
- No data sharing with third parties
- Right to export and delete all personal data

## 📧 Contact

For questions or feedback, please open an issue or contact issa.alrawwash@mail.utoronto.ca.

---

*Cognitive Canvas: Making your inner world more navigable, one entry at a time.*
# Anthropic-AI-Journal
