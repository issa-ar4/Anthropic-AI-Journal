# 🚀 Quick Start Checklist

## Before You Begin

- [ ] PostgreSQL database is running
- [ ] `.env` file in backend has `ANTHROPIC_API_KEY`
- [ ] `.env` file in backend has `DATABASE_URL`
- [ ] Node.js 18+ installed

---

## Backend Setup (5 minutes)

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Generate Prisma client with new Session model
npx prisma generate

# Apply the migration
npx prisma migrate deploy

# Start the backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📍 Environment: development
🔗 API: http://localhost:5000/api
✅ Anthropic SDK initialized successfully
```

---

## Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## Test the New Feature (3 minutes)

### Step 1: Navigate
1. Open browser: `http://localhost:3000`
2. Login with your account
3. Click **"Root Cause Analysis"** in navigation

### Step 2: Create Session
1. Click **"New Session"** button
2. Type: `I feel anxious about work`
3. Click Send or press Enter

### Step 3: Engage
Respond to AI's questions. Example flow:
- **AI:** "What specifically about work is triggering that feeling?"
- **You:** "I'm worried I'm not doing enough"
- **AI:** "When you think about not doing enough, what does that mean to you?"
- **You:** "I'd be letting people down"
- Continue for 2-3 more turns...

### Step 4: Complete
- AI will provide synthesis with **"ROOT CAUSE IDENTIFIED:"**
- Session status changes to "Completed" (green badge)
- Root cause appears under session in sidebar

### Step 5: Visualize
1. Click **"Visualize Journey"** button on completed session
2. Navigate to Canvas page
3. See the path from surface emotion → root cause

---

## Quick Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create new session
- [ ] AI responds with question
- [ ] Can send follow-up messages
- [ ] Turn count increments
- [ ] Session completes after 3-5 turns
- [ ] Root cause is displayed
- [ ] Session saved in history
- [ ] Can view previous sessions
- [ ] Can delete sessions
- [ ] "Visualize Journey" button appears on completed sessions

---

## If Something Fails

### Backend won't start
```bash
# Regenerate Prisma client
npx prisma generate

# Check database connection
npx prisma db push
```

### Frontend shows TypeScript errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### AI not responding
Check `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Session not saving
Check database migration:
```bash
npx prisma migrate status
npx prisma migrate deploy
```

---

## Next Steps After Testing

1. [ ] Update main `README.md` with new feature
2. [ ] Test on different browsers (Chrome, Firefox, Safari)
3. [ ] Test on mobile device
4. [ ] Deploy to staging environment
5. [ ] Run E2E tests
6. [ ] Deploy to production

---

## Key Files to Review

### Backend
- `backend/src/api/controllers/sessionController.ts` - Session logic
- `backend/src/services/claudeService.ts` - Root cause analysis
- `backend/prisma/schema.prisma` - Session model

### Frontend
- `frontend/src/pages/RootCauseSessionPage.tsx` - Main UI
- `frontend/src/components/session/ChatInterface.tsx` - Chat component
- `frontend/src/services/sessionService.ts` - API calls

### Documentation
- `docs/ROOT_CAUSE_MIGRATION.md` - Full migration guide
- `docs/SYSTEM_PROMPT_GUIDE.md` - AI prompt details
- `MIGRATION_COMPLETE.md` - Summary report

---

## Environment Variables Required

### backend/.env
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cognitive_canvas
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Support

**Migration Guide:** `docs/ROOT_CAUSE_MIGRATION.md`  
**System Prompt:** `docs/SYSTEM_PROMPT_GUIDE.md`  
**Issues:** Check console logs in browser & terminal

---

**Total Setup Time:** ~10 minutes  
**First Session Time:** ~3 minutes  
**Learning Curve:** Low (intuitive chat interface)

✅ **You're all set! Happy testing!** 🎉
