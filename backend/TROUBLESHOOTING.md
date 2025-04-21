# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "No token provided" Error

This occurs when neither the auth cookie nor Authorization header contains a token.

**Solutions:**
- Make sure `withCredentials: true` is set in your frontend API client
- Check CORS settings allow credentials
- Ensure cookies are not being blocked by browser settings

To debug:
```bash
# While the server is running
curl http://localhost:5000/api/auth/debug
```

### 2. Password Authentication Failures

If login attempts fail with "Invalid credentials":

**Solutions:**
- Reset the test user with: `node scripts/createTestUser.js`
- Check the database directly to ensure password hashes are correct
- Verify bcrypt is working properly with: `node scripts/debugAuth.js`

### 3. CORS Issues

If you see CORS errors in the browser console:

**Solutions:**
- Ensure frontend origin (e.g., http://localhost:3000) is in ALLOWED_ORIGINS
- Check that CORS headers are correctly set in app.js
- Confirm cookies are properly configured with same-site and secure settings

### 4. Token Verification Failures

If login succeeds but API calls fail with token errors:

**Solutions:**
- JWT_SECRET must be the same for token creation and verification
- Check token expiration (default is 24 hours)
- Ensure clock synchronization between services if in a distributed environment

## Quick Fix Commands

```bash
# Recreate test user
node scripts/createTestUser.js

# Check authentication setup
node scripts/debugAuth.js

# Reset database if needed
npm run db:reset:safe

# Restart server with enhanced logging
DEBUG=express:*,auth:* npm run dev
```

Need more help? Check the API logs for detailed error messages.
