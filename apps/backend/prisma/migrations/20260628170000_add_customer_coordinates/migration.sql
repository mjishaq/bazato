ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);

CREATE INDEX IF NOT EXISTS "User_role_latitude_longitude_idx"
ON "User"("role", "latitude", "longitude");
