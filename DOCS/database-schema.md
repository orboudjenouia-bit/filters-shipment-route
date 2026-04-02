# Database Schema Documentation

## Overview
The Wesselli Logistics Platform uses PostgreSQL with Prisma ORM. The schema includes users, shipments, routes, vehicles, and subscriptions.

## Models

### User
Core user model with authentication and profile data.

**Fields:**
- `id`: Primary key (auto-increment)
- `email`: Unique email (max 50 chars)
- `password`: Hashed password
- `phone`: Phone number (10 chars)
- `profile_Photo`: Optional profile image URL
- `working_Time`: Optional working hours
- `type`: BUSINESS or INDIVIDUAL
- `role`: USER or ADMIN
- `status`: Active/Inactive
- `resetPasswordToken`: Password reset token
- `resetPasswordExpires`: Token expiry
- `verificationToken`: Email verification code (10 chars)
- `verificationTokenExpires`: Verification expiry
- `isVerified`: Email verification status

**Relations:**
- One-to-one with Individual or Business
- One-to-one with Subscription
- One-to-many with Vehicles, Shipments, Routes

### Individual
Profile for individual users.

**Fields:**
- `user_ID`: Foreign key to User
- `full_Name`: Full name
- `nin`: National ID number (unique)
- `location`: Address/location

### Business
Profile for business users.

**Fields:**
- `user_ID`: Foreign key to User
- `business_Name`: Company name
- `rc_Number`: Registration number (unique)
- `form`: Business form/type
- `nif`: Tax ID
- `nis`: Social security number
- `locations`: Array of business locations

### Vehicle
Carrier vehicles.

**Fields:**
- `plate_Number`: Primary key (license plate number)
- `vehicle_Name`: Vehicle name/model
- `type`: Vehicle type
- `color`: Vehicle color
- `year`: Manufacturing year
- `capacity`: Load capacity
- `photo`: Vehicle photo URL
- `deleted_at`: Soft delete timestamp

**Relations:**
- Belongs to User
- One-to-many with Routes

### Route
Transportation routes.

**Fields:**
- `route_ID`: Primary key (auto-increment)
- `name`: Route name
- `photo`: Route photo/map
- `origin`: Starting location
- `destination`: Ending location
- `region`: Service region
- `date`: Travel date
- `post_type`: ORIGIN_DESTINATION or REGION
- `date_type`: DAY or INTERVAL
- `interval_start`: Date range start
- `interval_end`: Date range end
- `more_Information`: Additional details
- `status`: Active/Inactive

**Relations:**
- Belongs to User
- Belongs to Vehicle

### Shipment
Freight requests.

**Fields:**
- `shipment_ID`: Primary key (auto-increment)
- `title`: Shipment title
- `category`: Shipment category
- `photo`: Shipment photo
- `origin`: Pickup location
- `destination`: Delivery location
- `volume`: Package volume
- `weight`: Package weight
- `date`: Shipment date
- `time`: Shipment time
- `priority`: Normal/High/Urgent
- `special_Information`: Special handling notes
- `status`: In-Stock/Assigned/In-Transit/Delivered

**Relations:**
- Belongs to User

### Subscription
User subscription tiers.

**Fields:**
- `sub_ID`: Primary key (auto-increment)
- `tier`: Free-Tier/Premium/etc.
- `rest_Time`: Subscription expiry

**Relations:**
- Belongs to User (unique)

## Enums

### UserType
- BUSINESS
- INDIVIDUAL

### Roles
- USER
- ADMIN

### PostType
- ORIGIN_DESTINATION
- REGION

### DateType
- DAY
- INTERVAL

## Database Operations

### Migrations
Run migrations with: `npx prisma migrate dev`

### Generate Client
Update Prisma client: `npx prisma generate`

### View Data
Use Prisma Studio: `npx prisma studio`

## Relationships Diagram

```
User (1) ──── (1) Individual/Business
   │
   ├── (1) Subscription
   ├── (many) Vehicles
   ├── (many) Shipments
   └── (many) Routes ─── (1) Vehicle
```