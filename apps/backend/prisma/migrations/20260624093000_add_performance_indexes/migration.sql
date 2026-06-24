CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

CREATE INDEX IF NOT EXISTS "RefreshSession_userId_idx" ON "RefreshSession"("userId");
CREATE INDEX IF NOT EXISTS "RefreshSession_expiresAt_idx" ON "RefreshSession"("expiresAt");

CREATE INDEX IF NOT EXISTS "Shop_isOpen_latitude_longitude_idx" ON "Shop"("isOpen", "latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Shop_ownerId_idx" ON "Shop"("ownerId");

CREATE INDEX IF NOT EXISTS "Product_shopId_category_idx" ON "Product"("shopId", "category");
CREATE INDEX IF NOT EXISTS "Product_shopId_inStock_idx" ON "Product"("shopId", "inStock");

CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_shopId_createdAt_idx" ON "Order"("shopId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_shopId_status_idx" ON "Order"("shopId", "status");

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

CREATE INDEX IF NOT EXISTS "OrderTimeline_orderId_createdAt_idx" ON "OrderTimeline"("orderId", "createdAt");
