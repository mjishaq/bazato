# Security Notes

## Authentication

Bazzato uses app-issued JWTs for customer, vendor, and admin sessions.

Required production environment variables:

- `JWT_SECRET`
- `DATABASE_URL`
- `DATA_SOURCE=postgres`
- `CORS_ORIGIN`

Access tokens expire after 15 minutes. Refresh sessions are stored server-side
and can issue a new access token until the refresh expiry is reached.

## API Protection

- `helmet` is enabled for HTTP security headers.
- Global and route-specific request rate limiting are enabled.
- Order APIs require a customer JWT.
- Vendor APIs require a vendor or admin JWT.
- Input payloads are validated with `zod`.
- API errors are recorded in `AuditLog`.

## Database

PostgreSQL is the target database, accessed through Prisma. The schema includes:

- Users mapped to app auth subjects
- Refresh sessions
- Shops and shop owners
- Products
- COD orders
- Order items
- Order status timeline
- Audit logs

## Production Follow-ups

- Replace mock OTP with an SMS provider.
- Add OTP rate limiting, device session tracking, and suspicious login checks.
- Enforce HTTPS at the deployment layer.
- Configure CORS to known app/web origins.
- Store secrets outside source control.

## Local Security Test Coverage

`npm run smoke:holistic` verifies that:

- Customer APIs reject missing or invalid JWTs.
- Vendor and admin APIs require signed app-role tokens.
- Realtime order tracking rejects unauthenticated sockets and uses the same
  customer identity as the protected order APIs.
