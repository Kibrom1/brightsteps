# Quick Start Guide

## Installation

```bash
cd frontend
npm install
```

## Development

1. **Start the backend** (in a separate terminal):
   ```bash
   cd ..  # Go to project root
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open browser**: `http://localhost:3000`

## First Steps

1. **Register a new account** at `/register`
2. **Login** at `/login`
3. **Create your first deal** from the dashboard
4. **View analytics** on the deal detail page

## Project Structure Overview

- `src/pages/` - All page components
- `src/components/` - Reusable components
- `src/lib/api/` - API client modules
- `src/contexts/` - React contexts (Auth)
- `src/types/` - TypeScript definitions

## Key Files

- `src/App.tsx` - Main app with routing
- `src/main.tsx` - Entry point
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/lib/api-client.ts` - Base API client

## Environment

Create `.env` file (optional, defaults work for local dev):
```
VITE_API_BASE_URL=http://localhost:8000
```

## Build for Production

```bash
npm run build
```

Output: `dist/` directory

