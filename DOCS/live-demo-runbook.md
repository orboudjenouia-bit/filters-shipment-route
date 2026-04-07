# Live Demo Runbook (End-to-End)

This runbook gives you realistic data to test the full app flow tomorrow.

## 1) Seed Command

Run from the backend folder:

```bash
cd server
npm install
npm run seed:live-demo
```

What it seeds:
- Users (Admin + Individual + Business + Suspended)
- Individual and Business profiles
- Vehicles
- Routes (origin/destination + region, day + interval, with waypoints)
- Shipments (In-Stock, In-Delivery, Delivered)
- Subscriptions (Free, Individual, Business, Active/Inactive)
- Notifications and notification settings

## 2) Demo Login Accounts

Password for all users:

```text
DemoPass1234
```

- admin.live@wesselli.demo (ADMIN, BUSINESS, Active)
- yacine.ferhat@wesselli.demo (USER, INDIVIDUAL, Active)
- amina.logistics@wesselli.demo (USER, BUSINESS, Active)
- nadir.driver@wesselli.demo (USER, INDIVIDUAL, Active)
- sara.dispatch@wesselli.demo (USER, INDIVIDUAL, Active)
- omar.wholesale@wesselli.demo (USER, BUSINESS, Active)
- samir.suspended@wesselli.demo (USER, INDIVIDUAL, Suspended)

## 3) Image URLs Included In Seed

### Profile photos
- https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80
- https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=640&q=80

### Vehicle photos
- https://images.unsplash.com/photo-1556122071-e404cb6f31bf?auto=format&fit=crop&w=1000&q=80
- https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80
- https://images.unsplash.com/photo-1609899003078-9f04d4f0e969?auto=format&fit=crop&w=1000&q=80
- https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80
- https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80

### Shipment photos
- https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1611428811456-bf18189fd3e3?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1581092160612-7e1f2426f0d3?auto=format&fit=crop&w=1200&q=80

### Route photos
- https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1470123808288-1e59739b12d2?auto=format&fit=crop&w=1200&q=80
- https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80

## 4) Suggested Live Demo Flow (Beginning To End)

1. Login as normal user: yacine.ferhat@wesselli.demo
2. Dashboard:
- Show Active Shipments and Active Routes cards populated
- Open Notifications and mark one as read
3. Shipments:
- Open list, open details of one shipment, go back
- Open Active Shipments, edit one, then view details
4. Routes:
- Open list, show route with waypoints
- Open Active Routes, view a REGION post and an ORIGIN/DESTINATION post
5. Profile:
- Show profile photo, subscription tier, history, trucks
- Open Public Profile from a card that navigates to another user
6. Subscriptions (user side):
- Open current subscription details
7. Login as admin: admin.live@wesselli.demo
8. Admin Panel:
- Show dashboard metrics
- Open Users List, suspend/activate a user
- Open Subscriptions list, filter by tier/status
- View any subscription details, update tier/status/end date, then go back
9. CSV Export:
- Export users/routes/shipments from Admin panel

## 5) Important Notes

- Seed script resets existing database data before inserting demo data.
- All seeded users are `isVerified = true` to avoid verification blockers in live demo navigation.
- One suspended user is included to demo admin moderation states.
- One user has no subscription to test Free fallback behavior in profile and plans screens.
