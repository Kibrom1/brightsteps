# Troubleshooting Guide

## "Failed to fetch" or "Not authenticated" Error

### If you see "Failed to fetch":
1. **Check backend is running**: `curl http://localhost:8000/health`
2. **Check CORS**: Backend should allow `http://localhost:3000`
3. **Check browser console**: Look for CORS errors or network failures

### If you see "Not authenticated" during registration:
1. **Clear browser storage**: 
   - Open DevTools (F12)
   - Application/Storage tab
   - Clear sessionStorage
   - Refresh page
2. **Check API client initialization**: The API client should work without a token for auth endpoints
3. **Verify backend is running**: Registration endpoint should be public

### Common Issues:

1. **Backend not running**:
   ```bash
   cd /Users/Kb/Desktop/workspace/AI/brightsteps
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend not running**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database not initialized**:
   ```bash
   python -c "from app.db.base import Base, init_db; from app.models import *; init_db()"
   ```

4. **CORS issues**: Backend has CORS configured for localhost:3000

### Testing Registration Directly:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User"}'
```

If this works but frontend doesn't, it's a frontend issue.

