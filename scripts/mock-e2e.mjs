import WebSocket from "ws";

const api = process.env.BAZZATO_API_URL ?? "http://localhost:4000";
const customerPhone = "9876543210";
const adminPhone = process.env.BAZZATO_ADMIN_PHONE ?? "1234567890";
const vendorPhone = process.env.BAZZATO_VENDOR_PHONE ?? "966511112222";
const H = { "Content-Type": "application/json" };
const log = (step, data) => console.log(`\n[${step}]`, JSON.stringify(data, null, 2));

async function req(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${url} -> ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function requestVendorOtp(ownerPhone) {
  const otp = await req(`${api}/vendor/request-otp`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ ownerPhone })
  });

  return otp.otp ?? "1234";
}

async function requestAdminOtp(phone) {
  const otp = await req(`${api}/vendor/admin/request-otp`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ phone })
  });

  return otp.otp ?? "1234";
}

async function trackToCompleted({ orderId, token, vendorToken }) {
  const wsUrl = `${api.replace(/^http/, "ws")}/orders/${orderId}/live?token=${encodeURIComponent(token)}`;
  const seen = [];
  const targets = ["accepted", "preparing", "ready", "completed"];
  let i = 0;
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out. Seen: ${seen}`)), 15000);
    const advance = async () => {
      if (i >= targets.length) return;
      const status = targets[i++];
      await req(`${api}/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { ...H, Authorization: `Bearer ${vendorToken}` },
        body: JSON.stringify({ status })
      });
    };
    ws.on("open", () => setTimeout(advance, 250));
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      seen.push(msg.order.status);
      if (msg.order.status === "completed") { clearTimeout(timeout); ws.close(); resolve(); }
      else setTimeout(advance, 250);
    });
    ws.on("error", reject);
  });
  return seen;
}

async function main() {
  console.log(`Testing against ${api} (mock OTP / in-memory)\n${"=".repeat(50)}`);

  const health = await req(`${api}/health`);
  log("1. health", health);

  // --- Customer OTP login ---
  const otp = await req(`${api}/auth/request-otp`, { method: "POST", headers: H, body: JSON.stringify({ phone: customerPhone }) });
  log("2. request-otp", otp);
  const verified = await req(`${api}/auth/verify-otp`, { method: "POST", headers: H, body: JSON.stringify({ phone: customerPhone, otp: otp.otp ?? "1234" }) });
  log("3. verify-otp", verified);
  const customerToken = verified.token;
  if (!customerToken) throw new Error("No customer token returned (is NODE_ENV=production?)");

  // --- Browse catalog ---
  const shops = await req(`${api}/catalog/shops?limit=5`);
  log("4. catalog/shops", { count: shops.shops.length, shops: shops.shops.map((s) => ({ id: s.id, name: s.name })) });
  const shopId = shops.shops[0].id;

  // --- Vendor login + add a product ---
  const vendorOtp = await requestVendorOtp(vendorPhone);
  const vendorLogin = await req(`${api}/vendor/login`, { method: "POST", headers: H, body: JSON.stringify({ ownerPhone: vendorPhone, otp: vendorOtp }) });
  log("5. vendor/login", { shop: vendorLogin.shop?.name, shopId: vendorLogin.shop?.id });
  const product = { id: "mock-e2e-mango", name: "Mock E2E Mango", category: "Fruits", unit: "1 kg", price: 60, mrp: 90, inStock: true };
  const saved = await req(`${api}/vendor/shops/${vendorLogin.shop.id}/products`, {
    method: "PUT", headers: { ...H, Authorization: `Bearer ${vendorLogin.token}` }, body: JSON.stringify(product)
  });
  log("6. vendor add product", { id: saved.product.id, name: saved.product.name, price: saved.product.price });

  // --- Confirm product visible in catalog ---
  const prods = await req(`${api}/catalog/shops/${vendorLogin.shop.id}/products`);
  const found = prods.products.find((p) => p.id === product.id);
  log("7. catalog product visible", { found: Boolean(found), name: found?.name });

  // --- Customer places order ---
  const created = await req(`${api}/orders`, {
    method: "POST", headers: { ...H, Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      phone: customerPhone,
      shopId: vendorLogin.shop.id,
      deliveryAddress: "12 Mock Street",
      deliveryLatitude: 24.6723896,
      deliveryLongitude: 46.7128945,
      items: [{ productId: product.id, quantity: 2 }]
    })
  });
  log("8. create order", { id: created.order.id, orderNumber: created.order.orderNumber, total: created.order.total, status: created.order.status });

  // --- Live status progression over WebSocket ---
  const statuses = await trackToCompleted({ orderId: created.order.id, token: customerToken, vendorToken: vendorLogin.token });
  log("9. realtime statuses (WS)", statuses);

  // --- Final fetch + admin summary ---
  const fetched = await req(`${api}/orders/${created.order.id}`, { headers: { Authorization: `Bearer ${customerToken}` } });
  log("10. final order", { status: fetched.order.status, shopName: fetched.order.shopName });
  const adminOtp = await requestAdminOtp(adminPhone);
  const adminLogin = await req(`${api}/vendor/admin/login`, { method: "POST", headers: H, body: JSON.stringify({ phone: adminPhone, otp: adminOtp }) });
  const adminSummary = await req(`${api}/vendor/admin/summary`, { headers: { Authorization: `Bearer ${adminLogin.token}` } });
  log("11. admin summary", adminSummary.totals);

  console.log(`\n${"=".repeat(50)}\nPASS — full mock flow OK: OTP login -> catalog -> order -> live tracking -> completed`);
}

main().catch((e) => { console.error("\nFAIL:", e.message); process.exit(1); });
