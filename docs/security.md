# Security Notes

## Authentication

Bazzato is prepared for Keycloak-based authentication.

Required production environment variables:

- `KEYCLOAK_ISSUER`
- `KEYCLOAK_JWKS_URL`
- `KEYCLOAK_AUDIENCE`
- `DATABASE_URL`

The backend validates bearer JWTs with Keycloak JWKS when Keycloak is configured.
In development, protected endpoints fall back to a mock user only when
`NODE_ENV` is not `production`.

## API Protection

- `helmet` is enabled for HTTP security headers.
- Global request rate limiting is enabled.
- Order APIs are protected by the auth middleware.
- Input payloads are validated with `zod`.

## Database

PostgreSQL is the target database, accessed through Prisma. The schema includes:

- Users mapped to Keycloak subjects
- Shops and shop owners
- Products
- COD orders
- Order items
- Order status timeline

## Production Follow-ups

- Disable mock OTP and use an SMS provider.
- Enforce HTTPS at the deployment layer.
- Configure CORS to known app/web origins.
- Store secrets outside source control.
- Add audit logging for order status changes.

## Local Security Test Coverage

`npm run smoke:holistic` verifies that:

- The scripted Keycloak realm issues a token with `aud=bazzato-api`.
- The backend accepts that Keycloak token for protected customer APIs.
- Vendor and admin APIs require signed app-role tokens.
- Realtime order tracking rejects unauthenticated sockets and uses the same
  customer identity as the protected order APIs.
