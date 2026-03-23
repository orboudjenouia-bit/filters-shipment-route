# PRPG06------BACKEND

A professional backend application for PRPG06 with enterprise-level error handling.

---

## 📋 Table of Contents

- [Setup](#setup)
- [Error Handling Architecture](#error-handling-architecture)
- [API Response Format](#api-response-format)
- [Error Codes Reference](#error-codes-reference)
- [HTTP Status Codes](#http-status-codes)
- [Examples](#examples)
- [Project Structure](#project-structure)

---

## 🚀 Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/PRPG06"
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=2d
```

---

## 🎯 Error Handling Architecture

The application implements a **production-grade error handling system** with:

### 1. **Custom AppError Class** (`utils/AppError.js`)

```javascript
throw new AppError("User already exists", StatusCodes.CONFLICT, "USER_EXISTS");
```

**Properties:**
- `message` - User-friendly error message
- `statusCode` - HTTP status code (400, 401, 404, 500, etc.)
- `code` - Machine-readable error identifier for frontend handling
- `timestamp` - ISO 8601 timestamp when error occurred

### 2. **Async Handler** (`utils/asyncHandler.js`)

Automatically catches errors in async route handlers without explicit try-catch:

```javascript
// In routes - errors automatically caught
router.post('/register', asyncHandler(controller.register));
```

### 3. **Global Error Middleware** (`Middlewares/errorHandler.js`)

Centralized error handling that:
- Catches all application errors
- Formats responses consistently
- Returns standardized JSON structure

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "msg": "Operation successful",
  "data": {...}
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed"
}
```

**Response Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `success` | boolean | Whether request succeeded |
| `statusCode` | number | HTTP status code |
| `code` | string | Machine-readable error code |
| `message` | string | Human-readable error message |

---

## 🔑 Error Codes Reference

### Authentication & Authorization

| Code | Status | Meaning | Usage |
|------|--------|---------|-------|
| `NO_HEADER` | 401 | Missing auth header | No Authorization header sent |
| `NO_TOKEN` | 401 | Missing token value | Authorization header empty |
| `INVALID_TOKEN` | 401 | Invalid/malformed token | JWT signature invalid |
| `TOKEN_EXPIRED` | 401 | Token has expired | JWT expired |
| `FORBIDDEN` | 403 | Not authorized for resource | User can't access resource |

### Validation Errors

| Code | Status | Meaning | Usage |
|------|--------|---------|-------|
| `VALIDATION_ERROR` | 400 | Input validation failed | Invalid email, short password, etc. |
| `USER_EXISTS` | 409 | Duplicate user | Email already registered |
| `DUPLICATE_EMAIL` | 409 | Email already exists | Unique constraint violated |

### Database Errors

| Code | Status | Meaning | Prisma Code |
|------|--------|---------|-------------|
| `DUPLICATE_EMAIL` | 409 | Email already in database | P2002 |
| `NOT_FOUND` | 404 | Record not found | P2025 |
| `USER_NOT_FOUND` | 404 | User doesn't exist | P2025 |
| `USER_CREATION_ERROR` | 500 | Failed to create user | Various |

### System Errors

| Code | Status | Meaning | Usage |
|------|--------|---------|-------|
| `INTERNAL_ERROR` | 500 | Server error | Unexpected failure |

---

## 📈 HTTP Status Codes

| Code | Name | Usage |
|------|------|-------|
| **200** | OK | Successful GET request |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input/validation failed |
| **401** | Unauthorized | Authentication failed |
| **403** | Forbidden | Authorized but no permission |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource already exists (duplicate) |
| **500** | Internal Server Error | Server-side failure |

---

## 💡 Examples

### Example 1: Register with Invalid Email

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "Password123",
  "phone": "1234567890",
  "type": "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed"
}
```

---

### Example 2: Access Protected Route Without Token

**Request:**
```bash
GET /api/shipments
(no Authorization header)
```

**Response:**
```json
{
  "success": false,
  "statusCode": 401,
  "code": "NO_HEADER",
  "message": "No authorization header sent"
}
```

---

### Example 3: Register Duplicate Email

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "Password123",
  "phone": "1234567890",
  "type": "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": false,
  "statusCode": 409,
  "code": "DUPLICATE_EMAIL",
  "message": "Email already exists in database"
}
```

---

### Example 4: Invalid JWT Token

**Request:**
```bash
GET /api/shipments
Authorization: Bearer invalid_token_xyz
```

**Response:**
```json
{
  "success": false,
  "statusCode": 401,
  "code": "INVALID_TOKEN",
  "message": "Invalid or malformed token"
}
```

---

### Example 5: Access Another User's Resource (403 Forbidden)

**Request:**
```bash
PATCH /api/shipments
Authorization: Bearer valid_token
Content-Type: application/json

{
  "shipment_ID": 5,
  "destination": "New Location"
}
```

**Response:**
```json
{
  "success": false,
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "Not authorized to update this shipment"
}
```

---

## 📁 Project Structure

```
├── Controllers/
│   ├── authController.js           # Auth logic with error handling
│   ├── shipmentController.js       # Shipment CRUD with error handling
│   └── routesController.js         # Routes CRUD with error handling
├── Routes/
│   ├── auth.js                     # Auth routes with asyncHandler
│   ├── shipments.js                # Shipment routes with asyncHandler
│   └── routes.js                   # Routes with asyncHandler
├── Middlewares/
│   ├── errorHandler.js             # Global error middleware ⭐
│   └── checkToken.js               # JWT validation middleware
├── utils/
│   ├── AppError.js                 # Custom error class ⭐
│   └── asyncHandler.js             # Async wrapper for auto-catching ⭐
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
├── config/
│   └── prismaClient.js             # Database client config
├── app.js                          # Express app setup
└── package.json                    # Dependencies
```

⭐ = Error handling related

---

## 🛠️ How It Works: Error Flow

```
Request
  ↓
[Express Middleware]
  ↓
[Route Handler + asyncHandler wrapper]
  ↓
[Controller throws AppError or other error]
  ↓
[asyncHandler catches error]
  ↓
[Passes to next(error)]
  ↓
[Global Error Middleware]
  ↓
[Formats to JSON with statusCode, code, message]
  ↓
Response to Client
```

---

## 🔐 Error Handling Best Practices Used

### 1. ✅ Throw Errors Instead of Returning

```javascript
// ✅ Good
throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");

// ❌ Avoid
return res.status(404).json({ msg: "User not found" });
```

### 2. ✅ Use asyncHandler to Avoid Try-Catch

```javascript
// ✅ Good
router.post('/create', asyncHandler(controller.create));

// ❌ Verbose
router.post('/create', async (req, res, next) => {
  try {
    await controller.create(req, res, next);
  } catch (error) {
    next(error);
  }
});
```

### 3. ✅ Distinguish 401 vs 403

```javascript
// 401 - Authentication failed (no valid token)
throw new AppError("Invalid token", StatusCodes.UNAUTHORIZED, "INVALID_TOKEN");

// 403 - Authorized but no permission
throw new AppError("No permission to delete", StatusCodes.FORBIDDEN, "FORBIDDEN");
```

### 4. ✅ Use HTTP Status Codes Semantically

```javascript
// Bad request
StatusCodes.BAD_REQUEST           // 400

// Authentication failed
StatusCodes.UNAUTHORIZED          // 401

// Permission denied
StatusCodes.FORBIDDEN              // 403

// Resource not found
StatusCodes.NOT_FOUND              // 404

// Resource already exists
StatusCodes.CONFLICT               // 409

// Server error
StatusCodes.INTERNAL_SERVER_ERROR  // 500
```

---

## 🧪 Testing Errors

All error responses have been tested and verified:

✅ Validation errors (400)
✅ Missing auth header (401)
✅ Invalid token (401)
✅ Authorization failures (403)
✅ Not found errors (404)
✅ Conflict errors (409)
✅ Server errors (500)

---

## 📝 Frontend Integration

### JavaScript/React Example

```javascript
async function registerUser(email, password) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    // Handle different error codes
    if (!data.success) {
      switch(data.code) {
        case 'VALIDATION_ERROR':
          showInputError("Please check your input");
          break;
        case 'DUPLICATE_EMAIL':
          showInputError("This email is already registered");
          break;
        case 'USER_CREATION_ERROR':
          showAlert("Something went wrong. Try again later");
          break;
      }
      return;
    }
    
    // Success
    localStorage.setItem('token', data.token);
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

---

## 🚀 Next Steps

1. **Database Setup** - Run `npx prisma migrate dev`
2. **Start Server** - Run `npm run dev`
3. **Test API** - Use Postman/curl to test endpoints
4. **Frontend Integration** - Use error codes for UI feedback
5. **Production Deployment** - Set `NODE_ENV=production`

---

## 📚 References

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html)
- [HTTP Status Codes Library](https://github.com/prettymuchbryce/http-status-codes)
- [REST API Best Practices](https://restfulapi.net/) 
