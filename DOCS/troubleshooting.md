# Troubleshooting Guide

## Common Issues and Solutions

### 1. Application Won't Start

**Frontend Issues:**
- **Error**: `react-scripts` not found
  - Solution: Run `npm install` in client folder

- **Error**: Port 3000 already in use
  - Solution: Change port in `.env` or kill process on port 3000

**Backend Issues:**
- **Error**: Database connection failed
  - Solution: Check DATABASE_URL in .env, ensure PostgreSQL is running

- **Error**: Prisma client not generated
  - Solution: Run `npx prisma generate` in server folder

### 2. Authentication Problems

**Can't Register:**
- Check email format is valid
- Ensure password meets requirements (if any)
- Verify phone number format

**Email Verification Not Received:**
- Check spam/junk folder
- Wait a few minutes for delivery
- Contact support if still not received

**Login Fails:**
- Verify email and password
- Check if account is verified
- Try password reset

### 3. Database Issues

**Migration Errors:**
- Ensure PostgreSQL is running
- Check database credentials
- Run `npx prisma migrate reset` if needed (development only)

**Data Not Saving:**
- Check network connection
- Verify form validation
- Check server logs for errors

### 4. Frontend Issues

**Components Not Loading:**
- Clear browser cache
- Run `npm install` again
- Check console for JavaScript errors

**Maps Not Displaying:**
- Check internet connection
- Verify Leaflet dependencies
- Check browser console for map errors

**Theme Not Changing:**
- Clear localStorage
- Refresh page
- Check ThemeContext implementation

### 5. API Errors

**401 Unauthorized:**
- Check JWT token validity
- Re-login if token expired
- Verify endpoint requires authentication

**404 Not Found:**
- Check URL spelling
- Verify API base URL in .env
- Check server is running on correct port

**500 Internal Server Error:**
- Check server logs
- Verify database connection
- Check for missing environment variables

### 6. Performance Issues

**Slow Loading:**
- Check network speed
- Clear browser cache
- Optimize images and assets

**High Memory Usage:**
- Close unnecessary browser tabs
- Restart development servers
- Check for memory leaks in code

### 7. Development Environment

**Node Modules Issues:**
- Delete node_modules and package-lock.json
- Run `npm install` fresh
- Check Node.js version compatibility

**Git Issues:**
- Check .gitignore for sensitive files
- Resolve merge conflicts
- Pull latest changes

### 8. Deployment Issues

**Build Fails:**
- Run `npm run build` locally first
- Check for TypeScript/ESLint errors
- Verify all dependencies are in package.json

**Environment Variables:**
- Ensure all required env vars are set
- Check variable naming (no typos)
- Verify database URLs are correct

### Getting Help

If these solutions don't work:
1. Check server logs: `tail -f server/logs/app.log`
2. Check browser console for errors
3. Verify all prerequisites are installed
4. Contact development team with error details

### Prevention Tips
- Keep dependencies updated
- Test changes locally before committing
- Use environment-specific configs
- Monitor server logs regularly
- Backup database regularly