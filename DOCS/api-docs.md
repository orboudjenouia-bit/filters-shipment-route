# Wesselli Logistics Platform - API Documentation

## Base URL
`http://localhost:3000/api` (development)

## Authentication
Most endpoints require JWT token in Authorization header: `Bearer <token>`

## Endpoints

### Authentication
#### Register User
- **POST** `/auth/register`
- **Body**: `{ email, password, phone, type, role }`
- **Response**: `{ success: true, message: "User registered successfully" }`

#### Login
- **POST** `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ success: true, token, user: { id, email, role } }`

#### Verify Email
- **POST** `/auth/verify`
- **Body**: `{ email, verificationToken }`
- **Response**: `{ success: true, message: "Email verified" }`

#### Forgot Password
- **POST** `/auth/forgot-password`
- **Body**: `{ email }`
- **Response**: `{ success: true, message: "Reset email sent" }`

#### Reset Password
- **POST** `/auth/reset-password`
- **Body**: `{ token, newPassword }`
- **Response**: `{ success: true, message: "Password reset" }`

### Shipments
#### Get All Shipments
- **GET** `/shipments`
- **Auth**: Required
- **Query**: `?status=active&page=1&limit=10`
- **Response**: `{ shipments: [...], total, page }`

#### Create Shipment
- **POST** `/shipments`
- **Auth**: Required
- **Body**: `{ origin, destination, weight, volume, priority, description }`
- **Response**: `{ success: true, shipment: {...} }`

#### Update Shipment
- **PATCH** `/shipments/:id`
- **Auth**: Required (owner only)
- **Body**: `{ status, ... }`
- **Response**: `{ success: true, shipment: {...} }`

#### Delete Shipment
- **DELETE** `/shipments/:id`
- **Auth**: Required (owner only)
- **Response**: `{ success: true, message: "Deleted" }`

### Routes
#### Get Routes
- **GET** `/routes`
- **Auth**: Required
- **Response**: `{ routes: [...] }`

#### Create Route
- **POST** `/routes`
- **Auth**: Required
- **Body**: `{ origin, destination, vehicleId, departureDate, arrivalDate }`
- **Response**: `{ success: true, route: {...} }`

### Profile
#### Get Profile
- **GET** `/profile`
- **Auth**: Required
- **Response**: `{ user: {...}, profile: {...} }`

#### Update Profile
- **PATCH** `/profile`
- **Auth**: Required
- **Body**: `{ name, company, address, ... }`
- **Response**: `{ success: true, profile: {...} }`

### Dashboard
#### Get Stats
- **GET** `/dashboard/stats`
- **Auth**: Required
- **Response**: `{ activeShipments, totalRoutes, earnings, ... }`

### Admin (Admin role only)
#### Get All Users
- **GET** `/admin/users`
- **Auth**: Admin
- **Response**: `{ users: [...] }`

## Error Responses
All errors follow: `{ success: false, message: "Error description", errorCode: "CODE" }`

Common codes: USER_NOT_FOUND, INVALID_CREDENTIALS, UNAUTHORIZED, etc.