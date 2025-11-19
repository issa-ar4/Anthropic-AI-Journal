# Blank Screen Fixes Applied

## Issues Identified & Fixed

### 1. Syntax Error in `usePerformance.ts`
**Issue**: The file `frontend/src/hooks/usePerformance.ts` was using `useState` without importing it from React.
**Impact**: This causes a runtime error "useState is not defined" if the file is imported, which leads to a blank screen (white screen of death).
**Fix**: Added `import { useState } from 'react';`.

### 2. API Configuration Mismatch
**Issue**: The frontend was configured to use `http://localhost:5000` as a fallback, or `http://localhost:3001/api` via `.env`. While the `.env` value was correct for direct access, using the Vite proxy is more robust in development.
**Impact**: Potential CORS issues or connection failures if the environment variable wasn't loaded correctly.
**Fix**: 
- Updated `frontend/src/services/api.ts` to default to `/api`.
- Updated `frontend/.env` to `VITE_API_URL=/api`.
- This ensures requests go through Vite's proxy (configured in `vite.config.ts`) to `http://localhost:3001`.

### 3. Markdown Utility Safety
**Issue**: The `stripMarkdown` utility in `frontend/src/utils/markdown.ts` would crash if passed `null` or `undefined`.
**Impact**: If the backend returned a message with missing content, the entire application would crash when trying to render the chat interface.
**Fix**: Added a safety check: `if (!text) return '';`.

### 4. Main Entry Point Robustness
**Issue**: `frontend/src/main.tsx` assumed `document.getElementById('root')` always exists.
**Impact**: If the DOM wasn't fully loaded (rare but possible), it would throw an unhandled exception.
**Fix**: Added a null check for the root element before rendering.

## Verification

1. **Restarted Servers**: Both backend (port 3001) and frontend (port 3000) have been restarted to apply changes.
2. **Environment Variables**: Updated `.env` is now active.

## How to Test

1. Refresh the page at `http://localhost:3000/root-cause`.
2. The blank screen should be gone.
3. You should see the session list or the "Start New Session" interface.
4. Try creating a new session to verify API connectivity.

If the issue persists, please check the browser console (F12 -> Console) for any remaining error messages.
