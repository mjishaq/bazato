# Backend Next Steps

The backend now supports configurable infrastructure and model-oriented code:

- `DATA_SOURCE=memory` keeps the local demo fast.
- `DATA_SOURCE=postgres` switches catalog and order repositories to Prisma/Postgres.
- `OTP_PROVIDER=mock` keeps local OTP development simple.
- `OTP_PROVIDER=sms` is isolated behind an OTP service, so a real SMS vendor can be added without changing routes or screens.
- Keycloak settings are provided through `KEYCLOAK_ISSUER`, `KEYCLOAK_JWKS_URL`, and `KEYCLOAK_AUDIENCE`.

## Local Postgres and Keycloak

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

## Keycloak Setup

Keycloak is configured by script:

```powershell
npm run setup:keycloak
```

This imports:

- Realm: `bazzato`
- API audience client: `bazzato-api`
- Mobile public PKCE client: `bazzato-mobile`
- Roles: `customer`, `vendor`, `admin`
- Test customer: `9876543210 / Test@1234`

Then set:

```powershell
$env:KEYCLOAK_ISSUER="http://localhost:8080/realms/bazzato"
$env:KEYCLOAK_JWKS_URL="http://localhost:8080/realms/bazzato/protocol/openid-connect/certs"
$env:KEYCLOAK_AUDIENCE="bazzato-api"
```

For mobile Keycloak login, set:

```powershell
$env:EXPO_PUBLIC_AUTH_PROVIDER="keycloak"
$env:EXPO_PUBLIC_KEYCLOAK_ISSUER="http://YOUR_LAPTOP_IP:8080/realms/bazzato"
$env:EXPO_PUBLIC_KEYCLOAK_CLIENT_ID="bazzato-mobile"
$env:EXPO_PUBLIC_API_URL="http://YOUR_LAPTOP_IP:4000"
npm run dev:mobile
```

Keep `EXPO_PUBLIC_AUTH_PROVIDER=mock-otp` for quick local OTP testing.
Use `EXPO_PUBLIC_AUTH_PROVIDER=keycloak` when testing the real Keycloak login.

## Holistic Smoke Test

Run:

```powershell
npm run smoke:holistic
```

It validates:

- Backend health
- Keycloak discovery and real token acceptance by the API
- Mock OTP request/verify path
- Vendor login and protected inventory save
- Customer catalog visibility
- COD order creation
- Realtime order status over WebSocket
- Admin login and marketplace summary

Production should run with Keycloak, locked-down CORS origins, a strong
`JWT_SECRET`, HTTPS at the edge, and a real SMS provider if OTP auth remains in
use outside Keycloak.
