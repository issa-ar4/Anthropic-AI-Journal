# Cognitive Canvas - Root Cause Analysis Migration Guide

## 🎯 Overview

This document outlines the complete migration from **Passive Journaling** to **Guided Root Cause Analysis**. The new system transforms the app from accepting large journal entries into a conversational, step-by-step exploration that helps users discover the deep causes behind their emotions.

---

## 📋 What Changed

### **Old Approach: Passive Journaling**
- User writes a long journal entry in a text box
- Entry is submitted to Claude API
- System generates static analysis + D3.js graph
- One-shot interaction

### **New Approach: Guided Root Cause Analysis**
- User starts with a single emotion (e.g., "I feel anxious about work")
- AI responds with probing questions using 5 Whys & Socratic questioning
- Back-and-forth continues for 3-5 turns
- AI identifies and synthesizes the root cause
- D3.js graph visualizes the **path from surface emotion to root cause**

---

## 🗄️ Database Changes

### New Schema: `Session` Model

```prisma
model Session {
  id                String        @id @default(cuid())
  userId            String
  status            String        @default("active") // active, completed, abandoned
  initialEmotion    String        // The surface-level emotion user started with
  rootCause         String?       // Identified root cause (set when completed)
  turnCount         Int           @default(0)
  messages          Json          @default("[]") // Array of {role, content, timestamp}
  metadata          Json?         // themes, insights during the process
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  completedAt       DateTime?
  
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("sessions")
}
```

### Migration Applied
```bash
npx prisma migrate dev --name add_guided_sessions
```

The `Session` model tracks:
- **Conversation history** (messages array)
- **Session state** (active/completed/abandoned)
- **Initial emotion** (starting point)
- **Root cause** (endpoint, when identified)
- **Metadata** (themes extracted during conversation)

---

## 🔧 Backend Changes

### 1. **New Controller: `sessionController.ts`**

**Location:** `backend/src/api/controllers/sessionController.ts`

**Key Endpoints:**
- `POST /api/sessions` - Create new session with initial emotion
- `POST /api/sessions/:id/continue` - Continue conversation with user message
- `GET /api/sessions` - Get all sessions for user
- `GET /api/sessions/:id` - Get specific session
- `DELETE /api/sessions/:id` - Delete session

**Flow:**
1. User submits initial emotion → Creates session + gets first AI question
2. User responds → AI continues inquiry, checks if root cause reached
3. After 3-5 turns → AI synthesizes root cause, marks session complete

### 2. **Updated Service: `claudeService.ts`**

**New Method:** `conductGuidedAnalysis()`

**System Prompt (Key Excerpt):**
```typescript
You are a compassionate therapeutic guide specializing in root cause analysis. 
Your role is to help users discover the deep, underlying causes of their emotions 
through guided inquiry.

**Your Approach:**
1. Use the "5 Whys" technique combined with Socratic questioning
2. Ask ONE clear, probing question at a time
3. Move progressively deeper with each exchange
4. Be empathetic, non-judgmental, and create psychological safety
5. Listen for patterns, core beliefs, unmet needs, or past experiences

**When You've Reached the Root Cause:**
After 3-5 thoughtful exchanges, provide synthesis including:
1. "ROOT CAUSE IDENTIFIED:" statement
2. Key themes that emerged
3. Compassionate closing reflection
```

**Completion Detection:**
- Looks for "ROOT CAUSE IDENTIFIED:" marker
- Falls back to turn count (5 turns) + synthesis language

### 3. **New Routes: `session.routes.ts`**

**Location:** `backend/src/api/routes/session.routes.ts`

Registers all session endpoints with authentication middleware.

### 4. **Canvas Service Enhancement**

**New Method:** `generateSessionGraph()`

Visualizes the conversation path:
- Initial emotion node (red, surface level)
- Intermediate nodes for each user response (purple layers)
- Root cause node (green, destination)
- Theme nodes connected to root cause (orange)
- Edges showing the progression ("led to", "revealed")

---

## 🎨 Frontend Changes

### 1. **New Component: `ChatInterface.tsx`**

**Location:** `frontend/src/components/session/ChatInterface.tsx`

**Features:**
- Message bubbles (user vs assistant styling)
- Auto-scroll to latest message
- Loading state ("Thinking deeply...")
- Completion indicator
- Enter to send, Shift+Enter for new line

**Props:**
```typescript
interface ChatInterfaceProps {
  messages: SessionMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isComplete: boolean;
  placeholder?: string;
}
```

### 2. **New Page: `RootCauseSessionPage.tsx`**

**Location:** `frontend/src/pages/RootCauseSessionPage.tsx`

**Layout:**
- **Left Sidebar:** Session history with status badges
- **Main Area:** Active chat interface
- **Features:**
  - Create new session
  - Continue existing sessions
  - View completed sessions
  - Visualize session graph (button for completed sessions)

### 3. **Service Layer: `sessionService.ts`**

**Location:** `frontend/src/services/sessionService.ts`

API client methods:
- `create(initialEmotion)`
- `continue(sessionId, userMessage)`
- `getAll()`
- `getById(sessionId)`
- `delete(sessionId)`

### 4. **Navigation Updates**

Added "Root Cause Analysis" link to main navigation (desktop & mobile).

**Route:** `/root-cause`

---

## 📊 Canvas Visualization Enhancement

### New Endpoint
`GET /api/canvas/session/:sessionId`

### Graph Structure for Sessions

```typescript
Nodes:
- Initial Emotion (red, size: 2) → "I feel anxious about work"
- Layer 1 (purple) → First deeper response
- Layer 2 (purple) → Second deeper response
- ...
- Root Cause (green, size: 2.5) → "Performance-based self-worth"
- Themes (orange) → "perfectionism", "fear of rejection"

Edges:
- initial → layer1 ("led to")
- layer1 → layer2 ("led to")
- ...
- last layer → root cause ("revealed")
- themes → root cause ("contributes to")
```

### Integration with Canvas Page

The "Visualize Journey" button navigates to:
```
/canvas?session={sessionId}
```

Canvas page can detect the query param and load the session-specific graph.

---

## 🚀 How to Use the New System

### For Users:

1. **Navigate to "Root Cause Analysis"** in the menu
2. **Start a new session** by typing a surface emotion:
   - ✅ "I feel anxious about work"
   - ✅ "I'm frustrated with my relationships"
   - ✅ "I feel stuck in my career"
3. **Answer AI's questions honestly** - it will probe deeper
4. **Continue for 3-5 exchanges** until root cause is identified
5. **Review the synthesis** - AI explains what it discovered
6. **Visualize your journey** - Click "Visualize Journey" to see the path

### For Developers:

1. **Ensure database is migrated:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test the flow:**
   - Login → Navigate to "Root Cause Analysis"
   - Create a session with "I feel overwhelmed"
   - Engage with AI's questions
   - Verify completion detection and graph generation

---

## 🔐 Security & Best Practices

### Session Management
- Sessions are user-scoped (userId foreign key)
- Authentication required for all endpoints
- Session IDs are non-guessable (cuid)

### AI Safety
- System prompt emphasizes empathy and boundaries
- Suggests professional help if distress detected
- No medical advice or therapy claims

### Data Retention
- Users can delete sessions anytime
- Soft-delete option can be added later
- Messages stored as JSON (efficient querying)

---

## 🎯 Key Files Changed/Created

### Backend
```
backend/
├── prisma/
│   └── schema.prisma (+ Session model)
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   └── sessionController.ts (NEW)
│   │   └── routes/
│   │       └── session.routes.ts (NEW)
│   ├── services/
│   │   ├── claudeService.ts (UPDATED - added conductGuidedAnalysis)
│   │   └── canvasService.ts (UPDATED - added generateSessionGraph)
│   ├── types/
│   │   └── session.types.ts (NEW)
│   └── index.ts (UPDATED - registered routes)
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   └── session/
│   │       └── ChatInterface.tsx (NEW)
│   ├── pages/
│   │   └── RootCauseSessionPage.tsx (NEW)
│   ├── services/
│   │   └── sessionService.ts (NEW)
│   ├── types/
│   │   └── session.types.ts (NEW)
│   └── App.tsx (UPDATED - added route)
```

---

## 📈 Next Steps & Future Enhancements

1. **Canvas Integration:** Detect `?session=` query param in CanvasPage
2. **Export Sessions:** Allow downloading conversation transcripts
3. **Session Themes Dashboard:** Aggregate insights across sessions
4. **Multi-language Support:** Internationalize prompts
5. **Voice Input:** Add speech-to-text for mobile
6. **Session Resume:** Allow resuming abandoned sessions

---

## 🐛 Troubleshooting

### Issue: "Property 'session' does not exist on PrismaClient"
**Solution:** Run `npx prisma generate` to regenerate client

### Issue: AI doesn't detect completion
**Solution:** Verify Claude model is using Sonnet 3.5 (latest), check prompt formatting

### Issue: Messages not persisting
**Solution:** Check JSON serialization in controller, ensure `JSON.parse()`/`stringify()` is correct

### Issue: Graph not generating from session
**Solution:** Verify session is marked as 'completed' and has rootCause field populated

---

## 📚 Additional Resources

- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Anthropic API Docs](https://docs.anthropic.com/claude/reference/messages_post)
- [D3.js Force Layout](https://d3js.org/d3-force)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

---

## ✅ Migration Checklist

- [x] Update Prisma schema with Session model
- [x] Generate and apply migration
- [x] Create session controller
- [x] Update Claude service with guided analysis
- [x] Create session routes
- [x] Define TypeScript types
- [x] Build ChatInterface component
- [x] Create session service (API client)
- [x] Create RootCauseSessionPage
- [x] Update navigation
- [x] Add session graph generation to canvas
- [ ] Test end-to-end flow
- [ ] Update Canvas page to handle session query param
- [ ] Deploy to production

---

**Migration Status:** ✅ Complete - Ready for Testing

**Date:** November 19, 2025  
**Version:** 2.0.0  
**Breaking Changes:** None (new feature, old journal system still intact)
