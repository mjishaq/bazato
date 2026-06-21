# Bazzato

Bazzato is a Phase 1 nearby-store ordering product based on the supplied wireframes.

## Apps

- `apps/mobile` - React Native customer mobile app.
- `apps/vendor` - Web portal for shop owners.
- `apps/backend` - Node.js API for auth, shops, catalog, cart, orders, and notifications.

## Phase 0 Status

This repo is scaffolded as an npm workspace monorepo. The current development target is Node.js 20+.

## First Run Without Docker

Use this path for a fresh clone when Docker is not installed. It uses in-memory
mock data, mock OTP, and does not require Postgres or Keycloak.

```bash
npm install
npm run dev:backend:mock
```

In another terminal:

```bash
npm run dev:mobile
```

Optional browser preview:

```bash
npm run dev:mobile:web
```

The local machine needs Node.js 20+.

Mock login OTP is `1234`.

## Mobile + Backend

For this development machine, use the Docker-backed flow below. For another
developer without Docker, use `npm run dev:backend:mock` from the previous
section.

Start the backend:

```bash
npm run dev:backend
```

For a backend without Docker/Postgres:

```bash
npm run dev:backend:mock
```

Start Expo:

```bash
npm run dev:mobile
```

Start the vendor web portal:

```bash
npm run dev:vendor
```

For Expo Go on a physical phone, copy `apps/mobile/.env.example` to
`apps/mobile/.env` and set `EXPO_PUBLIC_API_URL` to your laptop LAN IP, such as
`http://192.168.1.25:4000`. `localhost` points to the phone itself.

The mobile login can run in two modes:

- `EXPO_PUBLIC_AUTH_PROVIDER=mock-otp` for local OTP development.
- `EXPO_PUBLIC_AUTH_PROVIDER=keycloak` for real Keycloak login.

## Backend Security And Database

- Authentication target: Keycloak.
- Database target: PostgreSQL through Prisma.
- Development mode still supports mock OTP and mock in-memory catalog/order data.
- Production mode should set `KEYCLOAK_ISSUER`, `KEYCLOAK_JWKS_URL`,
  `KEYCLOAK_AUDIENCE`, and `DATABASE_URL`.

Generate Prisma Client:

```bash
npm --workspace apps/backend run db:generate
```

Run migrations after PostgreSQL is available:

```bash
npm --workspace apps/backend run db:migrate
```

Seed shops and products:

```bash
npm --workspace apps/backend run db:seed
```

Open the local database query area:

```powershell
npm run db:studio
```

This opens Prisma Studio in the browser for viewing and editing Bazzato app
tables.

Run SQL against the Docker Postgres database:

```powershell
npm run db:shell
```

Common `psql` commands:

```sql
\dt
SELECT id, name, category FROM "Shop";
SELECT id, name, price, "shopId", "isAvailable" FROM "Product";
SELECT id, "shopName", status, total, "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;
\q
```

Run a one-off query from PowerShell:

```powershell
@'
SELECT COUNT(*) AS products FROM "Product";
'@ | npm run db:query
```

For the full local Postgres and Keycloak flow, see
[`docs/backend-next-steps.md`](docs/backend-next-steps.md).

After Docker Desktop is installed and running, the infrastructure can be started
with:

```powershell
npm run setup:infra
```

This starts app Postgres, Keycloak Postgres, and Keycloak, applies additive
Prisma migrations, seeds catalog data, and imports the local Keycloak realm.

Run the holistic local smoke test:

```powershell
npm run smoke:holistic
```

The smoke test verifies backend health, Keycloak token validation, OTP auth,
vendor inventory, mobile catalog APIs, order creation, realtime tracking, and
admin summary.

Local Keycloak test user:

```text
Username: 9876543210
Password: Test@1234
Client: bazzato-mobile
Realm: bazzato
```
