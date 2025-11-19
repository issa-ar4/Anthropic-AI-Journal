# 🏗️ System Architecture - Root Cause Analysis

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  RootCauseSessionPage.tsx                                     │  │
│  │  ┌───────────────┐  ┌──────────────────────────────────────┐ │  │
│  │  │   Sidebar     │  │    ChatInterface Component            │ │  │
│  │  │               │  │  ┌─────────────────────────────────┐  │ │  │
│  │  │ - New Session │  │  │  Messages (User/AI bubbles)     │  │ │  │
│  │  │ - History     │  │  │  - Auto-scroll                  │  │ │  │
│  │  │ - Status      │  │  │  - Loading state                │  │ │  │
│  │  │ - Visualize   │  │  └─────────────────────────────────┘  │ │  │
│  │  │               │  │  ┌─────────────────────────────────┐  │ │  │
│  │  └───────────────┘  │  │  Input Area                     │  │ │  │
│  │                     │  │  - Textarea + Send button       │  │ │  │
│  │                     │  │  - Enter to send                │  │ │  │
│  │                     │  └─────────────────────────────────┘  │ │  │
│  │                     └──────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND SERVICE LAYER                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  sessionService.ts                                            │  │
│  │  - create(initialEmotion)                                     │  │
│  │  - continue(sessionId, userMessage)                           │  │
│  │  - getAll() / getById(id) / delete(id)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND API LAYER                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  session.routes.ts                                            │  │
│  │  POST   /api/sessions              → createSession            │  │
│  │  POST   /api/sessions/:id/continue → continueSession          │  │
│  │  GET    /api/sessions              → getSessions              │  │
│  │  GET    /api/sessions/:id          → getSession               │  │
│  │  DELETE /api/sessions/:id          → deleteSession            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                    │                                 │
│                                    ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  sessionController.ts                                         │  │
│  │  - Creates/updates Session records                            │  │
│  │  - Manages conversation state                                 │  │
│  │  - Calls ClaudeService for AI responses                       │  │
│  │  - Detects completion & extracts root cause                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│     CLAUDE SERVICE              │  │     DATABASE (PostgreSQL)       │
│  ┌───────────────────────────┐  │  │  ┌───────────────────────────┐  │
│  │ conductGuidedAnalysis()   │  │  │  │  Session Table            │  │
│  │                           │  │  │  │  - id (cuid)              │  │
│  │ System Prompt:            │  │  │  │  - userId (FK)            │  │
│  │ • 5 Whys technique        │  │  │  │  - status                 │  │
│  │ • Socratic questioning    │  │  │  │  - initialEmotion         │  │
│  │ • One question at a time  │  │  │  │  - rootCause              │  │
│  │ • Empathetic approach     │  │  │  │  - turnCount              │  │
│  │ • Root cause synthesis    │  │  │  │  - messages (JSON)        │  │
│  │                           │  │  │  │  - metadata (JSON)        │  │
│  │ Completion Detection:     │  │  │  │  - timestamps             │  │
│  │ • "ROOT CAUSE IDENTIFIED" │  │  │  └───────────────────────────┘  │
│  │ • Turn count >= 5         │  │  │                                 │
│  └───────────────────────────┘  │  └─────────────────────────────────┘
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │ Anthropic API             │  │
│  │ Claude 3.5 Sonnet         │  │
│  │ Model: claude-3-5-sonnet  │  │
│  │        -20241022          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────┐
│  USER    │
└────┬─────┘
     │
     │ 1. "I feel anxious about work"
     ▼
┌─────────────────────┐
│  ChatInterface      │
└─────────┬───────────┘
          │
          │ 2. sessionService.create(initialEmotion)
          ▼
┌─────────────────────────────┐
│  POST /api/sessions         │
│  sessionController          │
└───────────┬─────────────────┘
            │
            │ 3. Create Session record
            ▼
┌─────────────────────────────┐
│  Database: sessions table   │
│  {                          │
│    id: "abc123"             │
│    userId: "user456"        │
│    status: "active"         │
│    initialEmotion: "anxious"│
│    turnCount: 0             │
│    messages: []             │
│  }                          │
└───────────┬─────────────────┘
            │
            │ 4. Call Claude for first question
            ▼
┌─────────────────────────────────────────────────────┐
│  claudeService.conductGuidedAnalysis()              │
│  Input: [{ role: "user", content: "anxious..." }]  │
└───────────┬─────────────────────────────────────────┘
            │
            │ 5. Send to Anthropic API
            ▼
┌───────────────────────────────────┐
│  Anthropic Claude 3.5 Sonnet      │
│  System Prompt + User Message     │
└───────────┬───────────────────────┘
            │
            │ 6. AI Response
            ▼
┌─────────────────────────────────────────────────────┐
│  "What specifically about work is triggering that?" │
└───────────┬─────────────────────────────────────────┘
            │
            │ 7. Update Session with messages
            ▼
┌─────────────────────────────┐
│  Database: sessions table   │
│  {                          │
│    turnCount: 1             │
│    messages: [              │
│      {role: "user", ...},   │
│      {role: "assistant"...} │
│    ]                        │
│  }                          │
└───────────┬─────────────────┘
            │
            │ 8. Return to frontend
            ▼
┌─────────────────────┐
│  ChatInterface      │
│  Displays messages  │
└─────────┬───────────┘
          │
          │ 9. User responds: "Not doing enough"
          ▼
┌─────────────────────────────────────┐
│  POST /api/sessions/:id/continue    │
└───────────┬─────────────────────────┘
            │
            │ 10. Get existing messages
            │     Add new user message
            │     Call Claude again
            ▼
┌─────────────────────────────────────────────────────┐
│  claudeService.conductGuidedAnalysis()              │
│  Input: All previous messages + new message         │
└───────────┬─────────────────────────────────────────┘
            │
            │ ... continues for 3-5 turns ...
            │
            │ After Turn 5:
            ▼
┌───────────────────────────────────────────────────┐
│  AI Response:                                     │
│  "ROOT CAUSE IDENTIFIED: Your worth is tied to   │
│   productivity...                                │
│                                                   │
│   KEY THEMES: perfectionism, fear of rejection..." │
└───────────┬───────────────────────────────────────┘
            │
            │ 11. detectSessionCompletion() = true
            │     extractRootCauseAnalysis()
            ▼
┌─────────────────────────────┐
│  Database: sessions table   │
│  {                          │
│    status: "completed"      │
│    rootCause: "..."         │
│    completedAt: timestamp   │
│    metadata: {              │
│      themes: [...]          │
│    }                        │
│  }                          │
└───────────┬─────────────────┘
            │
            │ 12. Return completed session
            ▼
┌─────────────────────┐
│  ChatInterface      │
│  Shows completion   │
│  banner             │
└─────────────────────┘
```

---

## Session State Machine

```
     ┌─────────────┐
     │   START     │
     └──────┬──────┘
            │
            │ User submits initial emotion
            ▼
     ┌─────────────┐
     │   ACTIVE    │◄─────┐
     └──────┬──────┘      │
            │             │
            │ Turn < 5    │ User responds
            │ No root     │
            │ cause yet   │
            └─────────────┘
            │
            │ Turn >= 5 OR "ROOT CAUSE IDENTIFIED"
            ▼
     ┌─────────────┐
     │  COMPLETED  │
     └──────┬──────┘
            │
            │ User can visualize or review
            ▼
     ┌─────────────┐
     │  ARCHIVED   │ (future: can be deleted)
     └─────────────┘

Alternative path:

     ┌─────────────┐
     │   ACTIVE    │
     └──────┬──────┘
            │
            │ User leaves before completion
            ▼
     ┌─────────────┐
     │  ABANDONED  │ (future: can be resumed)
     └─────────────┘
```

---

## Canvas Visualization Architecture

```
User clicks "Visualize Journey"
          │
          ▼
GET /api/canvas/session/:sessionId
          │
          ▼
canvasService.generateSessionGraph()
          │
          ├─────► Fetch Session from DB
          │
          ├─────► Parse messages JSON
          │
          ├─────► Create Nodes:
          │       • Initial Emotion (red, size: 2)
          │       • Layer 1-N (purple, size: 1.5)
          │       • Root Cause (green, size: 2.5)
          │       • Themes (orange, size: 1.2)
          │
          ├─────► Create Edges:
          │       • initial → layer1 ("led to")
          │       • layer1 → layer2 ("led to")
          │       • ...
          │       • lastLayer → rootCause ("revealed")
          │       • themes → rootCause ("contributes to")
          │
          ▼
Return CanvasGraph { nodes, edges, metadata }
          │
          ▼
D3.js Force-Directed Graph
  • Nodes positioned automatically
  • Edges show progression
  • Interactive (drag, zoom, click)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (React)                               │
│  ┌───────────────────────────────────────────┐  │
│  │  All requests include:                    │  │
│  │  Authorization: Bearer <JWT_TOKEN>        │  │
│  └────────────────┬──────────────────────────┘  │
└───────────────────┼─────────────────────────────┘
                    │
                    │ HTTPS (in production)
                    ▼
┌─────────────────────────────────────────────────┐
│  Backend (Express)                              │
│  ┌───────────────────────────────────────────┐  │
│  │  Middleware Chain:                        │  │
│  │  1. CORS (restrict origins)               │  │
│  │  2. Helmet (security headers)             │  │
│  │  3. Rate Limiting (100 req/15min)         │  │
│  │  4. authenticateToken()                   │  │
│  │     - Verifies JWT                        │  │
│  │     - Extracts userId                     │  │
│  │  5. Controller (business logic)           │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Database Layer                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  All queries filtered by userId           │  │
│  │  WHERE userId = req.user.userId           │  │
│  │  → Users can only access their sessions   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Error occurs in any layer
        │
        ▼
┌─────────────────────┐
│  try/catch block    │
└─────────┬───────────┘
          │
          │ next(error)
          ▼
┌─────────────────────────────┐
│  Global Error Handler       │
│  (error.middleware.ts)      │
└─────────┬───────────────────┘
          │
          ├─── AppError (known)
          │    → Send structured response
          │    → { error: "message", code: 400 }
          │
          └─── Unknown Error
               → Log to console
               → Send generic message
               → { error: "Internal server error", code: 500 }
```

---

## Technology Stack Summary

```
┌──────────────────────────────────────────┐
│  FRONTEND                                │
│  • React 18 + TypeScript                │
│  • Tailwind CSS                          │
│  • React Router                          │
│  • TanStack Query (React Query)         │
│  • Zustand (state management)           │
│  • Lucide Icons                          │
│  • date-fns (date formatting)           │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  BACKEND                                 │
│  • Node.js + Express                     │
│  • TypeScript                            │
│  • Prisma ORM                            │
│  • PostgreSQL                            │
│  • JWT Authentication                    │
│  • bcrypt (password hashing)            │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  AI LAYER                                │
│  • Anthropic Claude 3.5 Sonnet          │
│  • @anthropic-ai/sdk                     │
│  • Custom system prompts                 │
│  • Conversation history management       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  VISUALIZATION                           │
│  • D3.js v7 (force-directed graphs)     │
│  • Custom canvas service                 │
│  • Interactive node/edge manipulation    │
└──────────────────────────────────────────┘
```

---

## Performance Considerations

### Backend
- **Response Time:** < 3 seconds (Claude API latency)
- **Caching:** Not implemented (each conversation is unique)
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Database Queries:** Indexed on userId, status, createdAt

### Frontend
- **Code Splitting:** Lazy load pages
- **State Management:** Local state + React Query cache
- **Re-renders:** Optimized with React.memo where needed
- **Bundle Size:** Vite optimization

### Scalability
- **Concurrent Users:** Limited by Anthropic API rate limits
- **Database:** PostgreSQL can handle thousands of sessions
- **Session Storage:** JSON fields efficient for < 1KB messages

---

## Monitoring & Observability

### Logs to Track
```typescript
✅ Session created: userId, sessionId, initialEmotion
✅ Turn completed: sessionId, turnCount
✅ Session completed: sessionId, rootCause
✅ Claude API call: request/response times
✅ Errors: stack traces, context
```

### Metrics to Monitor
- Average turns to completion
- Completion rate (completed / started)
- API response times
- Error rates
- User engagement (sessions per user)

---

**Architecture Version:** 2.0  
**Last Updated:** November 19, 2025  
**Status:** Production-Ready ✅
