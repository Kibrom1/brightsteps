# Debugging Login Issues

## Quick Checks

1. **Backend Running?**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"ok","version":"2.0.0"}`

2. **Frontend Running?**
   ```bash
   curl http://localhost:3000
   ```
   Should return HTML

3. **Test Login Directly:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@brightsteps.com","password":"admin123"}'
   ```
   Should return access_token

## Browser Console Debugging

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for:
   - `[API] POST /api/v1/auth/login` logs
   - Any error messages
   - Network errors

5. Go to Network tab:
   - Filter by "login"
   - Check the request:
     - URL should be `http://localhost:8000/api/v1/auth/login`
     - Method: POST
     - Headers should include `Content-Type: application/json`
   - Check the response:
     - Status code (should be 200)
     - Response body (should have access_token)

## Common Issues

### CORS Error
- Check backend CORS allows `http://localhost:3000`
- Check browser console for CORS errors

### "Failed to fetch"
- Backend not running
- Network connectivity issue
- Check browser console for details

### "Not authenticated"
- Token not being stored correctly
- Check sessionStorage in browser DevTools
- Look for `brightsteps_token` key

### Wrong Password Error
- Backend returns: `{"detail": "Incorrect email or password"}`
- Check you're using the correct password

## Test Credentials

**Admin:**
- Email: `admin@brightsteps.com`
- Password: `admin123`

**Regular User (any from the list):**
- Use any email from `python check_users.py`
- Password: (whatever you set during registration)

## Manual Test

Open browser console and run:
```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@brightsteps.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show you the exact response from the backend.

