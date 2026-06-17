# Phase 0 - Foundation

## Goal

Create the baseline project structure for Bazzato so customer mobile screens and backend APIs can be built phase by phase.

## Architecture

- Customer mobile app: React Native with Expo.
- Vendor web app: Next.js PWA-ready portal.
- Backend API: Node.js with Express and TypeScript.
- Database: PostgreSQL recommended for Phase 1.
- Authentication: phone number plus OTP, with customer and vendor roles.
- Payments: cash on delivery only for Phase 1.
- Notifications: push/SMS hooks prepared, provider selected later.

## Workspace Layout

```text
apps/
  mobile/
  vendor/
  backend/
packages/
  shared/
docs/
```

## Phase 1 Screen Order

1. C01 Customer Login / OTP
2. C02 Location Permission
3. C03 Nearby Map / Home
4. C04 Search / Filters
5. C05 Store Catalog
6. C06 Cart
7. C07 COD Checkout
8. C08 Order Tracking / Profile
9. V01 Vendor Login / OTP
10. V02 Vendor Dashboard
11. V03 Vendor Order Inbox
12. V04 Vendor Order Detail / Status
13. V05 Catalog Management
14. V06 Shop Settings + Earnings

## Backend Modules

- `auth`: OTP login and session management.
- `users`: customer profiles.
- `vendors`: vendor users and shop ownership.
- `shops`: shop profile, open/closed state, location, radius.
- `products`: catalog, category, stock, price.
- `orders`: COD checkout and order lifecycle.
- `notifications`: push/SMS integration boundary.

## Environment

Copy each `.env.example` file to `.env` inside the app folder and fill real values when available.
