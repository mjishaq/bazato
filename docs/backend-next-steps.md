# Backend Next Steps

The backend supports configurable infrastructure and model-oriented code:

- `DATA_SOURCE=memory` keeps a fresh clone runnable without Docker/Postgres.
- `DATA_SOURCE=postgres` switches catalog and order repositories to Prisma/Postgres.
- `OTP_PROVIDER=mock` keeps local OTP development simple.
- `OTP_PROVIDER=sms` is isolated behind an OTP service, so a real SMS vendor can be added without changing routes or screens.
- Customer, vendor, and admin sessions use app-issued JWTs signed with `JWT_SECRET`.

## Local Postgres

Start infrastructure:

```powershell
docker compose -f infra/docker-compose.dev.yml up -d
```

Or run the project setup script:

```powershell
npm run setup:infra
```

Run database setup:

```powershell
npm --workspace apps/backend run db:generate
npm --workspace apps/backend run db:migrate
npm --workspace apps/backend run db:seed
```

Use Postgres-backed routes:

```powershell
$env:DATA_SOURCE="postgres"
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bazzato"
npm run dev:backend
```

## Holistic Smoke Test

Run:

```powershell
npm run smoke:holistic
```

It validates:

- Backend health
- OTP request/verify path
- Vendor login and protected inventory save
- Customer JWT-protected order APIs
- Customer catalog visibility
- COD order creation
- Realtime order status over WebSocket
- Admin login and marketplace summary

Production should run with locked-down CORS origins, a strong `JWT_SECRET`,
HTTPS at the edge, and a real SMS provider.
